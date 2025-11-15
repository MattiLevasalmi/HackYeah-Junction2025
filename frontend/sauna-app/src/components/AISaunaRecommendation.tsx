import { motion } from "motion/react";
import "./AISaunaRecommendation.css";

interface AISaunaRecommendationProps {
  users: string[];
  onBack: () => void;
}

export function AISaunaRecommendation({ users, onBack }: AISaunaRecommendationProps) {
  // Mock prediction data
  const prediction = {
    temperature: 78 + users.length * 2, // e.g., mild adjustment by number of users
    humidity: 35 + users.length * 1.5,
    duration: 25, // minutes
    breaks: 2,
    stressLevel: Math.floor(Math.random() * 4 + 5), // 5-8 for demo
    nextSession: { hours: 4, minutes: 30 },
  };

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
            <span>{prediction.temperature}°C</span>
          </div>
          <div className="ai-rec-row">
            <span>Recommended Humidity:</span>
            <span>{prediction.humidity}%</span>
          </div>
          <div className="ai-rec-row">
            <span>Session Duration:</span>
            <span>{prediction.duration} min</span>
          </div>
          <div className="ai-rec-row">
            <span>Breaks:</span>
            <span>{prediction.breaks}</span>
          </div>
          <div className="ai-rec-row">
            <span>Stress Level After Sauna:</span>
            <span>{prediction.stressLevel}/10</span>
          </div>
          <div className="ai-rec-row">
            <span>Next Session:</span>
            <span>
              {prediction.nextSession.hours}h {prediction.nextSession.minutes}m
            </span>
          </div>
        </motion.div>

        <motion.button
          className="ai-rec-back"
          onClick={onBack}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Back
        </motion.button>
      </motion.div>
    </div>
  );
}
