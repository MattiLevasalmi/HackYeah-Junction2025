import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { UserProfile } from "./UserProfile";
import "./StartScreen.css";

interface StartScreenProps {
  selectedUsers: number[];
  setSelectedUsers: (users: number[]) => void;
  onNext: () => void;
}

const subtitles = [
  "Your Sauna. Your Control.",
  "Smart Heating Made Simple.",
  "Experience Pure Relaxation.",
];

const users = [
  { id: 1, name: "Anna", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop" },
  { id: 2, name: "Mikko", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop" },
  { id: 3, name: "Eeva", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop" },
];

export function StartScreen({ selectedUsers, setSelectedUsers, onNext }: StartScreenProps) {
  const [currentSubtitleIndex, setCurrentSubtitleIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSubtitleIndex((prev) => (prev + 1) % subtitles.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const toggleUser = (userId: number) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  return (
    <div className="StartScreen">
      <div className="bg-glow"></div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        My Harvia
      </motion.h1>

      <div className="h-12">
        <AnimatePresence mode="wait">
          <motion.p
            key={currentSubtitleIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
            className="subtitle"
          >
            {subtitles[currentSubtitleIndex]}
          </motion.p>
        </AnimatePresence>
      </div>

      <div className="users">
        {users.map((user, index) => (
          <UserProfile
            key={user.id}
            user={user}
            isSelected={selectedUsers.includes(user.id)}
            onSelect={() => toggleUser(user.id)}
            delay={index * 0.1}
          />
        ))}
      </div>

      <motion.button
        className="next-button"
        onClick={onNext}
        disabled={selectedUsers.length === 0}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <div className="glow"></div>
        <span>Next</span>
      </motion.button>
    </div>
  );
}
