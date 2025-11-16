import { motion } from "motion/react";
import { Flame } from "lucide-react";
import './Header.css';

interface HeaderProps {
  isPowerOn: boolean;
  onBackToStart?: () => void; // callback for back button
}


export function Header({ isPowerOn }: HeaderProps) {
  return (
    <header className="header">
      <div className="header__inner">
        <div className="header__logo-group">
          <div className="header__logo">
            <Flame className="header__flame" />
            {isPowerOn && (
              <motion.div
                className="header__flame-overlay"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Flame className="header__flame-overlay" />
              </motion.div>
            )}
          </div>
          <div>
            <h1 className="header__title">My Harvia</h1>
            <p className="header__subtitle">Sauna Control</p>
          </div>
        </div>

        <div className="header__status">
          <div className={`header__status-dot ${isPowerOn ? "active" : "inactive"}`}></div>
          <span className="header__status-text">{isPowerOn ? "Active" : "Standby"}</span>
        </div>
      </div>
    </header>
  );
}
