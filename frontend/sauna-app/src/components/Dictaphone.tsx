import React, { useEffect, useState } from "react";
// @ts-ignore
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";

interface DictaphoneProps {
  temperature: number;
  setTemperature: (temp: number) => void;
  humidity: number;
  setHumidity: (hum: number) => void;
}

const Dictaphone: React.FC<DictaphoneProps> = ({
  temperature,
  setTemperature,
  humidity,
  setHumidity,
}) => {
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  const [command, setCommand] = useState("");
  const [isTriggered, setIsTriggered] = useState(false);
  const [awaiting, setAwaiting] = useState<{ type: string | null; direction: string | null }>({
    type: null,
    direction: null,
  });

  if (!browserSupportsSpeechRecognition) {
    return <span>Browser doesn't support speech recognition.</span>;
  }

  // Start continuous listening
  useEffect(() => {
    SpeechRecognition.startListening({ continuous: true, language: "en-US" });
  }, []);

  // Watch transcript updates
  useEffect(() => {
    const lower = transcript.toLowerCase();

    if (!isTriggered && lower.includes("hello sauna")) {
      setIsTriggered(true);
      const afterWake = lower.split("hello sauna")[1]?.trim();
      if (afterWake) setCommand(afterWake);
      resetTranscript();
    } else if (isTriggered) {
      setCommand(lower);
    }
  }, [transcript, isTriggered, resetTranscript]);

  // ElevenLabs TTS
  async function speakText(text: string) {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/4UukaydN82C8dHkDO2Q9`, {
      method: "POST",
      headers: {
        "xi-api-key": import.meta.env.VITE_ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text, voice_settings: { stability: 0.7, similarity_boost: 0.8 } }),
    });
    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    audio.play();
  }

  function generateAIResponse(userCommand: string) {
    const lower = userCommand.toLowerCase();
    if (lower.includes("how are you")) return "I'm doing great, ready to help with your sauna!";
    if (lower.includes("hello")) return "Hello! How would you like to adjust the sauna today?";
    if (lower.includes("thanks")) return "You're welcome! Enjoy your sauna session.";
    return "I'm here to help with your sauna settings!";
  }

  async function handleCommand(userCommand: string) {
    const cmd = userCommand.toLowerCase();
    const numberMatch = cmd.match(/\d+/);

    // FOLLOW-UP LOGIC
    if (awaiting.type) {
      if (numberMatch) {
        const amount = parseInt(numberMatch[0], 10);
        if (awaiting.type === "temp") {
          const newTemp = awaiting.direction === "increase" ? temperature + amount : temperature - amount;
          setTemperature(newTemp);
          setAwaiting({ type: null, direction: null });
          const msg = `Temperature ${awaiting.direction}d to ${newTemp}°C.`;
          speakText(msg);
          return;
        } else if (awaiting.type === "hum") {
          const newHum = awaiting.direction === "increase" ? humidity + amount : humidity - amount;
          setHumidity(newHum);
          setAwaiting({ type: null, direction: null });
          const msg = `Humidity ${awaiting.direction}d to ${newHum}%.`;
          speakText(msg);
          return;
        }
      } else {
        const msg = "Please tell me a number.";
        speakText(msg);
        return;
      }
    }

    // TEMPERATURE
    if (cmd.includes("temperature")) {
      if (cmd.includes("increase")) {
        if (numberMatch) {
          const newTemp = temperature + parseInt(numberMatch[0], 10);
          setTemperature(newTemp);
          const msg = `Temperature increased to ${newTemp} degrees.`;
          speakText(msg);
          return;
        } else {
          setAwaiting({ type: "temp", direction: "increase" });
          const msg = "By how many degrees should I increase the temperature?";
          speakText(msg);
          return;
        }
      }
      if (cmd.includes("decrease")) {
        if (numberMatch) {
          const newTemp = temperature - parseInt(numberMatch[0], 10);
          setTemperature(newTemp);
          const msg = `Temperature decreased to ${newTemp} degrees.`;
          speakText(msg);
          return;
        } else {
          setAwaiting({ type: "temp", direction: "decrease" });
          const msg = "By how many degrees should I decrease the temperature?";
          speakText(msg);
          return;
        }
      }
    }

    // HUMIDITY
    if (cmd.includes("humidity")) {
      if (cmd.includes("increase")) {
        if (numberMatch) {
          const newHum = humidity + parseInt(numberMatch[0], 10);
          setHumidity(newHum);
          const msg = `Humidity increased to ${newHum} percents.`;
          speakText(msg);
          return;
        } else {
          setAwaiting({ type: "hum", direction: "increase" });
          const msg = "By how much should I increase the humidity?";
          speakText(msg);
          return;
        }
      }
      if (cmd.includes("decrease")) {
        if (numberMatch) {
          const newHum = humidity - parseInt(numberMatch[0], 10);
          setHumidity(newHum);
          const msg = `Humidity decreased to ${newHum} percents.`;
          speakText(msg);
          return;
        } else {
          setAwaiting({ type: "hum", direction: "decrease" });
          const msg = "By how much should I decrease the humidity?";
          speakText(msg);
          return;
        }
      }
    }

    // FALLBACK AI
    const aiText = generateAIResponse(userCommand);
    speakText(aiText);
  }

  const handleSend = () => {
    if (command) {
      handleCommand(command);
      setIsTriggered(false);
      resetTranscript();
      setCommand("");
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif", marginTop: "-150px" }}>
      <h2>🎙Voice Assistant</h2>
      <p>Listening: {listening ? "✅ on" : "❌ off"}</p>
      <p>
        <strong>Trigger phrase:</strong> Say <em>"Hello Sauna"</em> to start.
      </p>
      {isTriggered ? (
        <>
          <p><strong>Command:</strong> {command || "(listening...)"}</p>
          <button
            onClick={handleSend}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#111",
              color: "white",
              border: "none",
              borderRadius: "0.5rem",
              cursor: "pointer",
              boxShadow: "0 0 10px white, 0 0 20px rgba(255, 255, 255, 0.5)",
              transition: "box-shadow 0.3s ease, transform 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow =
                "0 0 20px white, 0 0 40px rgba(255, 255, 255, 0.7)";
              e.currentTarget.style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow =
                "0 0 10px white, 0 0 20px rgba(255, 255, 255, 0.5)";
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            Send Command
          </button>
        </>
      ) : (
        <p>Waiting for wake word...</p>
      )}
    </div>
  );
};

export default Dictaphone;
