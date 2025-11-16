import { motion } from "motion/react";
import "./AISaunaRecommendation.css";
import axios from "axios";
import { useEffect, useState } from "react";

interface Recommendation {
  temperature: number;
  humidity: number;
  duration: number;
  breaks: number;
  stressLevel: number;
  nextSession: {hours: number, minutes: number};
}

interface AISaunaRecommendationProps {
  users: string[];
  onBack: () => void;
  onStartSauna: (id: string, preset: any) => void; // add this
}

export function AISaunaRecommendation({ users, onBack, onStartSauna }: AISaunaRecommendationProps) {
  const [preset, setPreset] = useState<Recommendation | null>(null);
  const handleStartSauna = async () => {
    let simId: string | undefined;
    const body = {
      targetTemperature: preset?.temperature,
      targetHumidity: preset?.humidity,
      duration: preset?.duration,
    };
    try {
      const resp = await axios.post(`${import.meta.env.VITE_API_URL}/api/simulation/start`, body);
      if (resp?.data?.status === 'Simulation started') {
        simId = resp.data.simulationId;
      } else {
        console.error('Failed to start simulation', resp?.data);
      }
    } catch (err) {
      console.error('Error starting simulation', err);
    }
    if (simId) onStartSauna(simId, body);
  }

  // Mock prediction data
  useEffect(() => {
    setPreset({
    temperature: 78 + users.length * 2,
    humidity: 35 + users.length * 1.5,
    duration: 25,
    breaks: 2,
    stressLevel: Math.floor(Math.random() * 4 + 5),
    nextSession: { hours: 4, minutes: 30 },
    });
  }, []);

  return (
    <div className="ai-rec-container">
      {/* Background glow */}
      <div className="ai-rec-bg" />

      <motion.div
        className="ai-rec-panel"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <motion.h2
          className="ai-rec-title"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
        >
          AI Sauna Recommendations
        </motion.h2>

        <motion.div
          className="ai-rec-data"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="ai-rec-row">
            <span>Recommended Temperature:</span>
            <span>{preset?.temperature}°C</span>
          </div>
          <div className="ai-rec-row">
            <span>Recommended Humidity:</span>
            <span>{preset?.humidity}%</span>
          </div>
          <div className="ai-rec-row">
            <span>Session Duration:</span>
            <span>{preset?.duration} min</span>
          </div>
          <div className="ai-rec-row">
            <span>Breaks:</span>
            <span>{preset?.breaks}</span>
          </div>
          <div className="ai-rec-row">
            <span>Stress Level:</span>
            <span>{preset?.stressLevel}/10</span>
          </div>
          <div className="ai-rec-row">
            <span>Next Session:</span>
            <span>
              {preset?.nextSession.hours}h {preset?.nextSession.minutes}m
            </span>
          </div>
        </motion.div>

       <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
  {/* Back button */}
  <motion.button
    onClick={onBack}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    style={{
      flex: 1,
      padding: "0.75rem 1rem",
      backgroundColor: "#374151", // gray-700
      color: "#ffffff",
      borderRadius: "0.75rem",
      fontWeight: 500,
      cursor: "pointer",
      textAlign: "center",
      width: "200px",
    }}
  >
    Back
  </motion.button>

  {/* Start Sauna button with glowing orange style */}
  <motion.button
    onClick={handleStartSauna}
    whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(234,88,12,0.9)" }}
    whileTap={{ scale: 0.95 }}
    style={{
      flex: 1,
      padding: "0.75rem 1rem",
      backgroundColor: "#ea580c", // orange
      color: "#ffffff",
      borderRadius: "0.75rem",
      fontWeight: 600,
      position: "relative",
      overflow: "hidden",
      cursor: "pointer",
      textAlign: "center",
      boxShadow: "0 0 15px rgba(234,88,12,0.6)",
      transition: "box-shadow 0.3s, transform 0.2s",
    }}
  >
    Start Sauna
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "linear-gradient(to right, #f97316, #fbbf24)",
        filter: "blur(1rem)",
        opacity: 0.4,
        pointerEvents: "none",
      }}
    />
  </motion.button>
</div>
      </motion.div>
    </div>
  );
}
