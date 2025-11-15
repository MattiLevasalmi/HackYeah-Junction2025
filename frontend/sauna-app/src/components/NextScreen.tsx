import { motion } from 'motion/react';
import { ChevronLeft, Check } from 'lucide-react';
import './NextScreen.css';

interface NextScreenProps {
  children?: React.ReactNode;
  onBack: () => void;
  selectedUsers: string[];
}

export function NextScreen({ onBack, selectedUsers, children }: NextScreenProps) {
  return (
    <div className="next-screen">
      {/* Header */}
      <div className="next-screen__header">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={onBack}
          className="next-screen__back-button"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Back</span>
        </motion.button>
      </div>

      {/* Content */}
      <div className="next-screen__content">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.8, delay: 0.2 }}
          className="next-screen__check-wrapper"
        >
          <div className="next-screen__glow"></div>
          <Check className="next-screen__check-icon" />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="next-screen__title"
        >
          Ready to Start
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="next-screen__subtitle"
        >
          {selectedUsers.length === 1
            ? '1 profile selected'
            : `${selectedUsers.length} profiles selected`}
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="next-screen__description"
        >
          Your sauna experience is being personalized. Get ready to control your heating with precision and ease.
        </motion.p>

        <div className="next-screen__actions">{children}</div>
      </div>
    </div>
  );
}
