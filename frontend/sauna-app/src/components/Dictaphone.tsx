import React, { useEffect, useState } from "react";
// @ts-ignore
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

const Dictaphone = () => {
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  const [command, setCommand] = useState("");
  const [isTriggered, setIsTriggered] = useState(false);

  if (!browserSupportsSpeechRecognition) {
    return <span>Browser doesn't support speech recognition.</span>;
  }

  // Start continuous listening right away
  useEffect(() => {
    SpeechRecognition.startListening({ continuous: true, language: "en-US" });
  }, []);

  // Watch transcript updates
  useEffect(() => {
    const lower = transcript.toLowerCase();

    if (!isTriggered && lower.includes("hello runner")) {
      setIsTriggered(true);
      const afterWake = lower.split("hello runner")[1]?.trim();
      if (afterWake) setCommand(afterWake);
      resetTranscript();
    } else if (isTriggered) {
      setCommand(lower);
    }
  }, [transcript, isTriggered, resetTranscript]);

  const handleSend = () => {
    if (command) {
      console.log("User command:", command);
      // 🔥 Send to backend here (Python API)
      setIsTriggered(false);
      resetTranscript();
      setCommand("");
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h2>🎙Voice Assistant</h2>
      <p>Listening: {listening ? "✅ on" : "❌ off"}</p>
      <p>
        <strong>Trigger phrase:</strong> Say <em>"Hello Runner"</em> to start.
      </p>
      {isTriggered ? (
        <>
          <p><strong>Command:</strong> {command || "(listening...)"}</p>
          <button onClick={handleSend}>Send Command</button>
        </>
      ) : (
        <p>Waiting for wake word...</p>
      )}
    </div>
  );
};

export default Dictaphone;
