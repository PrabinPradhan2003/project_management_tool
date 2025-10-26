import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import StopIcon from '@mui/icons-material/Stop';

export default function SpeakButton({ text = '', ariaLabel = 'Listen', size = 'small', sx, lang = 'en-US', rate = 1, pitch = 1, volume = 1, chunkSize = 180, chunkPauseMs = 120 }) {
  const [speaking, setSpeaking] = React.useState(false);
  const utterRef = React.useRef(null);
  const voicesReadyRef = React.useRef(false);
  const queueRef = React.useRef([]);
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;

  // Preload voices (some browsers need this call to populate voices)
  React.useEffect(() => {
    if (!supported) return;
    const synth = window.speechSynthesis;
    // Trigger voice loading
    const preload = synth.getVoices();
    voicesReadyRef.current = preload && preload.length > 0;

    const onVoicesChanged = () => {
      const list = synth.getVoices();
      voicesReadyRef.current = list && list.length > 0;
    };
    synth.addEventListener?.('voiceschanged', onVoicesChanged);
    return () => {
      synth.removeEventListener?.('voiceschanged', onVoicesChanged);
      try { synth.cancel(); } catch {}
    };
  }, [supported]);

  const pickVoice = (synth) => {
    const list = synth.getVoices();
    if (!list || list.length === 0) return null;
    // Prefer stored selection first
    try {
      const storedName = localStorage.getItem('pm_tts_voiceName');
      if (storedName) {
        const byName = list.find(v => v.name === storedName);
        if (byName) return byName;
      }
    } catch {}
    // Prefer en-US then any English voice, else default first
    const byLang = list.find(v => v.lang?.toLowerCase() === lang.toLowerCase());
    if (byLang) return byLang;
    const anyEn = list.find(v => /^en[-_]/i.test(v.lang || ''));
    return anyEn || list[0] || null;
  };

  const splitIntoChunks = (t) => {
    const textNorm = String(t || '').trim();
    if (!textNorm) return [];
    // Split by sentence boundaries first
    const raw = textNorm
      .replace(/\s+/g, ' ')
      .split(/([.!?]\s+)/)
      .reduce((acc, cur, idx, arr) => {
        if (/[.!?]\s+/.test(cur)) {
          // join with previous token
          acc[acc.length - 1] = (acc[acc.length - 1] || '') + cur;
        } else if (cur) {
          acc.push(cur);
        }
        return acc;
      }, []);
    // Merge small chunks and ensure max length
    const chunks = [];
    for (const sentence of raw) {
      if (!chunks.length) { chunks.push(sentence); continue; }
      const prev = chunks[chunks.length - 1];
      if ((prev + ' ' + sentence).length <= chunkSize) {
        chunks[chunks.length - 1] = prev + ' ' + sentence;
      } else if (sentence.length <= chunkSize) {
        chunks.push(sentence);
      } else {
        // Hard-split very long segments
        let i = 0;
        while (i < sentence.length) {
          chunks.push(sentence.slice(i, i + chunkSize));
          i += chunkSize;
        }
      }
    }
    return chunks;
  };

  const speakChunk = (synth, chunk) => {
    const utter = new SpeechSynthesisUtterance(chunk);
    utter.lang = lang;
    utter.rate = rate;
    utter.pitch = pitch;
    utter.volume = Math.max(0, Math.min(1, volume));
    const v = pickVoice(synth);
    if (v) utter.voice = v;
    utter.onstart = () => setSpeaking(true);
    utter.onend = () => {
      if (queueRef.current.length > 0) {
        // Pause briefly between chunks for natural cadence
        setTimeout(() => {
          try { synth.resume(); } catch {}
          speakChunk(synth, queueRef.current.shift());
        }, chunkPauseMs);
      } else {
        setSpeaking(false);
      }
    };
    utter.onerror = () => setSpeaking(false);
    utterRef.current = utter;
    try { synth.resume(); } catch {}
    synth.speak(utter);
  };

  const speakNow = () => {
    const synth = window.speechSynthesis;
    // Cancel anything queued
    try { synth.cancel(); } catch {}
    queueRef.current = splitIntoChunks(text);
    const first = queueRef.current.shift();
    if (!first) return;
    // Small timeout helps on some browsers after cancel(); resume engine just in case
    setTimeout(() => {
      try { synth.resume(); } catch {}
      speakChunk(synth, first);
    }, 100);
    // Safety: if nothing started within 2s, reset state
    setTimeout(() => {
      if (!synth.speaking) setSpeaking(false);
    }, 2000);
  };

  const onClick = () => {
    if (!supported || !text?.trim()) return;
    const synth = window.speechSynthesis;
    if (speaking) {
      try { synth.cancel(); } catch {}
      setSpeaking(false);
      return;
    }
    if (voicesReadyRef.current) {
      speakNow();
    } else {
      // If voices not ready yet, wait for them briefly, then try
      const start = Date.now();
      const tryLater = () => {
        if (window.speechSynthesis.getVoices().length > 0 || Date.now() - start > 1200) {
          speakNow();
        } else {
          setTimeout(tryLater, 120);
        }
      };
      tryLater();
    }
  };

  const disabled = !supported || !text?.trim();

  return (
    <Tooltip title={supported ? (speaking ? 'Stop' : 'Listen') : 'Speech not supported in this browser'}>
      <span>
        <IconButton onClick={onClick} aria-label={ariaLabel} size={size} sx={sx} disabled={disabled}>
          {speaking ? <StopIcon fontSize="small" /> : <VolumeUpIcon fontSize="small" />}
        </IconButton>
      </span>
    </Tooltip>
  );
}
