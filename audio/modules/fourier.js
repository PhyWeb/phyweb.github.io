/* 
 * Free FFT and convolution (JavaScript)
 * 
 * Copyright (c) 2014 Project Nayuki
 * http://www.nayuki.io/page/free-small-fft-in-multiple-languages
 *
 * (MIT License)
 *
 * Slightly restructured by Chris Cannam, cannam@all-day-breakfast.com
 * Slightly modified by Gaétan Walter
 * Fortement optimisé pour le temps réel (Fenêtrage, Memory Management, Real FFT Packing)
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
    this.cosTable = new Float32Array(n / 2);
    this.sinTable = new Float32Array(n / 2);
    for (var i = 0; i < n / 2; i++) {
        this.cosTable[i] = Math.cos(2 * Math.PI * i / n);
        this.sinTable[i] = Math.sin(2 * Math.PI * i / n);
    }

    // --- OPTIMISATION 1 : Précalcul de la table d'inversion de bits ---
    this.reverseTable = new Uint32Array(n);
    for (var i = 0; i < n; i++) {
        var x = i;
        var y = 0;
        for (var j = 0; j < this.levels; j++) {
            y = (y << 1) | (x & 1);
            x >>>= 1;
        }
        this.reverseTable[i] = y;
    }

    /* 
     * Computes the discrete Fourier transform (DFT) of the given complex vector, storing the result back into the vector.
     */
    this.fastTransformRadix2 = function(real, imag) {
        var n = this.n;
	
        // --- OPTIMISATION 1 : Utilisation de la table précalculée (évite 50 000 boucles) ---
        for (var i = 0; i < n; i++) {
            var j = this.reverseTable[i];
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
    }

    this.transformRadix2 = function(real, imag) {
        // Fallback pour compatibilité...
        var n = real.length;
        if (n != imag.length) throw "Mismatched lengths";
        if (n == 1) return;
        var levels = -1;
        for (var i = 0; i < 32; i++) {
            if (1 << i == n) levels = i;
        }
        if (levels == -1) throw "Length is not a power of 2";
        
        var cosTable = new Array(n / 2);
        var sinTable = new Array(n / 2);
        for (var i = 0; i < n / 2; i++) {
            cosTable[i] = Math.cos(2 * Math.PI * i / n);
            sinTable[i] = Math.sin(2 * Math.PI * i / n);
        }
        
        for (var i = 0; i < n; i++) {
            var j = reverseBits(i, levels);
            if (j > i) {
                var temp = real[i]; real[i] = real[j]; real[j] = temp;
                temp = imag[i]; imag[i] = imag[j]; imag[j] = temp;
            }
        }
        
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
        
        function reverseBits(x, bits) {
            var y = 0;
            for (var i = 0; i < bits; i++) {
                y = (y << 1) | (x & 1);
                x >>>= 1;
            }
            return y;
        }
    }

    this.inverseTransform = function(real, imag) {
        this.transformRadix2(imag, real);
    }

    this.transformBluestein = function(real, imag) {
        var n = real.length;
        if (n != imag.length) throw "Mismatched lengths";
        var m = 1;
        while (m < n * 2 + 1) m *= 2;
        
        var cosTable = new Array(n);
        var sinTable = new Array(n);
        for (var i = 0; i < n; i++) {
            var j = i * i % (n * 2);
            cosTable[i] = Math.cos(Math.PI * j / n);
            sinTable[i] = Math.sin(Math.PI * j / n);
        }
        
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
        
        var creal = new Array(m);
        var cimag = new Array(m);
        this.convolveComplex(areal, aimag, breal, bimag, creal, cimag);
        
        for (var i = 0; i < n; i++) {
            real[i] =  creal[i] * cosTable[i] + cimag[i] * sinTable[i];
            imag[i] = -creal[i] * sinTable[i] + cimag[i] * cosTable[i];
        }
    }

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
        
        for (var i = 0; i < n; i++) {
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
    
    // --- OPTIMISATION 2 : Pré-allocation mémoire (Garbage Collector friendly) ---
    this.realBuffer = null;
    this.imagBuffer = null;

    // --- OPTIMISATION 3 : Précalcul de la fenêtre de Hann ---
    this.windowTable = new Float32Array(_n);
    for (let i = 0; i < _n; i++) {
        this.windowTable[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (_n - 1)));
    }

    // --- OPTIMISATION 4 : Moteur Real FFT N/2 (Packing) ---
    this.nayukiHalf = new Nayuki(_n / 2);
    this.packCosTable = new Float32Array(_n / 2);
    this.packSinTable = new Float32Array(_n / 2);
    for (let i = 0; i < _n / 2; i++) {
        this.packCosTable[i] = Math.cos(2 * Math.PI * i / _n);
        this.packSinTable[i] = Math.sin(2 * Math.PI * i / _n);
    }

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

        // --- OPTIMISATION 2 : Recyclage des tableaux ---
        if (!this.realBuffer || this.realBuffer.length !== length) {
            this.realBuffer = new Float32Array(length);
            this.imagBuffer = new Float32Array(length);
        }

        let FFTreal = this.realBuffer;
        let FFTimag = this.imagBuffer;
    
        // --- OPTIMISATION 4 : Real FFT (Packing) si les conditions sont idéales ---
        if (length === this.nayuki.n && !_zeroPadding) {
            let halfN = length / 2;
            
            // 1. PACKING + FENÊTRAGE (Optimisation 3)
            for (let i = 0; i < halfN; i++) {
                FFTreal[i] = _data.data[2 * i] * this.windowTable[2 * i];
                FFTimag[i] = _data.data[2 * i + 1] * this.windowTable[2 * i + 1];
            }

            // 2. FFT COMPLEXE (Taille N/2, très rapide)
            this.nayukiHalf.fastTransformRadix2(FFTreal, FFTimag);

            // 3. UNPACKING (Démêlage)
            FFTreal[halfN] = FFTreal[0] - FFTimag[0];
            FFTimag[halfN] = 0;
            FFTreal[0] = FFTreal[0] + FFTimag[0];
            FFTimag[0] = 0;

            for (let k = 1; k < halfN / 2 + 1; k++) {
                let rev = halfN - k;
                
                let Ar = (FFTreal[k] + FFTreal[rev]) * 0.5;
                let Ai = (FFTimag[k] - FFTimag[rev]) * 0.5;
                let Br = (FFTimag[k] + FFTimag[rev]) * 0.5;
                let Bi = (FFTreal[rev] - FFTreal[k]) * 0.5;

                let C = this.packCosTable[k];
                let S = this.packSinTable[k];
                
                let termR = C * Br - S * Bi;
                let termI = S * Br + C * Bi;

                FFTreal[k] = Ar + termR;
                FFTimag[k] = Ai + termI;
                
                if (k !== rev) {
                    FFTreal[rev] = Ar - termR;
                    FFTimag[rev] = termI - Ai;
                }
            }
            
            // Miroir pour remplir proprement la fin du tableau
            for (let k = 1; k < halfN; k++) {
                FFTreal[length - k] = FFTreal[k];
                FFTimag[length - k] = -FFTimag[k];
            }
        }
        else { 
            // --- FALLBACK (Ex: taille modifiée par l'utilisateur ou zero padding) ---
            for(let i = 0; i < _data.data.length; i++){
                FFTimag[i] = 0;
            }
            FFTreal.set(_data.data,0);

            // Application de la fenêtre de Hann classique
            if (_data.data.length === this.nayuki.n) {
                for(let i = 0; i < _data.data.length; i++) {
                    FFTreal[i] *= this.windowTable[i];
                }
            }

            if(_zeroPadding == true){
                for(let i = _data.data.length; i < length; i++){
                    FFTreal[i] = 0;
                    FFTimag[i] = 0;
                }
            }

            if ((length & (length - 1)) == 0){ 
                if (length === this.nayuki.n) {
                    this.nayuki.fastTransformRadix2(FFTreal, FFTimag);
                } else {
                    this.nayuki.transformRadix2(FFTreal, FFTimag);
                }
            }
            else { 
                this.nayuki.transformBluestein(FFTreal, FFTimag);
            }
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