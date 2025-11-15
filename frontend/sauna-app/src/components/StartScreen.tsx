import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { UserProfile } from "./UserProfile";
import "./StartScreen.css";
import axios from 'axios';
import type { User } from './UserProfile';

interface StartScreenProps {
  selectedUsers: string[];
  setSelectedUsers: (users: string[]) => void;
  onNext: () => void;
}

const subtitles = [
  "Your Sauna. Your Control.",
  "Smart Heating Made Simple.",
  "Experience Pure Relaxation.",
];



export function StartScreen({ selectedUsers, setSelectedUsers, onNext }: StartScreenProps) {
  const [currentSubtitleIndex, setCurrentSubtitleIndex] = useState(0);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSubtitleIndex((prev) => (prev + 1) % subtitles.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const toggleUser = (userId: string) => {
  if (selectedUsers.includes(userId)) {
    setSelectedUsers(selectedUsers.filter((id) => id !== userId));
  } else {
    setSelectedUsers([...selectedUsers, userId]);
  }
};


useEffect(() => {
  axios
    .get('http://localhost:3000/api/users')
    .then(res => setUsers(res.data.users as User[]))
    .catch(console.error);
}, []);
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
            key={user.userId}
            user={user}
            isSelected={selectedUsers.includes(user.userId)}
            onSelect={() => toggleUser(user.userId)}
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
