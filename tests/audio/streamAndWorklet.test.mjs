import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

// Configuration de l'environnement AudioWorklet global pour charger processor-node.js
class MockAudioWorkletProcessor {
  constructor() {
    this.port = {
      onmessage: null,
      messages: [],
      postMessage(msg) {
        this.messages.push(msg);
      }
    };
  }
}

const registeredProcessors = new Map();
globalThis.AudioWorkletProcessor = MockAudioWorkletProcessor;
globalThis.registerProcessor = (name, proc) => {
  registeredProcessors.set(name, proc);
};

// Import de processor-node.js qui s'enregistre via registerProcessor
await import('../../audio/modules/processor-node.js');
const ProcessorNode = registeredProcessors.get('processor-node');

// Import de PhyAudio
import { PhyAudio } from '../../audio/modules/audio.js';

describe('Audio - Sécurité et gestion du Worklet (processor-node.js)', () => {
  it('enregistre bien le processor "processor-node"', () => {
    assert.ok(ProcessorNode, 'ProcessorNode doit être enregistré');
  });

  describe('Garde de sécurité dans process()', () => {
    it('gère inputs vide sans lever d\'exception et retourne true', () => {
      const processor = new ProcessorNode();
      const res = processor.process([], [[]], {});
      assert.equal(res, true);
    });

    it('gère inputs[0] vide (canal non prêt) sans lever d\'exception et retourne true', () => {
      const processor = new ProcessorNode();
      const res = processor.process([[]], [[]], {});
      assert.equal(res, true);
    });

    it('gère inputs[0][0] undefined sans lever d\'exception et retourne true', () => {
      const processor = new ProcessorNode();
      const res = processor.process([ [undefined] ], [[]], {});
      assert.equal(res, true);
    });

    it('traite les données normalement quand inputs[0][0] est présent', () => {
      const processor = new ProcessorNode();
      const input = new Float32Array([0.5, -0.5, 0.25]);
      const output = new Float32Array(3);
      const res = processor.process([[input]], [[output]], {});

      assert.equal(res, true);
      assert.equal(processor.bytesWritten, 3);
      assert.deepEqual(Array.from(output), [0.5, -0.5, 0.25]);
    });
  });

  describe('Écoute des messages sur port (flush et stop)', () => {
    it('vide le buffer partiel et émet "data" puis "stop" sur réception de flush', () => {
      const processor = new ProcessorNode();
      const input = new Float32Array([0.25, 0.5, 0.75]);
      processor.process([[input]], [[new Float32Array(3)]], {});

      assert.equal(processor.bytesWritten, 3);
      assert.equal(processor.port.messages.length, 0);

      // Envoi du message de flush
      processor.port.onmessage({ data: { eventType: 'flush' } });

      // Doit avoir émis deux messages : 'data' contenant les 3 éléments, puis 'stop'
      assert.equal(processor.port.messages.length, 2);
      assert.equal(processor.port.messages[0].eventType, 'data');
      assert.equal(processor.port.messages[0].audioBuffer.length, 3);
      assert.deepEqual(Array.from(processor.port.messages[0].audioBuffer), [0.25, 0.5, 0.75]);
      assert.equal(processor.port.messages[1].eventType, 'stop');

      // Le buffer doit avoir été réinitialisé
      assert.equal(processor.bytesWritten, 0);
      assert.equal(processor.isBufferEmpty(), true);
    });

    it('émet uniquement "stop" sans "data" si le buffer est vide lors du flush', () => {
      const processor = new ProcessorNode();
      assert.equal(processor.isBufferEmpty(), true);

      processor.port.onmessage({ data: { eventType: 'flush' } });

      assert.equal(processor.port.messages.length, 1);
      assert.equal(processor.port.messages[0].eventType, 'stop');
    });
  });
});

