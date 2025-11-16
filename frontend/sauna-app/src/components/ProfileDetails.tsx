import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Flame, Calendar, Thermometer, Award, Heart, Trophy, ArrowLeft } from "lucide-react";
import "./ProfileDetails.css";
import axios from "axios";

const iconMap = {
  flame: Flame,
  calendar: Calendar,
  thermometer: Thermometer,
  award: Award,
  heart: Heart,
  trophy: Trophy,
};

interface ProfileDetailsProps {
  selectedUser: string;
  onBack: () => void;
}

interface UserData {
    email: string
    firstName: string
    lastName: string
    imagePath: string
    age: number
    sex: string
    experienceLevel: string
}

export function ProfileDetails({ selectedUser, onBack }: ProfileDetailsProps) {
    const [user, setUser] = useState<UserData | null>(null);
    useEffect(() => {
        axios.get(`${import.meta.env.VITE_API_URL}/api/users/${selectedUser}`).then(res => {
            res.data.user.imagePath = `/${res.data.user.imagePath}`
            setUser(res.data.user);
            console.log(res);
        }).catch(console.error);
    }, []);

    const achievements = [
      { id: 1, name: "First Löyly", icon: "flame", earned: Math.floor(Math.random() * 2) },
      { id: 2, name: "Week Warrior", icon: "calendar", earned: Math.floor(Math.random() * 2) },
      { id: 3, name: "Heat Master", icon: "thermometer", earned: Math.floor(Math.random() * 2) },
      { id: 4, name: "Tradition Keeper", icon: "award", earned: Math.floor(Math.random() * 2) },
      { id: 5, name: "Wellness Pro", icon: "heart", earned: Math.floor(Math.random() * 2) },
      { id: 6, name: "Century Club", icon: "trophy", earned: Math.floor(Math.random() * 2) },
    ]

    return (
        <div className="profile-details-container">
            {/* Animated background heat wave effect */}
            <div className="profile-background-effects">
            <motion.div
                className="heat-wave-effect"
                animate={{
                background: [
                    "radial-gradient(circle at 20% 50%, rgba(220, 38, 38, 0.3) 0%, transparent 50%)",
                    "radial-gradient(circle at 80% 50%, rgba(234, 88, 12, 0.3) 0%, transparent 50%)",
                    "radial-gradient(circle at 50% 80%, rgba(220, 38, 38, 0.3) 0%, transparent 50%)",
                    "radial-gradient(circle at 20% 50%, rgba(220, 38, 38, 0.3) 0%, transparent 50%)",
                ]
                }}
                transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut"
                }}
            />
            </div>

            {/* Ambient glow orbs */}
            <div className="glow-orb glow-orb-top" />
            <div className="glow-orb glow-orb-bottom" />

            {/* Content */}
            <div className="profile-content">
            {/* Back Button */}
            <motion.button
                onClick={onBack}
                className="back-button"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
            >
                <ArrowLeft className="back-icon" />
                Back
            </motion.button>

            {/* Profile Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="profile-header"
            >
                {/* Profile Picture with glowing ring */}
                <motion.div
                className="profile-picture-wrapper"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
                >
                <div className="profile-glow-ring" />
                <div className="profile-gradient-ring">
                    <img
                    src={user?.imagePath}
                    alt={user?.firstName}
                    className="profile-image"
                    />
                </div>
                </motion.div>

                {/* User Name */}
                <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="profile-name"
                >
                {user?.firstName + ' ' + user?.lastName}
                </motion.h1>

                {/* User Details Grid */}
                <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="profile-info-grid"
                >
                <InfoRow label="Email" value={user?.email ?? ''} />
                <InfoRow label="Age" value={user?.age?.toString() ?? ''} />
                <InfoRow label="Sex" value={user?.sex ?? ''} />
                <InfoRow label="Experience Level" value={user?.experienceLevel ?? ''} />
                </motion.div>
            </motion.div>

            {/* Achievements Section */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="achievements-section"
            >
                {/* Section Title */}
                <div className="section-title-wrapper">
                <h2 className="section-title">Achievements & Streak</h2>
                <div className="title-underline" />
                </div>

                {/* Streak Counter */}
                <motion.div
                className="streak-counter-wrapper"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400 }}
                >
                <div className="streak-counter-glow" />
                <div className="streak-counter">
                    <div className="streak-counter-content">
                    <div className="streak-icon-wrapper">
                        <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            rotate: [0, 5, -5, 0]
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="streak-icon-container"
                        >
                        <div className="streak-icon-glow" />
                        <Flame className="streak-icon" />
                        </motion.div>
                        <div>
                        <div className="streak-label">Current Streak</div>
                        <div className="streak-value">
                            {Math.floor(Math.random() * 400)} Days
                        </div>
                        </div>
                    </div>
                    <motion.div
                        className="streak-badge"
                        animate={{
                        boxShadow: [
                            "0 0 20px rgba(251, 146, 60, 0.3)",
                            "0 0 30px rgba(251, 146, 60, 0.5)",
                            "0 0 20px rgba(251, 146, 60, 0.3)"
                        ]
                        }}
                        transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                        }}
                    >
                        <span className="streak-badge-text">🔥 On Fire!</span>
                    </motion.div>
                    </div>
                </div>
                </motion.div>

                {/* Achievements Grid */}
                <div className="achievements-grid">
                {achievements.map((achievement, index) => (
                    <BadgeItem
                    key={achievement.id}
                    achievement={achievement}
                    index={index}
                    />
                ))}
                </div>
            </motion.div>
            </div>
        </div>
        );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="info-row">
      <span className="info-label">{label}</span>
      <span className="info-value">{value}</span>
    </div>
  );
}

function BadgeItem({ achievement, index }: { achievement: any; index: number }) {
  const IconComponent = iconMap[achievement.icon as keyof typeof iconMap] || Award;
  const isEarned = achievement.earned;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.8 + index * 0.1, duration: 0.4 }}
      whileHover={{ scale: 1.05, y: -5 }}
      className="badge-wrapper"
    >
      {/* Glow effect for earned badges */}
      {isEarned ? (
        <motion.div
          className="badge-glow"
          animate={{
            opacity: [0.5, 0.8, 0.5]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      ) : <></>}

      <div className={`badge-container ${isEarned ? 'badge-earned' : 'badge-locked'}`}>
        {/* Badge icon with ember ring */}
        <div className="badge-content">
          <div className="badge-icon-wrapper">
            {/* Ember ring */}
            {isEarned ? (
              <motion.div
                className="ember-ring"
                animate={{ rotate: 360 }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
            ) : <></>}
            <div className={`badge-icon-container ${isEarned ? 'badge-icon-earned' : 'badge-icon-locked'}`}>
              <IconComponent className={`badge-icon ${isEarned ? 'icon-earned' : 'icon-locked'}`} />
            </div>
          </div>

          {/* Badge name */}
          <span className={`badge-name ${isEarned ? 'badge-name-earned' : 'badge-name-locked'}`}>
            {achievement.name}
          </span>
        </div>

        {/* Lock icon for unearned badges */}
        {!isEarned && (
          <div className="badge-lock-icon">
            <span>🔒</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
