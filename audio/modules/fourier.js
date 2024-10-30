/* 
 * Free FFT and convolution (JavaScript)
 * 
 * Copyright (c) 2014 Project Nayuki
 * http://www.nayuki.io/page/free-small-fft-in-multiple-languages
 *
 * (MIT License)
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 * - The above copyright notice and this permission notice shall be included in
 *   all copies or substantial portions of the Software.
 * - The Software is provided "as is", without warranty of any kind, express or
 *   implied, including but not limited to the warranties of merchantability,
 *   fitness for a particular purpose and noninfringement. In no event shall the
 *   authors or copyright holders be liable for any claim, damages or other
 *   liability, whether in an action of contract, tort or otherwise, arising from,
 *   out of or in connection with the Software or the use or other dealings in the
 *   Software.
 *
 * Slightly restructured by Chris Cannam, cannam@all-day-breakfast.com
 * Slightly modified by Gaétan Walter
 */

"use strict";

/* 
 * Construct an object for calculating the discrete Fourier transform (DFT) of size n, where n is a power of 2.
 */
function Nayuki(n) {
    
    this.n = n;
    this.levels = -1;

    for (var i = 0; i < 32; i++) {
        if (1 << i == n) {
            this.levels = i;  // Equal to log2(n)
	}
    }
    if (this.levels == -1) {
        throw "Length is not a power of 2";
    }
    
    // Pre-compute trigonometric tables
    this.cosTable = new Array(n / 2);
    this.sinTable = new Array(n / 2);
    for (var i = 0; i < n / 2; i++) {
        this.cosTable[i] = Math.cos(2 * Math.PI * i / n);
        this.sinTable[i] = Math.sin(2 * Math.PI * i / n);
    }

    /* 
     * Computes the discrete Fourier transform (DFT) of the given complex vector, storing the result back into the vector.
     * The vector's length must be equal to the size n that was passed to the object constructor, and this must be a power of 2. Uses the Cooley-Tukey decimation-in-time radix-2 algorithm.
     * Modified to use trigonometric table
     */
    this.fastTransformRadix2 = function(real, imag) {
        var n = this.n;
	
        // Bit-reversed addressing permutation
        for (var i = 0; i < n; i++) {
            var j = reverseBits(i, this.levels);
            if (j > i) {
                var temp = real[i];
                real[i] = real[j];
                real[j] = temp;
                temp = imag[i];
                imag[i] = imag[j];
                imag[j] = temp;
            }
        }
    
        // Cooley-Tukey decimation-in-time radix-2 FFT
        for (var size = 2; size <= n; size *= 2) {
            var halfsize = size / 2;
            var tablestep = n / size;
            for (var i = 0; i < n; i += size) {
                for (var j = i, k = 0; j < i + halfsize; j++, k += tablestep) {
                        var tpre =  real[j+halfsize] * this.cosTable[k] +
                        imag[j+halfsize] * this.sinTable[k];
                        var tpim = -real[j+halfsize] * this.sinTable[k] +
                        imag[j+halfsize] * this.cosTable[k];
                        real[j + halfsize] = real[j] - tpre;
                        imag[j + halfsize] = imag[j] - tpim;
                        real[j] += tpre;
                        imag[j] += tpim;
                }
            }
        }
    
        // Returns the integer whose value is the reverse of the lowest 'bits' bits of the integer 'x'.
        function reverseBits(x, bits) {
            var y = 0;
            for (var i = 0; i < bits; i++) {
                y = (y << 1) | (x & 1);
                x >>>= 1;
            }
            return y;
        }
    }

    this.transformRadix2 = function(real, imag) {
        // Length variables
        var n = real.length;
        if (n != imag.length)
            throw "Mismatched lengths";
        if (n == 1)  // Trivial transform
            return;
        var levels = -1;
        for (var i = 0; i < 32; i++) {
            if (1 << i == n)
                levels = i;  // Equal to log2(n)
        }
        if (levels == -1)
            throw "Length is not a power of 2";
        
        // Trigonometric tables
        var cosTable = new Array(n / 2);
        var sinTable = new Array(n / 2);
        for (var i = 0; i < n / 2; i++) {
            cosTable[i] = Math.cos(2 * Math.PI * i / n);
            sinTable[i] = Math.sin(2 * Math.PI * i / n);
        }
        
        // Bit-reversed addressing permutation
        for (var i = 0; i < n; i++) {
            var j = reverseBits(i, levels);
            if (j > i) {
                var temp = real[i];
                real[i] = real[j];
                real[j] = temp;
                temp = imag[i];
                imag[i] = imag[j];
                imag[j] = temp;
            }
        }
        
        // Cooley-Tukey decimation-in-time radix-2 FFT
        for (var size = 2; size <= n; size *= 2) {
            var halfsize = size / 2;
            var tablestep = n / size;
            for (var i = 0; i < n; i += size) {
                for (var j = i, k = 0; j < i + halfsize; j++, k += tablestep) {
                    var l = j + halfsize;
                    var tpre =  real[l] * cosTable[k] + imag[l] * sinTable[k];
                    var tpim = -real[l] * sinTable[k] + imag[l] * cosTable[k];
                    real[l] = real[j] - tpre;
                    imag[l] = imag[j] - tpim;
                    real[j] += tpre;
                    imag[j] += tpim;
                }
            }
        }
        
        // Returns the integer whose value is the reverse of the lowest 'bits' bits of the integer 'x'.
        function reverseBits(x, bits) {
            var y = 0;
            for (var i = 0; i < bits; i++) {
                y = (y << 1) | (x & 1);
                x >>>= 1;
            }
            return y;
        }
    }

    /* 
    * Computes the inverse discrete Fourier transform (IDFT) of the given complex vector, storing the result back into the vector.
    * The vector can have any length. This is a wrapper function. This transform does not perform scaling, so the inverse is not a true inverse.
    */
    this.inverseTransform = function(real, imag) {
        this.transformRadix2(imag, real);
    }

    /* 
    * Computes the discrete Fourier transform (DFT) of the given complex vector, storing the result back into the vector.
    * The vector can have any length. This requires the convolution function, which in turn requires the radix-2 FFT function.
    * Uses Bluestein's chirp z-transform algorithm.
    */
    this.transformBluestein = function(real, imag) {
        // Find a power-of-2 convolution length m such that m >= n * 2 + 1
        var n = real.length;
        if (n != imag.length)
            throw "Mismatched lengths";
        var m = 1;
        while (m < n * 2 + 1)
            m *= 2;
        
        // Trignometric tables
        var cosTable = new Array(n);
        var sinTable = new Array(n);
        for (var i = 0; i < n; i++) {
            var j = i * i % (n * 2);  // This is more accurate than j = i * i
            cosTable[i] = Math.cos(Math.PI * j / n);
            sinTable[i] = Math.sin(Math.PI * j / n);
        }
        
        // Temporary vectors and preprocessing
        var areal = this.newArrayOfZeros(m);
        var aimag = this.newArrayOfZeros(m);
        for (var i = 0; i < n; i++) {
            areal[i] =  real[i] * cosTable[i] + imag[i] * sinTable[i];
            aimag[i] = -real[i] * sinTable[i] + imag[i] * cosTable[i];
        }
        var breal = this.newArrayOfZeros(m);
        var bimag = this.newArrayOfZeros(m);
        breal[0] = cosTable[0];
        bimag[0] = sinTable[0];
        for (var i = 1; i < n; i++) {
            breal[i] = breal[m - i] = cosTable[i];
            bimag[i] = bimag[m - i] = sinTable[i];
        }
        
        // Convolution
        var creal = new Array(m);
        var cimag = new Array(m);
        this.convolveComplex(areal, aimag, breal, bimag, creal, cimag);
        
        // Postprocessing
        for (var i = 0; i < n; i++) {
            real[i] =  creal[i] * cosTable[i] + cimag[i] * sinTable[i];
            imag[i] = -creal[i] * sinTable[i] + cimag[i] * cosTable[i];
        }
    }

    /* 
    * Computes the circular convolution of the given complex vectors. Each vector's length must be the same.
    */
    this.convolveComplex = function(xreal, ximag, yreal, yimag, outreal, outimag) {
        var n = xreal.length;
        if (n != ximag.length || n != yreal.length || n != yimag.length
                || n != outreal.length || n != outimag.length)
            throw "Mismatched lengths";
        
        xreal = xreal.slice();
        ximag = ximag.slice();
        yreal = yreal.slice();
        yimag = yimag.slice();
        this.transformRadix2(xreal, ximag);
        this.transformRadix2(yreal, yimag);
        
        for (var i = 0; i < n; i++) {
            var temp = xreal[i] * yreal[i] - ximag[i] * yimag[i];
            ximag[i] = ximag[i] * yreal[i] + xreal[i] * yimag[i];
            xreal[i] = temp;
        }
        this.inverseTransform(xreal, ximag);
        
        for (var i = 0; i < n; i++) {  // Scaling (because this FFT implementation omits it)
            outreal[i] = xreal[i] / n;
            outimag[i] = ximag[i] / n;
        }
    }

    this.newArrayOfZeros = function(n) {
        var result = [];
        for (var i = 0; i < n; i++)
            result.push(0);
        return result;
    }
}


