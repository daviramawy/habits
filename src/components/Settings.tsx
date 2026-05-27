import { useState } from "react";
import { UserProfile } from "../types";
import { Settings2, Trash2, BookOpen, AlertCircle, Info, Sword, Github, FileText, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface SettingsProps {
  profile: UserProfile;
  theme: "dark" | "light";
  onToggleTheme: () => void;
  onClearData: () => void;
}

export default function Settings({ profile, theme, onToggleTheme, onClearData }: SettingsProps) {
  const [showWipeModal, setShowWipeModal] = useState(false);
  const [wipeConfirmed, setWipeConfirmed] = useState(false);

  function executeWipe() {
    onClearData();
    setShowWipeModal(false);
    setWipeConfirmed(true);
    setTimeout(() => setWipeConfirmed(false), 3000);
  }

  return (
    <div className="space-y-6" id="settings-container">
      {/* Notifications banner */}
      <AnimatePresence>
        {wipeConfirmed && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-4 bg-emerald-950/90 border-2 border-emerald-500 text-emerald-200 rounded-[22px] flex items-center gap-3 font-mono text-xs uppercase"
            id="wipe-success-banner"
          >
            <Check className="w-5 h-5 text-emerald-400" />
            <span>Successfully wiped game state and reset campaign progress!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <section className="text-center py-2" id="settings-header">
        <h2 className="font-headline font-bold text-3xl text-[#EEB76B] tracking-wider uppercase">
          Settings & Options
        </h2>
        <p className="font-mono text-[#d4c4b3] text-xs uppercase tracking-widest mt-1">
          Customize your experience or reset campaign logs
        </p>
      </section>

      {/* Configuration Cards */}
      <div className="space-y-6">
        
        {/* Appearance Control Card */}
        <div className="bg-[#3b1212]/90 rounded-[22px] p-6 border-2 border-[#EEB76B]" id="settings-theme-card">
          <h3 className="font-headline text-lg font-bold text-[#EEB76B] mb-4 flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-[#E2703A]" />
            Appearance Configuration
          </h3>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-[#240304]/40 rounded-xl border border-[#504538]">
            <div>
              <p className="font-headline text-[#EEB76B] font-bold">Realm Color Theme</p>
              <p className="font-mono text-xs text-[#d4c4b3] mt-1">
                Toggle between the Dark Gothic Dungeon canvas and Light Royal Parchment theme.
              </p>
            </div>
            <button
              onClick={onToggleTheme}
              className="px-5 py-3 h-[44px] min-w-[120px] bg-[#EEB76B] hover:bg-[#ffd1d8] text-[#310B0B] font-headline font-bold rounded-xl border-b-4 border-[#E2703A] text-xs uppercase transition-all duration-100 active:translate-y-0.5 active:border-b-0 cursor-pointer text-center"
              id="theme-toggle-btn"
            >
              {theme === "dark" ? "Parchment Light" : "Gothic Dark"}
            </button>
          </div>
        </div>

        {/* Guild Manual Panel */}
        <div className="bg-[#3b1212]/90 rounded-[22px] p-6 border-2 border-[#EEB76B]" id="settings-manual-card">
          <h3 className="font-headline text-lg font-bold text-[#EEB76B] mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#E2703A]" />
            OverStressed Guild Handbook
          </h3>

          <div className="space-y-4 font-mono text-xs text-[#d4c4b3] leading-relaxed">
            <div className="p-3 bg-[#240304]/40 border border-[#504538] rounded-xl flex items-start gap-3">
              <Sword className="w-5 h-5 text-[#EEB76B] flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-headline font-bold text-[#EEB76B] block">1. Combat Experience (XP)</span>
                XP is cumulative and permanent. You can never lose XP! Reaching higher levels unlocks improved weaponry and armor, evolving your hero sprite!
              </div>
            </div>

            <div className="p-3 bg-[#240304]/40 border border border-[#504538] rounded-xl flex items-start gap-3">
              <Info className="w-5 h-5 text-[#E2703A] flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-headline font-bold text-[#E2703A] block">2. Star Economy and Streaks</span>
                Stars are spent in the Armory Shop. Active habit streaks trigger gold bonuses: completing "Dance" on a 7-day streak grants +3 Stars, completing "Write" on a 3-day streak grants +6 Stars, and completing Tennis awards +9 Stars instantly every day!
              </div>
            </div>

            <div className="p-3 bg-[#240304]/50 border border border-[#9c3d54]/30 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-[#9c3d54] flex-shrink-0 mt-0.5 animate-pulse" />
              <div>
                <span className="font-headline font-bold text-[#9c3d54] block">3. Enemy Attacks</span>
                If any quest is unchecked at mid-day boundaries, your active level's threat enters an attack stance! Clear your checklist daily to protect your guild and keep your streaks pristine.
              </div>
            </div>
          </div>
        </div>

        {/* System & Operations Control (Purge Campaign) */}
        <div className="bg-[#3b1212]/90 rounded-[22px] p-6 border-2 border-[#9c3d54]" id="settings-danger-card">
          <h3 className="font-headline text-lg font-bold text-[#9c3d54] mb-4 uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Operations Danger Zone
          </h3>

          <div className="p-4 bg-[#240304]/40 border border-[#9c3d54]/30 rounded-xl space-y-4">
            <p className="font-mono text-xs text-[#ffdad7] leading-relaxed">
              Purges all persistent database values, streaks, equipment, and level rewards to restore your profile to brand-new level 1 apprentice status. This action cannot be revoked.
            </p>
            <button
              onClick={() => setShowWipeModal(true)}
              className="h-[44px] px-5 bg-[#9c3d54] hover:bg-[#b04f66] text-white font-headline font-bold rounded-xl border-b-4 border-[#61192b] text-xs uppercase transition-all duration-100 active:translate-y-0.5 active:border-b-0 cursor-pointer flex items-center gap-2"
              id="master-purge-btn"
            >
              <Trash2 className="w-4 h-4" />
              Purge Character Campaign
            </button>
          </div>
        </div>
      </div>

      {/* Wipe Confirmation Dialog Modal */}
      {showWipeModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-sm bg-[#2b0707] text-[#ffdad7] border-4 border-[#9c3d54] rounded-[22px] p-6 relative"
            id="purge-confirm-dialog"
          >
            <h4 className="font-headline text-xl text-[#9c3d54] font-bold uppercase mb-2">
              Purge Character ?
            </h4>
            <p className="font-mono text-xs text-[#ffdad7]/80 leading-relaxed mb-6">
              Confirming this will disintegrate your warrior's equipment, reset your cumulative Experience Points to 0, and clear your habit logs from the kingdom database.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowWipeModal(false)}
                className="flex-1 bg-[#471d1b] text-white py-3 border border-[#9c8e7f] rounded-xl font-mono text-xs uppercase cursor-pointer"
                id="purge-dialog-no"
              >
                Retreat
              </button>
              <button
                onClick={executeWipe}
                className="flex-1 bg-[#9c3d54] hover:bg-[#b04f66] text-white py-3 rounded-xl font-headline font-bold border-b-4 border-[#61192b] text-xs uppercase active:translate-y-0.5 active:border-b-0 cursor-pointer"
                id="purge-dialog-yes"
              >
                Confirm Purge
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
