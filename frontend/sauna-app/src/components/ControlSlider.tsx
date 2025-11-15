import { ReactNode } from 'react';
import { motion } from 'motion/react';
import './ControlSlider.css';

interface ControlSliderProps {
  icon: ReactNode;
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  unit: string;
  disabled?: boolean;
  color?: 'orange' | 'blue' | 'amber' | 'cyan';
}

export function ControlSlider({
  icon,
  label,
  value,
  onChange,
  min,
  max,
  unit,
  disabled = false,
  color = 'orange'
}: ControlSliderProps) {
  const percentage = ((value - min) / (max - min)) * 100;

  const colorClasses = {
    orange: 'from-orange-600 to-red-600',
    blue: 'from-blue-600 to-cyan-600',
    amber: 'from-amber-500 to-yellow-600',
    cyan: 'from-cyan-600 to-blue-600'
  };

  const glowColors = {
    orange: 'shadow-orange-500/50',
    blue: 'shadow-blue-500/50',
    amber: 'shadow-amber-500/50',
    cyan: 'shadow-cyan-500/50'
  };

  return (
    <div className={`control-slider-container ${disabled ? 'disabled' : ''}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`control-slider-icon-container p-2 rounded-xl ${disabled ? 'bg-neutral-800' : 'bg-neutral-800/50'}`}>
            <div className={disabled ? 'text-neutral-600' : 'text-neutral-400'}>
              {icon}
            </div>
          </div>
          <span className="control-slider-label text-neutral-300">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`control-slider-value ${disabled ? 'text-neutral-600' : 'text-white'}`}>
            {value}
          </span>
          <span className="control-slider-unit text-neutral-500">{unit}</span>
        </div>
      </div>

      <div className="relative">
        {/* Track */}
        <div className="control-slider-track h-2 bg-neutral-800 rounded-full overflow-hidden">
          {/* Progress */}
          <motion.div
            className={`control-slider-progress color-${color} h-full bg-gradient-to-r ${colorClasses[color]}`}
            style={{ width: `${percentage}%` }}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Slider input */}
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          disabled={disabled}
          className="control-slider-input absolute inset-0 w-full h-2 opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />

        {/* Thumb */}
        <motion.div
          className={`control-slider-thumb color-${color} absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full shadow-lg ${
            !disabled ? glowColors[color] : ''
          } pointer-events-none`}
          style={{ left: `calc(${percentage}% - 12px)` }}
          animate={{ left: `calc(${percentage}% - 12px)` }}
          transition={{ duration: 0.3 }}
        >
          {!disabled && (
            <div className={`control-slider-thumb-glow absolute inset-0 rounded-full bg-gradient-to-r ${colorClasses[color]} opacity-20 blur-sm`}></div>
          )}
        </motion.div>
      </div>
    </div>
  );
}