/* 
 * Construct a wrapper object for calculating the discrete Fourier transform using Nayuki's algo
 */
export default function Fourier(_n) {
    this.nayuki = new Nayuki(_n);

    /* 
    * FFT compute
    */
    this.computeFft = function(_data, _zeroPadding){
        let length;
        if(_zeroPadding == true){
            length = _data.data.length * 2;
        }
        else{
            length = _data.data.length;
        }
        let FFTreal = new Float32Array(length);
        let FFTimag = new Float32Array(length);
    
        // Compute the sum and build the FFT's arrays
        for(let i = 0; i < _data.data.length; i++){
            FFTimag[i] = 0;
        };
        FFTreal.set(_data.data,0);

        // FFT Zero-padding
        if(_zeroPadding == true){
            for(let i = _data.data.length; i < _data.data.length * 2; i++){
                FFTreal[i] = 0;
                FFTimag[i] = 0;
            }
        };
        // Plot the fft
        if ((_data.data.length & (_data.data.length - 1)) == 0){ // Is power of 2
            
            this.nayuki.transformRadix2(FFTreal, FFTimag);
        }
        else { // More complicated algorithm for arbitrary sizes
            this.nayuki.transformBluestein(FFTreal, FFTimag);
        }
        
        return {real : FFTreal, imag: FFTimag};
    }

    /* 
    * FFT compute with a normalized magnitude
    */
    this.computeNormalizedFft = function(_data, _result, _samplingFrequency, _zeroPadding){
        let rawFft = this.computeFft(_data, _zeroPadding);

        // Determine how many Hz represented by each sample
        let hzPerSample = _samplingFrequency / _data.data.length;
    
        if(_zeroPadding == true){
            for(let i = 0; i < rawFft.real.length; i++){
                _result.data[i] = 2 / rawFft.real.length * Math.sqrt(rawFft.real[i*2+1]*rawFft.real[i*2+1]+rawFft.imag[i*2+1]*rawFft.imag[i*2+1]);
                _result.step = hzPerSample * 2;
            }
        }
        else{
            for(let i = 0; i <  _result.data.length; i++){
                _result.data[i] = 2 / rawFft.real.length * Math.sqrt(rawFft.real[i]*rawFft.real[i]+rawFft.imag[i]*rawFft.imag[i]);
                _result.step = hzPerSample;
            }
        }   
    }
}