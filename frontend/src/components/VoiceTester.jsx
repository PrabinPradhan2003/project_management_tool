import React from 'react';
import { Box, Button, FormControl, InputLabel, MenuItem, Select, Stack, Typography } from '@mui/material';

export default function VoiceTester({ compact = false }) {
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  const [voices, setVoices] = React.useState([]);
  const [selected, setSelected] = React.useState(() => {
    try { return localStorage.getItem('pm_tts_voiceName') || ''; } catch { return ''; }
  });

  React.useEffect(() => {
    if (!supported) return;
    const synth = window.speechSynthesis;
    const load = () => setVoices(synth.getVoices() || []);
    load();
    synth.addEventListener?.('voiceschanged', load);
    return () => synth.removeEventListener?.('voiceschanged', load);
  }, [supported]);

  const testSpeak = () => {
    if (!supported) return;
    const synth = window.speechSynthesis;
    try { synth.cancel(); synth.resume(); } catch {}
    const u = new SpeechSynthesisUtterance('Hello, this is a test of the voice settings.');
    if (selected) {
      const v = (synth.getVoices() || []).find(v => v.name === selected);
      if (v) u.voice = v;
    }
    u.lang = (u.voice?.lang) || 'en-US';
    u.rate = 1; u.pitch = 1; u.volume = 1;
    synth.speak(u);
  };

  const onChange = (e) => {
    const val = e.target.value;
    setSelected(val);
    try { localStorage.setItem('pm_tts_voiceName', val); } catch {}
  };

  if (!supported) {
    return <Typography variant={compact ? 'body2' : 'body1'} color="text.secondary">Speech not supported in this browser.</Typography>;
  }

  return (
    <Box sx={{ p: compact ? 0 : 2 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'stretch', sm: 'center' }}>
        <FormControl size={compact ? 'small' : 'medium'} sx={{ minWidth: 220 }}>
          <InputLabel>Voice</InputLabel>
          <Select value={selected} label="Voice" onChange={onChange}>
            <MenuItem value="">System Default</MenuItem>
            {voices.map(v => (
              <MenuItem key={v.name + v.lang} value={v.name}>{v.name} {v.lang ? `(${v.lang})` : ''}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button variant="outlined" onClick={testSpeak} size={compact ? 'small' : 'medium'}>
          Test Voice
        </Button>
        <Typography variant="caption" color="text.secondary">
          If you hear nothing, try another voice or a different browser.
        </Typography>
      </Stack>
    </Box>
  );
}
