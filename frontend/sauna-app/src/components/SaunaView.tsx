import { useState } from "react";
import { ModelViewer } from "./ModelViewer";
import { SaunaSettings } from "./SaunaSettings";
import { SaunaVoiceButton } from "./SaunaVoiceButton"; // <-- import it here
import { Header } from "./Header";
import "./SaunaView.css";

interface SaunaViewProps {
  fullWidth?: boolean;
}

export function SaunaView({ fullWidth }: SaunaViewProps) {
  const [temperature, setTemperature] = useState(75);
  const [lighting, setLighting] = useState(60);
  const [timer, setTimer] = useState(30);
  const [steamLevel, setSteamLevel] = useState(40);
  const [isPowerOn, setIsPowerOn] = useState(false);

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
            <ModelViewer isPowerOn={isPowerOn} temperature={temperature} />
          </div>

          {/* Settings Panel */}
          <div className="order-1 lg:order-2 settings-section flex flex-col gap-4">
            <SaunaSettings
              temperature={temperature}
              setTemperature={setTemperature}
              lighting={lighting}
              setLighting={setLighting}
              timer={timer}
              setTimer={setTimer}
              steamLevel={steamLevel}
              setSteamLevel={setSteamLevel}
              isPowerOn={isPowerOn}
              setIsPowerOn={setIsPowerOn}
            />

            {/* Voice Button Section */}
            <SaunaVoiceButton /> {/* <-- add it here */}
          </div>
        </div>
      </main>
    </div>
  );
}
