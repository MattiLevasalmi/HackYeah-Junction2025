import { motion } from 'motion/react';
import { Power, Thermometer, Sun, Clock, Droplets, ChevronRight } from 'lucide-react';
import { ControlSlider } from './ControlSlider';
import { QuickPreset } from './QuickPreset';
import './SaunaSettings.css';

interface SaunaSettingsProps {
  temperature: number;
  setTemperature: (value: number) => void;
  lighting: number;
  setLighting: (value: number) => void;
  timer: number;
  setTimer: (value: number) => void;
  steamLevel: number;
  setSteamLevel: (value: number) => void;
  isPowerOn: boolean;
  setIsPowerOn: (value: boolean) => void;
}

export function SaunaSettings({
  temperature,
  setTemperature,
  lighting,
  setLighting,
  timer,
  setTimer,
  steamLevel,
  setSteamLevel,
  isPowerOn,
  setIsPowerOn
}: SaunaSettingsProps) {
  const presets = [
    { name: 'Mild', temp: 60, time: 20, steam: 30 },
    { name: 'Cozy', temp: 75, time: 30, steam: 40 },
    { name: 'Hot', temp: 90, time: 45, steam: 60 }
  ];

  const applyPreset = (preset: typeof presets[0]) => {
    setTemperature(preset.temp);
    setTimer(preset.time);
    setSteamLevel(preset.steam);
    setIsPowerOn(true);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="sauna-settings-scroll space-y-6">
      {/* Power Control */}
      <div className={`bg-gradient-to-br from-neutral-900 to-neutral-950 rounded-3xl p-6 border border-neutral-800/50 shadow-2xl glass-card hover-lift ${isPowerOn ? 'power-active-glow' : ''}`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-2xl ${isPowerOn ? 'bg-gradient-to-br from-orange-600 to-red-600' : 'bg-neutral-800'} transition-all duration-300`}>
              <Power className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-white">Power</h2>
              <p className="text-neutral-500">{isPowerOn ? 'System Active' : 'System Off'}</p>
            </div>
          </div>

          {/* Power toggle */}
          <button
            onClick={() => setIsPowerOn(!isPowerOn)}
            className={`relative w-16 h-9 rounded-full transition-all duration-300 ${
              isPowerOn ? 'bg-gradient-to-r from-orange-600 to-red-600' : 'bg-neutral-700'
            }`}
          >
            <motion.div
              className="absolute top-1 left-1 w-7 h-7 bg-white rounded-full shadow-lg"
              animate={{ x: isPowerOn ? 28 : 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </button>
        </div>
      </div>

      {/* Quick Presets */}
      <div className="bg-gradient-to-br from-neutral-900 to-neutral-950 rounded-3xl p-6 border border-neutral-800/50 shadow-2xl glass-card hover-lift">
        <h3 className="text-white mb-4">Quick Start</h3>
        <div className="grid grid-cols-3 gap-3">
          {presets.map((preset) => (
            <QuickPreset
              key={preset.name}
              preset={preset}
              onApply={() => applyPreset(preset)}
            />
          ))}
        </div>
      </div>

      {/* Sliders */}
      <div className="bg-gradient-to-br from-neutral-900 to-neutral-950 rounded-3xl p-6 border border-neutral-800/50 shadow-2xl glass-card hover-lift space-y-6">
        <h3 className="text-white">Settings</h3>

        {/* Temperature Control */}
        <ControlSlider
          icon={<Thermometer className="w-5 h-5" />}
          label="Temperature"
          value={temperature}
          onChange={setTemperature}
          min={40}
          max={100}
          unit="°C"
          disabled={!isPowerOn}
          color="orange"
        />

        {/* Timer Control */}
        <ControlSlider
          icon={<Clock className="w-5 h-5" />}
          label="Timer"
          value={timer}
          onChange={setTimer}
          min={5}
          max={60}
          unit="min"
          disabled={!isPowerOn}
          color="blue"
        />

        {/* Lighting Control */}
        <ControlSlider
          icon={<Sun className="w-5 h-5" />}
          label="Lighting"
          value={lighting}
          onChange={setLighting}
          min={0}
          max={100}
          unit="%"
          disabled={!isPowerOn}
          color="amber"
        />

        {/* Steam Control */}
        <ControlSlider
          icon={<Droplets className="w-5 h-5" />}
          label="Steam Level"
          value={steamLevel}
          onChange={setSteamLevel}
          min={0}
          max={100}
          unit="%"
          disabled={!isPowerOn}
          color="cyan"
        />
      </div>

      {/* Additional Features Card */}
      <div className="bg-gradient-to-br from-neutral-900 to-neutral-950 rounded-3xl p-6 border border-neutral-800/50 shadow-2xl">
        <div className="space-y-3">
          <button className="w-full flex items-center justify-between p-4 bg-neutral-800/50 hover:bg-neutral-800 rounded-2xl transition-all duration-200 group">
            <span className="text-neutral-300">Schedule Session</span>
            <ChevronRight className="w-5 h-5 text-neutral-500 group-hover:text-neutral-300 transition-colors" />
          </button>
          
          <button className="w-full flex items-center justify-between p-4 bg-neutral-800/50 hover:bg-neutral-800 rounded-2xl transition-all duration-200 group">
            <span className="text-neutral-300">History & Analytics</span>
            <ChevronRight className="w-5 h-5 text-neutral-500 group-hover:text-neutral-300 transition-colors" />
          </button>
          
          <button className="w-full flex items-center justify-between p-4 bg-neutral-800/50 hover:bg-neutral-800 rounded-2xl transition-all duration-200 group">
            <span className="text-neutral-300">Safety Settings</span>
            <ChevronRight className="w-5 h-5 text-neutral-500 group-hover:text-neutral-300 transition-colors" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}