describe('Audio - Gestion du flux micro et arrêt anticipé (audio.js)', () => {
  describe('stopMediaStream() et fuite matérielle du micro', () => {
    it('arrête toutes les pistes actives du mediaStream et le met à null', () => {
      const audio = new PhyAudio(2048);
      let track1Stopped = false;
      let track2Stopped = false;

      audio.mediaStream = {
        getTracks: () => [
          { stop: () => { track1Stopped = true; } },
          { stop: () => { track2Stopped = true; } }
        ]
      };

      audio.stopMediaStream();

      assert.equal(track1Stopped, true, 'Track 1 doit être arrêtée');
      assert.equal(track2Stopped, true, 'Track 2 doit être arrêtée');
      assert.equal(audio.mediaStream, null, 'mediaStream doit être remis à null');
    });

    it('ne plante pas si mediaStream est null ou non initialisé', () => {
      const audio = new PhyAudio(2048);
      assert.doesNotThrow(() => audio.stopMediaStream());
    });

    it('close() appelle stopMediaStream() et ferme audioCtx', () => {
      const audio = new PhyAudio(2048);
      let tracksStopped = false;
      let ctxClosed = false;

      audio.mediaStream = {
        getTracks: () => [{ stop: () => { tracksStopped = true; } }]
      };
      audio.audioCtx = {
        close: () => { ctxClosed = true; }
      };

      audio.close();

      assert.equal(tracksStopped, true);
      assert.equal(audio.mediaStream, null);
      assert.equal(ctxClosed, true);
    });
  });

  describe('startAudio(_mode) et cycle de vie AudioContext / AudioWorklet', () => {
    let createdContexts = [];
    let stoppedTracks = [];

    beforeEach(() => {
      createdContexts = [];
      stoppedTracks = [];

      globalThis.AudioContext = class {
        constructor() {
          this.closed = false;
          this.resumed = false;
          this.sampleRate = 44100;
          this.audioWorklet = {
            modules: [],
            addModule: async (url) => {
              this.audioWorklet.modules.push(url);
            }
          };
          createdContexts.push(this);
        }
        close() { this.closed = true; }
        resume() { this.resumed = true; }
        createMediaStreamSource() { return { connect: (n) => n }; }
        createGain() { return { connect: (n) => n, gain: { setValueAtTime: () => {} } }; }
        createAnalyser() { return {}; }
      };

      const mockMediaDevices = {
        getUserMedia: async () => ({
          getTracks: () => [
            { stop: () => { stoppedTracks.push(Date.now()); } }
          ]
        })
      };

      try {
        Object.defineProperty(globalThis, 'navigator', {
          value: { mediaDevices: mockMediaDevices },
          configurable: true,
          writable: true
        });
      } catch {
        globalThis.navigator.mediaDevices = mockMediaDevices;
      }
    });

    it('arrête le MediaStream précédent avant de créer un nouvel AudioContext', async () => {
      const audio = new PhyAudio(2048);
      let priorTrackStopped = false;
      audio.mediaStream = {
        getTracks: () => [{ stop: () => { priorTrackStopped = true; } }]
      };

      await audio.startAudio('RT');

      assert.equal(priorTrackStopped, true, 'L\'ancien flux micro doit être arrêté à l\'entrée de startAudio');
      assert.ok(audio.mediaStream, 'Un nouveau mediaStream doit être assigné');
    });

    it('ferme le contexte audio précédent lors de startAudio', async () => {
      const audio = new PhyAudio(2048);
      await audio.startAudio('RT');
      const firstCtx = audio.audioCtx;
      assert.equal(firstCtx.closed, false);

      await audio.startAudio('RT');
      assert.equal(firstCtx.closed, true, 'Le premier contexte doit avoir été fermé');
      assert.notEqual(audio.audioCtx, firstCtx, 'Un nouveau contexte doit être créé');
    });

    it('ne charge PAS le module AudioWorklet en mode "RT"', async () => {
      const audio = new PhyAudio(2048);
      await audio.startAudio('RT');
      assert.equal(audio.audioCtx.audioWorklet.modules.length, 0, 'Le worklet ne doit pas être chargé en RT');
    });

    it('charge systématiquement le module AudioWorklet en mode "REC" sur le nouveau contexte', async () => {
      // Mock global AudioWorkletNode
      globalThis.AudioWorkletNode = class {
        constructor() {
          this.port = { onmessage: null };
        }
      };

      const audio = new PhyAudio(2048);
      await audio.startAudio('REC');
      assert.equal(audio.audioCtx.audioWorklet.modules.length, 1);
      assert.equal(audio.audioCtx.audioWorklet.modules[0], 'modules/processor-node.js');

      // Deuxième appel à startAudio('REC') : doit charger sur le NOUVEAU contexte
      await audio.startAudio('REC');
      assert.equal(audio.audioCtx.audioWorklet.modules.length, 1, 'Le nouveau contexte doit aussi recevoir le module');
      assert.equal(createdContexts.length, 2);
    });
  });

  describe('Arrêt anticipé du sample (stopRecording & getRecord)', () => {
    it('stopRecording() ajuste recordLength et envoie flush au processorNode sans modifier l\'état de manière synchrone', () => {
      const audio = new PhyAudio(2048);
      audio.startTime = performance.now() - 500; // 500ms d'enregistrement
      audio.recording = true;
      audio.data = [new Int16Array(100)]; // Déjà un chunk reçu

      let postedMessage = null;
      audio.processorNode = {
        port: {
          postMessage: (msg) => { postedMessage = msg; }
        }
      };

      audio.stopRecording();

      assert.ok(audio.recordLength >= 0.49 && audio.recordLength <= 0.6, 'recordLength doit être ajusté au temps écoulé');
      assert.deepEqual(postedMessage, { eventType: 'flush' }, 'Un message flush doit être envoyé au processorNode');
      assert.equal(audio.availableData, undefined, 'availableData ne doit pas changer de manière synchrone');
      assert.equal(audio.recording, true, 'recording reste true jusqu\'à réception de stop');
    });

    it('la réception de l\'événement stop valide les données et arrête l\'enregistrement si des données existent', async () => {
      const audio = new PhyAudio(2048);
      await audio.startAudio('REC');

      audio.recording = true;
      audio.data = [new Int16Array([1, 2, 3])];

      // Émission de l'événement stop par le worklet
      audio.processorNode.port.onmessage({ data: { eventType: 'stop' } });

      assert.equal(audio.availableData, true, 'availableData passe à true à la réception de stop');
      assert.equal(audio.recording, false, 'recording passe à false à la réception de stop');
    });

    it('la réception de l\'événement stop ne valide pas les données si le buffer est encore vide', async () => {
      const audio = new PhyAudio(2048);
      await audio.startAudio('REC');

      audio.recording = true;
      audio.data = [];

      audio.processorNode.port.onmessage({ data: { eventType: 'stop' } });

      assert.equal(audio.availableData, undefined, 'availableData reste undefined si data est vide');
      assert.equal(audio.recording, true, 'recording reste true');
    });

    it('getRecord() concatène fidèlement les chunks de tailles hétérogènes (flush partiel)', () => {
      const audio = new PhyAudio(2048);
      audio.audioCtx = { sampleRate: 1000 };
      audio.recordLength = 0.5; // 0.5s * 1000 = 500 échantillons demandés
      audio.availableData = true;

      // Premier chunk plein (300 échantillons), second chunk partiel issu d'un flush (250 échantillons)
      const chunk1 = new Int16Array(300).fill(1);
      const chunk2 = new Int16Array(250).fill(2);
      audio.data = [chunk1, chunk2];

      const record = audio.getRecord();

      assert.equal(record.length, 500, 'Doit tronquer exactement à recordLength * sampleRate');
      assert.equal(record[0], 1, 'Premier chunk présent au début');
      assert.equal(record[299], 1, 'Fin du premier chunk');
      assert.equal(record[300], 2, 'Second chunk contigu sans décalage');
      assert.equal(record[499], 2, 'Fin de l\'échantillon tronqué');
      assert.equal(audio.availableData, false, 'availableData doit être réinitialisé à false');
      assert.equal(audio.delay, -1, 'delay doit être réinitialisé à -1');
    });

    it('getRecord() fonctionne correctement même si totalLength est inférieur à recordLength * sampleRate', () => {
      const audio = new PhyAudio(2048);
      audio.audioCtx = { sampleRate: 1000 };
      audio.recordLength = 1.0; // 1000 demandés
      const chunk1 = new Int16Array(200).fill(42);
      audio.data = [chunk1];

      const record = audio.getRecord();

      assert.equal(record.length, 200, 'Retourne l\'intégralité des données disponibles sans débordement');
      assert.equal(record[199], 42);
    });

    it('getRecord() avec un buffer data vide retourne un Int16Array vide sans planter', () => {
      const audio = new PhyAudio(2048);
      audio.audioCtx = { sampleRate: 44100 };
      audio.recordLength = 0;
      audio.data = [];

      const record = audio.getRecord();
      assert.equal(record.length, 0);
      assert.ok(record instanceof Int16Array);
    });
  });
});

