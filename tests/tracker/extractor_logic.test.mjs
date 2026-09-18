import '../helpers/setup.mjs';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

describe('Tracker Extractor Logic', () => {
  // Test simulation of the output(frame) logic in extractor.js
  function simulateOutputFrames({
    allFrames,
    durationReduction = false,
    startTime = 0,
    endTime = Infinity,
    fpsReduction = false,
    nbSamples = null
  }) {
    const decodedVideo = {
      duration: durationReduction ? (endTime - startTime) * 1000 : 2000,
      frames: [],
      timestamps: []
    };

    let candidateFrameCount = 0;
    let savedFrameCount = 0;
    let canceled = false;
    let finishTriggered = false;
    let isOver = false;
    let firstFrameTimestamp = null;

    const triggerFinish = () => {
      finishTriggered = true;
    };

    for (const frame of allFrames) {
      if (isOver || canceled) {
        continue;
      }

      const frameTimeSec = frame.timestamp / 1e6;

      // Frames before start time
      if (durationReduction && frameTimeSec < startTime) {
        continue;
      }

      // Frame is after end time: finish extraction immediately
      if (durationReduction && frameTimeSec > endTime) {
        isOver = true;
        triggerFinish();
        continue;
      }

      // FPS reduction: keep 1 frame out of 2
      if (fpsReduction && candidateFrameCount % 2 === 1) {
        candidateFrameCount++;
        continue;
      }
      candidateFrameCount++;

      if (firstFrameTimestamp === null) {
        firstFrameTimestamp = frame.timestamp;
      }

      let currentIndex = savedFrameCount;
      savedFrameCount++;

      decodedVideo.timestamps[currentIndex] = (frame.timestamp - firstFrameTimestamp) / 1e6;
      decodedVideo.frames[currentIndex] = { id: currentIndex, src: `blob:frame${currentIndex}` };

      if (nbSamples && !durationReduction && !fpsReduction) {
        if (savedFrameCount >= nbSamples) {
          isOver = true;
          triggerFinish();
        }
      }
    }

    if (decodedVideo.timestamps.length > 1) {
      decodedVideo.duration = (decodedVideo.timestamps[decodedVideo.timestamps.length - 1] - decodedVideo.timestamps[0]) * 1000;
    }

    return { decodedVideo, finishTriggered };
  }

  // Generate 60 frames (2 seconds at 30 fps, dt ~ 33.333 ms)
  function generateMockFrames(count = 60, intervalMs = 33.333) {
    const frames = [];
    for (let i = 0; i < count; i++) {
      frames.push({
        timestamp: Math.round(i * intervalMs * 1000), // in microseconds
        duration: Math.round(intervalMs * 1000)
      });
    }
    return frames;
  }

  it('ne doit conserver aucune frame au-delà de endTime et préserver les pas de 33ms', () => {
    const mockFrames = generateMockFrames(60, 33.3333); // 0s to 2s
    const startTime = 0.5; // 500 ms
    const endTime = 1.2;   // 1200 ms

    const { decodedVideo, finishTriggered } = simulateOutputFrames({
      allFrames: mockFrames,
      durationReduction: true,
      startTime,
      endTime,
      fpsReduction: false
    });

    assert.equal(finishTriggered, true);
    // Number of frames between 0.5s and 1.2s:
    // Frames with t in [0.5, 1.2]: 500ms / 33.333 ~ 15 to 1200ms / 33.333 ~ 36 (around 22 frames)
    assert.ok(decodedVideo.frames.length >= 21 && decodedVideo.frames.length <= 22);
    assert.equal(decodedVideo.timestamps.length, decodedVideo.frames.length);

    // Check that timestamps start at 0
    assert.equal(decodedVideo.timestamps[0], 0);

    // Check that every timestamp interval is approx 33.33 ms
    for (let i = 1; i < decodedVideo.timestamps.length; i++) {
      const dt = (decodedVideo.timestamps[i] - decodedVideo.timestamps[i - 1]) * 1000;
      assert.ok(Math.abs(dt - 33.333) < 1.0, `Expected dt ~33.3ms, got ${dt}ms at index ${i}`);
    }

    // Check that no frame has an undefined hole
    for (let i = 0; i < decodedVideo.frames.length; i++) {
      assert.ok(decodedVideo.frames[i] !== undefined, `Frame at ${i} should not be undefined`);
      assert.ok(decodedVideo.timestamps[i] !== undefined, `Timestamp at ${i} should not be undefined`);
    }
  });

  it('doit empaqueter les frames de manière contiguë sans trou undefined lors de la réduction de fps', () => {
    const mockFrames = generateMockFrames(60, 33.3333); // 60 frames

    const { decodedVideo } = simulateOutputFrames({
      allFrames: mockFrames,
      durationReduction: false,
      fpsReduction: true,
      nbSamples: 60
    });

    // Exactly 30 frames kept (half of 60)
    assert.equal(decodedVideo.frames.length, 30);
    assert.equal(decodedVideo.timestamps.length, 30);

    // Strictly contiguous without any undefined
    for (let i = 0; i < decodedVideo.frames.length; i++) {
      assert.ok(decodedVideo.frames[i] !== undefined, `Frame ${i} must not be undefined`);
      assert.ok(decodedVideo.timestamps[i] !== undefined, `Timestamp ${i} must not be undefined`);
    }

    // Time step between frames should be ~66.67 ms (twice 33.33ms)
    for (let i = 1; i < decodedVideo.timestamps.length; i++) {
      const dt = (decodedVideo.timestamps[i] - decodedVideo.timestamps[i - 1]) * 1000;
      assert.ok(Math.abs(dt - 66.667) < 2.0, `Expected dt ~66.7ms, got ${dt}ms at index ${i}`);
    }
  });

  it('doit combiner réduction de durée et réduction de fps proprement', () => {
    const mockFrames = generateMockFrames(60, 33.3333);
    const startTime = 0.5;
    const endTime = 1.5;

    const { decodedVideo } = simulateOutputFrames({
      allFrames: mockFrames,
      durationReduction: true,
      startTime,
      endTime,
      fpsReduction: true
    });

    // [0.5, 1.5] s contains ~31 frames, halved ~15-16 frames
    assert.ok(decodedVideo.frames.length >= 15 && decodedVideo.frames.length <= 16);
    assert.equal(decodedVideo.timestamps[0], 0);

    // Check contiguity
    for (let i = 0; i < decodedVideo.frames.length; i++) {
      assert.ok(decodedVideo.frames[i] !== undefined);
      assert.ok(decodedVideo.timestamps[i] !== undefined);
    }
  });
});

