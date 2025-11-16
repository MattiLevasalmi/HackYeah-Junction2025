import { motion } from 'motion/react';
import { Thermometer, Clock, Droplets } from 'lucide-react';
import './QuickPreset.css';

interface Preset {
  name: string;
  temp: number;
  time: number;
  steam: number;
}

interface QuickPresetProps {
  preset: Preset;
  onApply: () => void;
}

export function QuickPreset({ preset, onApply }: QuickPresetProps) {
  const presetType = preset.name.toLowerCase();

  return (
    <motion.button
      onClick={onApply}
      className="quick-preset-button bg-neutral-800/50 hover:bg-neutral-800 border border-neutral-700/50 hover:border-orange-600/50 rounded-2xl p-4 transition-all duration-300 group"
      data-preset={presetType}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="quick-preset-content space-y-3">
        <div className="quick-preset-name text-white group-hover:text-orange-400 transition-colors">
          {preset.name}
        </div>
        
        <div className="quick-preset-stats space-y-1.5">
          <div className="quick-preset-stat flex items-center gap-1.5 text-neutral-400">
            <Thermometer className="quick-preset-icon w-3.5 h-3.5" />
            <span className="quick-preset-value text-xs">{preset.temp}°C</span>
          </div>
          
          <div className="quick-preset-stat flex items-center gap-1.5 text-neutral-400">
            <Clock className="quick-preset-icon w-3.5 h-3.5" />
            <span className="quick-preset-value text-xs">{preset.time}min</span>
          </div>
          
          <div className="quick-preset-stat flex items-center gap-1.5 text-neutral-400">
            <Droplets className="quick-preset-icon w-3.5 h-3.5" />
            <span className="quick-preset-value text-xs">{preset.steam}%</span>
          </div>
        </div>
      </div>
    </motion.button>
  );
}