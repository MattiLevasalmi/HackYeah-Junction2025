import { useEffect, useState } from "react";
import axios from "axios";

interface SessionStatusProps {
  isPowerOn: boolean;
  simulationId: string;
  targetTemperature: number;
}

export function SessionStatus({ isPowerOn, simulationId, targetTemperature }: SessionStatusProps) {
  const [temperature, setTemperature] = useState<number>(0);
  const [humidity, setHumidity] = useState<number>(0);
  const [duration, setDuration] = useState<string>("00:00");
  const [loopInProgress, setLoop] = useState<boolean>(false);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // Start/stop loop when power changes
  useEffect(() => {
    if (isPowerOn && !loopInProgress) {
      setLoop(true);
    } else if (!isPowerOn && loopInProgress) {
      setLoop(false);
    }
  }, [isPowerOn]);

  // Poll backend for humidity and duration
  useEffect(() => {
    if (!loopInProgress) return;

    const interval = setInterval(async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/simulation/${simulationId}/current`
        );
        const data = response.data.data;
        const status = response.data.status;

        if (!status.isRunning) return;

        setHumidity(data.humidity);
        setDuration(`${formatDuration(data.duration)} / ${status.targetDuration}:00`);
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [loopInProgress, simulationId]);

  // Gradually adjust temperature toward target
  useEffect(() => {
    if (!loopInProgress) return;

    const rampInterval = setInterval(() => {
      setTemperature((prevTemp) => {
        const diff = targetTemperature - prevTemp;
        const step = 0.5; // °C per second
        if (Math.abs(diff) < step) return targetTemperature;
        return prevTemp + Math.sign(diff) * step;
      });
    }, 1000);

    return () => clearInterval(rampInterval);
  }, [loopInProgress, targetTemperature]);

  return (
    <div className="mt-6 bg-gradient-to-br from-neutral-900 to-neutral-950 rounded-3xl p-6 border border-neutral-800/50 shadow-2xl glass-card hover-lift">
      <div className="flex items-center justify-between gap-6">
        <div className="flex-1">
          <div className="text-sm text-neutral-400">Temperature</div>
          <div className="text-2xl font-semibold text-white">
            {temperature.toFixed(1)}°C
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
