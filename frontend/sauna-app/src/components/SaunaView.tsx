import { useState } from "react";
import { ModelViewer } from "./ModelViewer";
import { SessionStatus } from "./SessionStatus";
import { SaunaSettings } from "./SaunaSettings";
import { Header } from "./Header";
import "./SaunaView.css";
import Dictaphone from "./Dictaphone"; 

interface SaunaViewProps {
  simulationId: string;
  settings: Settings;
  onEnd: () => void;
  fullWidth?: boolean; // New prop to allow full width
}

export interface Settings {
  targetTemperature: number
  targetHumidity: number
  duration: number
}

export function SaunaView({ simulationId, settings, onEnd, fullWidth }: SaunaViewProps) {
  const [temperature, setTemperature] = useState(settings.targetTemperature);
  const [lighting, setLighting] = useState(60);
  const [timer, setTimer] = useState(settings.duration);
  const [steamLevel, setSteamLevel] = useState(settings.targetHumidity);
  const [isPowerOn, setIsPowerOn] = useState(true);

  const getGlowColor = (temperature: number) => {
  if (temperature < 70) return "yellow";
  if (temperature < 85) return "orange";
  return "red";
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-zinc-900 sauna-view-background">
      <Header isPowerOn={isPowerOn} />

      <main
        className={`container mx-auto px-4 py-6 lg:py-8 sauna-view-container sauna-view-main ${
          fullWidth ? "max-w-full mx-0" : ""
        }`}
      >
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 sauna-view-grid">
          {/* 3D Model Section */}
          <div className="order-2 lg:order-1 model-section">
          <ModelViewer 
            isPowerOn={isPowerOn} 
            temperature={temperature} 
            glowColor={getGlowColor(temperature)} 
          />
          <SessionStatus isPowerOn={isPowerOn} simulationId={simulationId} />
        </div>

          {/* Settings Panel */}
          <div className="order-1 lg:order-2 settings-section">
            <SaunaSettings
              simulationId={simulationId}
              temperature={temperature}
              setTemperature={setTemperature}
              lighting={lighting}
              setLighting={setLighting}
              timer={timer}
              setTimer={setTimer}
              steamLevel={steamLevel}
              setSteamLevel={setSteamLevel}
              isPowerOn={isPowerOn}
              onEnd={onEnd}
            />
          </div>
        </div>
        <Dictaphone
          temperature={temperature}
          setTemperature={setTemperature}
          humidity={steamLevel}
          setHumidity={setSteamLevel}
        />
      </main>
    </div>
  );
}
