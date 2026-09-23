interface Props {
  message: string;
}

export function SpeechBubble({ message }: Props) {
  return (
    <div className="bubble-wrap">
      <div className="bubble pop" key={message}>
        {message}
      </div>
    </div>
  );
}
