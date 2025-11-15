import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import "./AISaunaMode.css";

interface AISaunaModeProps {
  onClick?: () => void;
}

export function AISaunaMode({ onClick }: AISaunaModeProps) {
  const modes = [
    {
      id: "mild",
      label: "Mild",
      cssClass: "mode-mild",
      subtitle: "Gentle warmth",
    },
    {
      id: "cozy",
      label: "Cozy",
      cssClass: "mode-cozy",
      subtitle: "Comfortable & relaxing",
    },
    {
      id: "hot",
      label: "Hot",
      cssClass: "mode-hot",
      subtitle: "High heat",
    },
    {
      id: "ai",
      label: "AI Sauna Mode",
      cssClass: "mode-ai",
      subtitle: "Intelligent climate control",
      icon: true,
    },
  ];

  const [index, setIndex] = useState(0);
  const current = modes[index];

  const prev = () => setIndex((i) => (i - 1 + modes.length) % modes.length);
  const next = () => setIndex((i) => (i + 1) % modes.length);

  return (
    <div className="ai-container">
      {/* background frosted glass + fog + droplets live in CSS */}
      <div className="ai-bg-overlay" aria-hidden />

      <div className="ai-panel" role="region" aria-label="AI Sauna Mode panel">
        <motion.h2
          className="ai-title"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Select Sauna Mode
        </motion.h2>

        <div className="ai-carousel">
          <button
            className="ai-arrow left"
            onClick={prev}
            aria-label="Previous mode"
            title="Previous"
          >
            <ChevronLeft className="ai-arrow-icon" />
          </button>

          <div className="ai-circle-wrap">
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -10 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className={`ai-mode-circle ${current.cssClass}`}
                aria-live="polite"
              >
                <div className="ai-circle-inner" />

                <div className="ai-mode-content">
                  {current.icon ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                      className="ai-icon-wrap"
                    >
                      <Sparkles className="ai-icon" />
                    </motion.div>
                  ) : null}

                  <motion.span
                    className="ai-mode-label"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {current.label}
                  </motion.span>

                  <motion.span
                    className="ai-mode-sub"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {current.subtitle}
                  </motion.span>
                </div>

                {/* subtle pulsating glow ring */}
                <div className="ai-glow-ring" />
              </motion.div>
            </AnimatePresence>
          </div>

          <button
            className="ai-arrow right"
            onClick={next}
            aria-label="Next mode"
            title="Next"
          >
            <ChevronRight className="ai-arrow-icon" />
          </button>
        </div>

        <div className="ai-controls">
          <div className="ai-indicators" aria-hidden>
            {modes.map((m, i) => (
              <button
                key={m.id}
                className={`ai-dot ${i === index ? "active" : ""}`}
                onClick={() => setIndex(i)}
                aria-label={`Select ${m.label}`}
                title={m.label}
              />
            ))}
          </div>

          <div className="ai-action-row">
  <button
    className={`ai-confirm ${current.id !== "ai" ? "disabled" : ""}`}
    onClick={() => {
      if (current.id === "ai" && onClick) {
        onClick(); // trigger parent callback
      }
    }}
    aria-label="Confirm selection"
    disabled={current.id !== "ai"} // only enable when AI mode is active
  >
    Confirm
  </button>
</div>

        </div>
      </div>

      {/* decorative fog & droplets - purely visual */}
      <div className="ai-fog-layer" aria-hidden />
      <div className="ai-droplets" aria-hidden>
        {/* will be populated by CSS pseudo-elements and repeated small dots */}
        <span className="drop d1" />
        <span className="drop d2" />
        <span className="drop d3" />
        <span className="drop d4" />
        <span className="drop d5" />
      </div>
    </div>
  );
}
