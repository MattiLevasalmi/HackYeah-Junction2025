import { useState } from "react";
import { StartScreen } from "./components/StartScreen";
import { NextScreen } from "./components/NextScreen";
import { PhoneEmulator } from "./components/PhoneEmulator";
import { SaunaView } from "./components/SaunaView";
import { AISaunaMode } from "./components/AISaunaMode";
import { AISaunaRecommendation } from "./components/AISaunaRecommendation";
import { motion, AnimatePresence } from "motion/react";
import { ProfileDetails } from "./components/ProfileDetails";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'start' | 'next' | 'sauna' | 'ai' | 'aiRec' | 'profile'>('start');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const handleNext = () => setCurrentScreen('next');
  const handleProfile = () => setCurrentScreen('profile');
  const handleBack = () => {
    setCurrentScreen('start');
    setSelectedUsers([]);
  };

  return (
    <>
      {currentScreen === 'sauna' ? (
        <SaunaView /> // Full-page sauna view
      ) : (
        <div className="min-h-screen w-full bg-gradient-to-br from-zinc-950 via-neutral-900 to-zinc-900 
                        flex items-center justify-center p-4 sm:p-8 relative overflow-hidden">
          
          {/* Background glow effects */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 -left-48 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-red-600/10 rounded-full blur-3xl"></div>
          </div>

          <PhoneEmulator>
            {currentScreen === 'start' && (
              <StartScreen
                selectedUsers={selectedUsers}
                setSelectedUsers={setSelectedUsers}
                onNext={handleNext}
                onProfile={handleProfile}
              />
            )}

            {currentScreen === 'next' && (
              <NextScreen
                onBack={handleBack}
                selectedUsers={selectedUsers}
              >
               <motion.button
                onClick={() => setCurrentScreen('ai')}
                disabled={selectedUsers.length === 0}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                style={{
                  width: "100%",
                  padding: "1rem 0",
                  marginTop: "auto",
                  borderRadius: "1rem",
                  backgroundColor: "#ea580c",
                  color: "#ffffff", // primary-foreground
                  fontWeight: 500,
                  textAlign: "center",
                  position: "relative",
                  overflow: "hidden",
                  cursor: selectedUsers.length === 0 ? "not-allowed" : "pointer",
                  opacity: selectedUsers.length === 0 ? 0.5 : 1,
                  transition: "transform 0.2s ease, opacity 0.2s ease",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(to right, #ea580c, #d47018)",
                    filter: "blur(1rem)",
                    opacity: 0.6,
                    transition: "opacity 0.3s ease",
                    pointerEvents: "none", // ensures glow doesn't block clicks
                  }}
                ></div>
                <span style={{ position: "relative", zIndex: 1 }}>Next</span>
              </motion.button>
              </NextScreen>
            )}

            {currentScreen === 'ai' && (
              <AISaunaMode
                onClick={() => setCurrentScreen('aiRec')} // Go to AI Recommendation
              />
            )}

            {currentScreen === 'aiRec' && (
              <AISaunaRecommendation
                users={selectedUsers}
                onBack={() => setCurrentScreen('ai')}       // Back to AI selection
                onStartSauna={() => setCurrentScreen('sauna')} // Start full-page sauna
              />
            )}
            {currentScreen === 'profile' && (
              <ProfileDetails selectedUser={selectedUsers[0]} onBack={handleBack} />
            )}

          </PhoneEmulator>
        </div>
      )}
    </>
  );
}

