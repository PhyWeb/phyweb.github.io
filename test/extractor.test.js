import test from 'node:test';
import assert from 'node:assert';

// Mock the DOM and other dependencies before importing EXTRACTOR
global.document = {
  querySelector: (sel) => {
    return global.mockDOM[sel] || { 
      checked: false, 
      value: "", 
      classList: { add: ()=>{}, remove: ()=>{} }, 
      innerHTML: "", 
      className: "" 
    };
  },
  getElementById: (id) => null,
  createElement: () => ({ 
    classList: { add: ()=>{}, remove: ()=>{} }, 
    style: {}, 
    appendChild: ()=>{},
    addEventListener: ()=>{},
    setAttribute: ()=>{},
    dataset: {}
  }),
  body: { appendChild: ()=>{} }
};
global.URL = { createObjectURL: ()=>{}, revokeObjectURL: ()=>{} };
global.OffscreenCanvas = class { 
  getContext() { 
    return { save:()=>{}, restore:()=>{}, translate:()=>{}, rotate:()=>{}, drawImage: ()=>{} }; 
  } 
};
global.VideoDecoder = class {
  static async isConfigSupported() { return { supported: true }; }
  configure() {}
  decode() {}
  flush() {}
  close() {}
};

test('EXTRACTOR updateSize with NaN/empty duration inputs does not evaluate size to 0', async () => {
    const { default: EXTRACTOR } = await import('../tracker/modules/extractor.js');

    // Setup mock DOM state with invalid start and end inputs
    global.mockDOM = {
        '#def-size-input': { checked: false },
        '#fps-size-input': { checked: false },
        '#duration-size-input': { checked: true },
        '#start-size-input': { value: '' }, // parses as NaN
        '#end-size-input': { value: 'invalid' }, // parses as NaN
        '#size-label': {},
        '#open-resized-video': {},
        '#file-size-warning': { classList: { add: ()=>{}, remove: ()=>{} } }
    };

    const ex = new EXTRACTOR();
    ex.height = 1080;
    ex.width = 1920;
    ex.fps = 30;
    ex.duration = 100; // 100 seconds
    
    // Trigger size evaluation
    ex.updateSize();
    
    // In the old flawed logic, duration would be max(0, 0 - 0) = 0.
    // The fixed logic should fallback to `this.duration` (100) if rawEnd is NaN.
    // Size = ceil(1080 * 1920 * 0.5 * (100 * 30) / (1024*1024)) = 2967 MB
    assert.strictEqual(
      ex.size > 0, 
      true, 
      "Size should be significantly greater than 0 with empty/invalid inputs"
    );
    assert.strictEqual(
      ex.size, 
      2967, 
      "Calculated size does not match expected full video size"
    );
});

test('EXTRACTOR extract correctly assigns default bounds for NaN inputs', async () => {
    const { default: EXTRACTOR } = await import('../tracker/modules/extractor.js');

    global.mockDOM = {
        '#def-size-input': { checked: false },
        '#fps-size-input': { checked: false },
        '#duration-size-input': { checked: true },
        '#start-size-input': { value: '' }, // NaN
        '#end-size-input': { value: '' }, // NaN
        '#extract-decode-progress': {},
        '#extract-loading-modal': { remove: ()=>{} },
        '#new-modal': { classList: { add: ()=>{}, remove: ()=>{} } }
    };
    
    const ex = new EXTRACTOR();
    ex.duration = 100; // 100 seconds
    ex.checksizeCB = () => {};
    ex.demuxerType = 'web-demuxer';
    ex.track = { movie_duration: 100000, movie_timescale: 1000 };
    
    // The objective is to verify that `ex.decodedVideo.duration` doesn't evaluate as if it was 
    // extracting from 0 to Infinity natively causing out of bounds extraction of nothing.
    // We can't easily check local variables startTime and endTime natively, 
    // but decodedVideo.duration reflects the difference.
    
    // Actually, in the code decodedVideo.duration = Math.max(0, endTime - startTime) * 1000.
    // If endTime is fallback to this.duration (100) and startTime to 0, 
    // decodedVideo.duration should be 100000.
    ex.extract();

    assert.strictEqual(
      ex.decodedVideo.duration, 
      100000, 
      "Decoded video duration should correspond to the full duration fallback"
    );
});
