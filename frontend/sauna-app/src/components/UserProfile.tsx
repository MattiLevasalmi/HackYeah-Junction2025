import { motion } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';


export interface User {
  userId: string;
  name: string;
  imagePath: string;
  age: number;
  gender: string;

}

interface UserProfileProps {
  user: User;
  isSelected: boolean;
  onSelect: () => void;
  delay: number;
}

export function UserProfile({ user, isSelected, onSelect, delay }: UserProfileProps) {
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay }}
      onClick={onSelect}
      className="flex flex-col items-center gap-3 group relative"
    >
      {/* Avatar container */}
      <div className="relative">
        {/* Glow effect when selected */}
        {isSelected && (
          <motion.div
            layoutId={`glow-${user.userId}`}
            className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-500 to-red-500 blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ duration: 0.3 }}
          ></motion.div>
        )}

        {/* Avatar image */}
        <motion.div
          className="relative w-20 h-20 rounded-full overflow-hidden border-4 transition-all duration-300"
          style={{
            borderColor: isSelected ? '#ea580c' : 'transparent'
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ImageWithFallback
            src={user.imagePath} 
            alt={user.name}
            className="w-full h-full object-cover"
          />
          
          {/* Overlay gradient on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-orange-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </motion.div>

        {/* Selection indicator */}
        {isSelected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center border-2 border-neutral-900"
          >
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </motion.div>
        )}
      </div>

      {/* User name */}
      <motion.span
        className="transition-colors duration-300"
        style={{
          color: isSelected ? '#f97316' : '#a3a3a3'
        }}
      >
        {user.name}
      </motion.span>
    </motion.button>
  );
}
