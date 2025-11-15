import { motion } from 'motion/react';
import { ChevronLeft, Check } from 'lucide-react';

interface NextScreenProps {
  onBack: () => void;
  selectedUsers: number[];
}

export function NextScreen({ onBack, selectedUsers }: NextScreenProps) {
  return (
    <div className="w-full h-full bg-gradient-to-b from-neutral-950 via-neutral-900 to-black flex flex-col relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-full h-64 bg-gradient-to-b from-orange-600/10 to-transparent blur-3xl"></div>
      
      <div className="relative z-10 flex-1 flex flex-col">
        {/* Header with back button */}
        <div className="px-6 py-6">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={onBack}
            className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Back</span>
          </motion.button>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-8 pb-16">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.8, delay: 0.2 }}
            className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-600 to-red-600 flex items-center justify-center mb-8 relative"
          >
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-500 rounded-full blur-2xl opacity-50"></div>
            <Check className="w-12 h-12 text-white relative z-10" strokeWidth={3} />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-white text-center mb-4"
          >
            Ready to Start
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-neutral-400 text-center mb-2"
          >
            {selectedUsers.length === 1 ? '1 profile selected' : `${selectedUsers.length} profiles selected`}
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-neutral-500 text-center max-w-sm"
          >
            Your sauna experience is being personalized. Get ready to control your heating with precision and ease.
          </motion.p>
        </div>
      </div>
    </div>
  );
}
