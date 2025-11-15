import { useEffect, useState } from "react";
import axios from "axios";

interface SessionStatusProps {
  isPowerOn: boolean;
  simulationId: string;
}

export function SessionStatus({ isPowerOn, simulationId }: SessionStatusProps) {
  const [temperature, setTemperature] = useState<number>(0);
  const [humidity, setHumidity] = useState<number>(0);
  const [duration, setDuration] = useState<string>("00:00");
  const [loopInProgress, setLoop] = useState<boolean>(false);

  let intervalRef: NodeJS.Timeout | null = null;

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const startLoop = () => {
    if (loopInProgress) return;

    setLoop(true);

    intervalRef = setInterval(async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/simulation/${simulationId}/current`
        );

        const data = response.data.data;
        const status = response.data.status;

        if (!status.isRunning) return; // Stop if backend says simulation ended

        setTemperature(data.temperature);
        setHumidity(data.humidity);
        setDuration(`${formatDuration(data.duration)} / ${status.targetDuration}:00`);
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 1000);
  };

  const stopLoop = () => {
    setLoop(false);
    if (intervalRef) {
      clearInterval(intervalRef);
      intervalRef = null;
    }
  };

  // Manage power on/off changes
  useEffect(() => {
    if (isPowerOn && !loopInProgress) {
      startLoop();
    } else if (!isPowerOn && loopInProgress) {
      stopLoop();
    }

    return () => {
      stopLoop();
    };
  }, [isPowerOn]);

  return (
    <div className="mt-6 bg-gradient-to-br from-neutral-900 to-neutral-950 rounded-3xl p-6 border border-neutral-800/50 shadow-2xl glass-card hover-lift">
      <div className="flex items-center justify-between gap-6">
        <div className="flex-1">
          <div className="text-sm text-neutral-400">Temperature</div>
          <div className="text-2xl font-semibold text-white">
            {temperature}°C
          </div>
        </div>

        <div className="flex-1">
          <div className="text-sm text-neutral-400">Humidity</div>
          <div className="text-2xl font-semibold text-white">
            {humidity}%
          </div>
        </div>

        <div className="flex-1 text-right">
          <div className="text-sm text-neutral-400">Duration</div>
          <div className="text-2xl font-semibold text-white">{duration}</div>
        </div>
      </div>
    </div>
  );
}

export default SessionStatus;
