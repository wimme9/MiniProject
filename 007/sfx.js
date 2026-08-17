// sfx.js
// Tiny WebAudio synth sound effects - zero external audio files needed.
// The AudioContext is created lazily on first call, since browsers only
// allow audio after a user gesture (the first button click covers that).

const SFX = (() => {
  let ctx = null;
  let muted = false;

  function getCtx() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tone(freq, duration, opts = {}) {
    if (muted) return;
    const { type = 'square', startFreq = null, endFreq = null, volume = 0.16, delay = 0 } = opts;
    try {
      const c = getCtx();
      const t0 = c.currentTime + delay;
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = type;

      if (startFreq && endFreq) {
        osc.frequency.setValueAtTime(startFreq, t0);
        osc.frequency.exponentialRampToValueAtTime(Math.max(endFreq, 1), t0 + duration);
      } else {
        osc.frequency.setValueAtTime(freq, t0);
      }

      gain.gain.setValueAtTime(volume, t0);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + duration);

      osc.connect(gain).connect(c.destination);
      osc.start(t0);
      osc.stop(t0 + duration + 0.02);
    } catch (e) { /* audio unavailable - fail silently */ }
  }

  function playNote(freq, time, duration, type, volume) {
    if (muted || !freq) return;
    try {
      const c = getCtx();
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, time);
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(volume, time + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
      osc.connect(gain).connect(c.destination);
      osc.start(time);
      osc.stop(time + duration + 0.03);
    } catch (e) { /* ignore */ }
  }

  // ---- Tiny background-music sequencer (no audio files needed) ----
  // Schedules a looping two-part (bass + lead) chiptune line slightly
  // ahead of real time, the classic WebAudio "look-ahead scheduler"
  // pattern - keeps timing tight even if the tab throttles setTimeout.
  const music = (() => {
    let playing = false;
    let trackName = null;
    let timerId = null;
    let stepIndex = 0;
    let nextStepTime = 0;
    const lookahead = 0.12;
    const scheduleAhead = 0.25;

    const tracks = {
      menu: {
        tempo: 96,
        bass: [130.81, 0, 130.81, 0, 164.81, 0, 164.81, 0, 146.83, 0, 146.83, 0, 196.00, 0, 174.61, 0],
        lead: [523.25, 659.25, 783.99, 659.25, 587.33, 698.46, 880.00, 698.46, 523.25, 659.25, 783.99, 880.00, 987.77, 880.00, 783.99, 659.25]
      },
      gameplay: {
        tempo: 132,
        bass: [110.00, 0, 110.00, 110.00, 130.81, 0, 130.81, 130.81, 98.00, 0, 98.00, 98.00, 146.83, 0, 130.81, 130.81],
        lead: [440.00, 0, 554.37, 0, 523.25, 0, 659.25, 0, 392.00, 0, 493.88, 0, 587.33, 0, 659.25, 587.33]
      }
    };

    function stepDuration(tempo) {
      return 60 / tempo / 2; // eighth note
    }

    function tick() {
      if (!playing) return;
      const c = getCtx();
      const track = tracks[trackName];
      const dur = stepDuration(track.tempo);
      while (nextStepTime < c.currentTime + scheduleAhead) {
        const bassFreq = track.bass[stepIndex % track.bass.length];
        const leadFreq = track.lead[stepIndex % track.lead.length];
        playNote(bassFreq, nextStepTime, dur * 0.9, 'triangle', 0.05);
        playNote(leadFreq, nextStepTime, dur * 0.85, 'square', 0.04);
        nextStepTime += dur;
        stepIndex++;
      }
      timerId = setTimeout(tick, lookahead * 1000);
    }

    return {
      start(name) {
        if (!tracks[name]) return;
        if (playing && trackName === name) return;
        this.stop();
        trackName = name;
        playing = true;
        stepIndex = 0;
        nextStepTime = getCtx().currentTime + 0.05;
        tick();
      },
      stop() {
        playing = false;
        if (timerId) clearTimeout(timerId);
        timerId = null;
      },
      isPlaying() { return playing; }
    };
  })();

  function noiseBurst(duration, opts = {}) {
    if (muted) return;
    const { volume = 0.16, delay = 0, cutoff = 1800 } = opts;
    try {
      const c = getCtx();
      const t0 = c.currentTime + delay;
      const bufferSize = Math.max(1, Math.floor(c.sampleRate * duration));
      const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
      }
      const noise = c.createBufferSource();
      noise.buffer = buffer;
      const filter = c.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = cutoff;
      const gain = c.createGain();
      gain.gain.setValueAtTime(volume, t0);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + duration);
      noise.connect(filter).connect(gain).connect(c.destination);
      noise.start(t0);
      noise.stop(t0 + duration + 0.02);
    } catch (e) { /* ignore */ }
  }

  return {
    setMuted(v) { muted = v; },
    isMuted() { return muted; },
    toggle() { muted = !muted; return muted; },

    startMusic(name) { music.start(name); },
    stopMusic() { music.stop(); },
    isMusicPlaying() { return music.isPlaying(); },

    jump() { tone(0, 0.15, { type: 'square', startFreq: 300, endFreq: 720, volume: 0.13 }); },
    land() { tone(0, 0.08, { type: 'sine', startFreq: 170, endFreq: 80, volume: 0.09 }); },
    step() { tone(0, 0.03, { type: 'triangle', startFreq: 140, endFreq: 100, volume: 0.03 }); },
    coin() {
      tone(880, 0.08, { type: 'square', volume: 0.13 });
      tone(1318, 0.11, { type: 'square', volume: 0.12, delay: 0.06 });
    },
    bonusCoin() {
      tone(660, 0.08, { type: 'square', volume: 0.14 });
      tone(990, 0.08, { type: 'square', volume: 0.14, delay: 0.06 });
      tone(1320, 0.16, { type: 'square', volume: 0.15, delay: 0.12 });
    },
    hit() {
      noiseBurst(0.16, { volume: 0.2 });
      tone(0, 0.16, { type: 'sawtooth', startFreq: 220, endFreq: 60, volume: 0.11 });
    },
    fall() {
      tone(0, 0.22, { type: 'sawtooth', startFreq: 260, endFreq: 50, volume: 0.1 });
    },
    checkpoint() {
      tone(523, 0.1, { type: 'triangle', volume: 0.15 });
      tone(659, 0.1, { type: 'triangle', volume: 0.15, delay: 0.08 });
      tone(784, 0.18, { type: 'triangle', volume: 0.15, delay: 0.16 });
    },
    victory() {
      [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.22, { type: 'triangle', volume: 0.16, delay: i * 0.12 }));
    },
    gameOver() {
      [392, 349, 294, 220].forEach((f, i) => tone(f, 0.28, { type: 'sawtooth', volume: 0.12, delay: i * 0.16 }));
    },
    pause() { tone(440, 0.08, { type: 'sine', volume: 0.1 }); },
    click() { tone(0, 0.06, { type: 'square', startFreq: 500, endFreq: 700, volume: 0.09 }); },
    hover() { tone(700, 0.035, { type: 'sine', volume: 0.045 }); }
  };
})();
