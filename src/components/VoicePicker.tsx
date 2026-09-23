import type { useSpeech } from '../hooks/useSpeech';

type Speech = ReturnType<typeof useSpeech>;

interface Props {
  speech: Speech;
}

export function VoicePicker({ speech }: Props) {
  const { voices, voiceURI, selectVoice, niceName, speak, voiceSupported } = speech;

  if (!voiceSupported || voices.length === 0) return null;

  return (
    <div className="voice-picker">
      <label htmlFor="voice-select">🔊 Voice</label>
      <select
        id="voice-select"
        value={voiceURI ?? ''}
        onChange={(e) => selectVoice(e.target.value)}
      >
        {voices.map((v) => (
          <option key={v.voiceURI} value={v.voiceURI}>
            {niceName(v)}
          </option>
        ))}
      </select>
      <button type="button" className="voice-test" onClick={() => speak('Hi! I can help you read.')}>
        Try it
      </button>
    </div>
  );
}
