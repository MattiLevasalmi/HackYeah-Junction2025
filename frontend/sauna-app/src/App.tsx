import { useState } from "react";
import { StartScreen } from "./components/StartScreen";
import { NextScreen } from "./components/NextScreen";
import { PhoneEmulator } from "./components/PhoneEmulator";
import { SaunaView } from "./components/SaunaView";
import { AISaunaMode } from "./components/AISaunaMode";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'start' | 'next' | 'sauna' | 'ai'>('start');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const handleNext = () => setCurrentScreen('next');
  const handleStartSauna = () => setCurrentScreen('sauna');
  const handleBack = () => {
    setCurrentScreen('start');
    setSelectedUsers([]);
  };

  return (
    <>
      {currentScreen === 'sauna' ? (
        <SaunaView />
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
              />
            )}

            {currentScreen === 'next' && (
              <NextScreen
                onBack={handleBack}
                selectedUsers={selectedUsers}
              >
                {/* Glowing orange NEXT button */}
                <button
                  className="mt-6 bg-orange-600 text-white px-6 py-3 rounded-xl shadow-lg shadow-orange-500/40 
                             text-lg font-medium w-full transition hover:bg-orange-500"
                  onClick={() => setCurrentScreen('ai')}
                >
                  Next
                </button>
              </NextScreen>
            )}

            {currentScreen === 'ai' && (
             <AISaunaMode
                onClick={() => setCurrentScreen('ai')} // now Confirm triggers AI Recommendation
              />
            )}

          </PhoneEmulator>
        </div>
      )}
    </>
  );
}
