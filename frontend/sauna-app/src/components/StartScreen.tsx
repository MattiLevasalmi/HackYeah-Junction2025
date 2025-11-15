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
    axios.get('http://localhost:3000/api/users')
      .then(res => {
        const usersWithLeadingSlash = res.data.users.map((u: User) => ({
          ...u,
          imagePath: `/${u.imagePath}`
        }));
        setUsers(usersWithLeadingSlash);
      })
      .catch(console.error);
  }, []);

  // Only show the first 4 users
  const visibleUsers = users.slice(0, 4);

  return (
    <div className="StartScreen">
      <div className="bg-glow"></div>

      <motion.img
      src="/images/harvia.jpg"
      alt="My Harvia"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      style={{
        width: '400px',       // adjust size as needed
        height: 'auto',
        marginTop: '80px',
        borderRadius: '10px', // optional, rounded corners
        boxShadow: '0 0 30px #FF7F50, 0 0 60px #FF6347', // optional glow
      }}
    />

      <div className="h-12" style={{marginTop: '30px'}}>
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

      <div className="users-wrapper">
        <div className="users">
          {visibleUsers.map((user, index) => (
            <UserProfile
              key={user.userId}
              user={user}
              isSelected={selectedUsers.includes(user.userId)}
              onSelect={() => toggleUser(user.userId)}
              delay={index * 0.1}
            />
          ))}
        </div>
      </div>

      {selectedUsers.length === 0 && (
        <motion.p
          className="select-warning"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          Please select at least one user to continue
        </motion.p>
      )}

      {selectedUsers.length > 0 && (
        <motion.div
          className="selected-count"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''} selected
        </motion.div>
      )}

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
