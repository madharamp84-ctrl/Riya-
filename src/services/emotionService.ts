
export interface VoiceEmotion {
  mood: 'neutral' | 'excited' | 'sad' | 'angry' | 'calm' | 'nervous';
  energy: number;
  pitch: number;
  description: string;
}

/**
 * Very basic pitch detection using autocorrelation
 */
function autoCorrelate(buf: Float32Array, sampleRate: number): number {
  let SIZE = buf.length;
  let rms = 0;

  for (let i = 0; i < SIZE; i++) {
    let val = buf[i];
    rms += val * val;
  }
  rms = Math.sqrt(rms / SIZE);
  if (rms < 0.01) return -1; // too quiet

  let r1 = 0, r2 = SIZE - 1, thres = 0.2;
  for (let i = 0; i < SIZE / 2; i++) {
    if (Math.abs(buf[i]) < thres) { r1 = i; break; }
  }
  for (let i = 1; i < SIZE / 2; i++) {
    if (Math.abs(buf[SIZE - i]) < thres) { r2 = SIZE - i; break; }
  }

  buf = buf.slice(r1, r2);
  SIZE = buf.length;

  let c = new Float32Array(SIZE);
  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE - i; j++) {
      c[i] = c[i] + buf[j] * buf[j + i];
    }
  }

  let d = 0; 
  while (c[d] > c[d + 1]) d++;
  let maxval = -1, maxpos = -1;
  for (let i = d; i < SIZE / 2; i++) {
    if (c[i] > maxval) {
      maxval = c[i];
      maxpos = i;
    }
  }
  let T0 = maxpos;

  return sampleRate / T0;
}

export function detectVoiceEmotion(analyser: AnalyserNode, sampleRate: number): VoiceEmotion {
  const bufferLength = analyser.fftSize;
  const buffer = new Float32Array(bufferLength);
  analyser.getFloatTimeDomainData(buffer);

  // 1. Energy
  let sumSquares = 0;
  for (let i = 0; i < buffer.length; i++) {
    sumSquares += buffer[i] * buffer[i];
  }
  const energy = Math.sqrt(sumSquares / buffer.length);

  // 2. Pitch
  const pitch = autoCorrelate(buffer, sampleRate);

  // 3. Mapping (Basic Heuristic)
  // Normal human voice pitch is 85-255Hz
  // We'll normalize these
  
  let mood: VoiceEmotion['mood'] = 'neutral';
  let description = "Neutral";

  if (energy < 0.01) {
    return { mood: 'neutral', energy, pitch, description: "Silent" };
  }

  if (energy > 0.15) {
    if (pitch > 200) {
      mood = 'excited';
      description = "Excited / Joyful";
    } else if (pitch < 120 && pitch > 0) {
      mood = 'angry';
      description = "Angry / Displeased";
    } else {
      mood = 'excited';
      description = "High Energy";
    }
  } else if (energy < 0.05) {
    if (pitch < 110 && pitch > 0) {
      mood = 'sad';
      description = "Low / Sad";
    } else {
      mood = 'calm';
      description = "Calm / Peaceful";
    }
  } else {
    if (pitch > 220) {
      mood = 'nervous';
      description = "Nervous / Tense";
    } else {
      mood = 'neutral';
    }
  }

  return { mood, energy, pitch, description };
}
