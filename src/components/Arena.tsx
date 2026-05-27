import { useState, useEffect } from "react";
import { UserProfile, SHOP_ITEMS } from "../types";
import { Sword, Compass, Zap, Flame, Calendar, Award, ShieldAlert, BadgeInfo, CheckCircle, RefreshCw, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import CameraModal from "./CameraModal";

interface ArenaProps {
  profile: UserProfile;
  onQuestVerified: (habitId: "habit1" | "habit2" | "habit3", xpGained: number, starsGained: number, analysis: string) => void;
  onSkipLevel?: () => void;
}

// Helper function to return beautiful dynamic styles (increasingly glowy and colorful) for each player level
function getArenaLevelStyles(level: number) {
  switch (level) {
    case 1:
      return {
        arenaBg: "bg-[#240304]/60",
        arenaBorder: "border-[#EEB76B]/40",
        arenaShadow: "shadow-none",
        avatarBg: "bg-gradient-to-t from-[#310B0B]/90 to-transparent",
        glowText: "text-[#EEB76B]",
        questCardBorder: "border-[#EEB76B]/30",
        bossHPBg: "bg-gradient-to-r from-[#9C3D54] via-[#E2703A] to-[#EEB76B]",
        buttonStyle: "bg-[#EEB76B] hover:bg-[#ffd1d8] text-[#310B0B] border-b-4 border-[#E2703A]",
        statGlow: "border-[#EEB76B]/30"
      };
    case 2:
      return {
        arenaBg: "bg-[#091724]/70",
        arenaBorder: "border-cyan-500/70",
        arenaShadow: "shadow-[0_0_20px_rgba(6,182,212,0.3)]",
        avatarBg: "bg-gradient-to-t from-cyan-950/80 to-transparent",
        glowText: "text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]",
        questCardBorder: "border-cyan-500/40",
        bossHPBg: "bg-gradient-to-r from-blue-600 via-sky-400 to-cyan-300",
        buttonStyle: "bg-cyan-500 hover:bg-cyan-400 text-slate-950 border-b-4 border-cyan-700",
        statGlow: "border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.15)]"
      };
    case 3:
      return {
        arenaBg: "bg-[#180824]/80",
        arenaBorder: "border-fuchsia-500/80",
        arenaShadow: "shadow-[0_0_25px_rgba(168,85,247,0.4)]",
        avatarBg: "bg-gradient-to-t from-purple-950/80 to-transparent",
        glowText: "text-fuchsia-400 drop-shadow-[0_0_10px_rgba(168,85,247,0.6)] animate-pulse",
        questCardBorder: "border-fuchsia-500/40",
        bossHPBg: "bg-gradient-to-r from-purple-600 via-fuchsia-400 to-pink-400",
        buttonStyle: "bg-fuchsia-500 hover:bg-fuchsia-400 text-slate-950 border-b-4 border-fuchsia-700",
        statGlow: "border-fuchsia-500/30 shadow-[0_0_15px_rgba(168,85,247,0.2)]"
      };
    case 4:
      return {
        arenaBg: "bg-[#261603]/85",
        arenaBorder: "border-amber-500",
        arenaShadow: "shadow-[0_0_35px_rgba(245,158,11,0.5)]",
        avatarBg: "bg-gradient-to-t from-amber-950/80 to-transparent",
        glowText: "text-amber-400 drop-shadow-[0_0_12px_rgba(245,158,11,0.7)] animate-pulse",
        questCardBorder: "border-amber-500/40",
        bossHPBg: "bg-gradient-to-r from-amber-600 via-yellow-400 to-orange-400",
        buttonStyle: "bg-amber-500 hover:bg-amber-400 text-slate-950 border-b-4 border-amber-700",
        statGlow: "border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.25)]"
      };
    default: // Level 5+
      return {
        arenaBg: "bg-[#240212]/90",
        arenaBorder: "border-rose-500",
        arenaShadow: "shadow-[0_0_45px_rgba(244,63,94,0.7),_inset_0_0_20px_rgba(6,182,212,0.3)] duration-1000 animate-pulse",
        avatarBg: "bg-gradient-to-t from-rose-950/90 via-[#3a011d]/70 to-transparent",
        glowText: "text-rose-400 drop-shadow-[0_0_15px_rgba(244,63,94,0.8)] font-extrabold tracking-widest animate-pulse",
        questCardBorder: "border-rose-500/50",
        bossHPBg: "bg-gradient-to-r from-rose-500 via-pink-400 via-purple-500 to-cyan-400",
        buttonStyle: "bg-rose-500 hover:bg-rose-400 text-white border-b-4 border-rose-800",
        statGlow: "border-rose-500/40 shadow-[0_0_25px_rgba(244,63,94,0.3)]"
      };
  }
}

export default function Arena({ profile, onQuestVerified, onSkipLevel }: ArenaProps) {
  // Tracker for camera modals
  const [activeCameraQuest, setActiveCameraQuest] = useState<"habit1" | "habit2" | "habit3" | null>(null);
  const [countdownStr, setCountdownStr] = useState("12:00:00");
  
  // Handle interactive Toast state
  const [toastText, setToastText] = useState<string | null>(null);

  // Motivational medieval quotes list
  const RPG_QUOTES = [
    "“Fortune favors the disciplined warrior!”",
    "“Clean lines build unbreakable plate armor!”",
    "“Even the Lord of the Reaper began with a single written verse.”",
    "“The strongest sword is forged under the heat of consistency.”",
    "“He who conquers their morning conquers the realm!”"
  ];
  const [quote, setQuote] = useState(RPG_QUOTES[0]);

  useEffect(() => {
    // Choose randomized daily quote on load
    const rand = RPG_QUOTES[Math.floor(Math.random() * RPG_QUOTES.length)];
    setQuote(rand);

    // Compute continuous daily countdown to midnight guild reset
    const interval = setInterval(() => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight.getTime() - now.getTime();
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff / (1000 * 60)) % 60);
      const secs = Math.floor((diff / 1000) % 60);

      const hStr = hours.toString().padStart(2, "0");
      const mStr = mins.toString().padStart(2, "0");
      const sStr = secs.toString().padStart(2, "0");
      setCountdownStr(`${hStr}:${mStr}:${sStr}`);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  function triggerToast(text: string) {
    setToastText(text);
    setTimeout(() => {
      setToastText(null);
    }, 4000);
  }

  const arTheme = getArenaLevelStyles(profile.level);

  // Calculate Boss HP based on habits done today
  const todayStr = new Date().toISOString().split("T")[0];
  const habit1Completed = profile.habit1_lastCompleted === todayStr;
  const habit2Completed = profile.habit2_lastCompleted === todayStr;
  const habit3Completed = profile.habit3_lastCompleted === todayStr;

  const completedCount = [habit1Completed, habit2Completed, habit3Completed].filter(Boolean).length;
  const maxHP = 100;
  const currentBossHP = Math.max(0, maxHP - (completedCount * 33.3));

  // Determine active level enemy details
  let enemyName = "Lazy Sloth (Level 1)";
  let attackMsg = "";
  let enemyVisualId = 1;
  let statusPenaltyText = "";

  if (profile.xp > 500 && profile.xp <= 1500) {
    enemyName = "Energy Thief (Level 2)";
    enemyVisualId = 2;
  } else if (profile.xp > 1500) {
    enemyName = "Impending Doom (Level 3)";
    enemyVisualId = 3;
  }

  // Calculate yesterday misses to display Threat Attack banner
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yStr = yesterday.toISOString().split("T")[0];

  const missedYesterday = 
    profile.lastCheckedDate !== todayStr &&
    (profile.habit1_lastCompleted !== yStr && profile.habit1_lastCompleted !== todayStr) ||
    (profile.habit2_lastCompleted !== yStr && profile.habit2_lastCompleted !== todayStr) ||
    (profile.habit3_lastCompleted !== yStr && profile.habit3_lastCompleted !== todayStr);

  if (missedYesterday) {
    if (enemyVisualId === 1) {
      statusPenaltyText = "The Lazy Sloth froze your training fields! Focus state frozen.";
    } else if (enemyVisualId === 2) {
      statusPenaltyText = "The Energy Thief sneaked in and depleted -5 Experience from your character record!";
    } else {
      statusPenaltyText = "Impending Doom has drained -1 of your Armory Coins! Restore loyalty bounds immediately!";
    }
  }

  // Handle successful scan verify rewards
  function handleCameraVerifySuccess(verified: boolean, analysis: string) {
    if (!verified) {
      triggerToast("AI Taskmaster: Effort not fully registered. Try again with a clear view!");
      return;
    }

    if (!activeCameraQuest) return;

    // Standardized rewards
    let xpAward = 5;
    let starsAward = 0;

    // Streak multipliers logic
    const consecutiveMultiplier = 1; // Double XP if any streak is active according to rules or streak counter
    const baseMultiplier = (profile.habit1_streak > 0 || profile.habit2_streak > 0 || profile.habit3_streak > 0) ? 2 : 1;

    if (activeCameraQuest === "habit1") {
      xpAward = 5 * baseMultiplier;
      // Stars unlocked on 7-day streak condition
      const is7day = (profile.habit1_streak + 1) % 7 === 0;
      if (is7day) {
        starsAward = 3;
      }
    } else if (activeCameraQuest === "habit2") {
      xpAward = 10 * baseMultiplier;
      // Stars unlocked on 3-day streak condition
      const is3day = (profile.habit2_streak + 1) % 3 === 0;
      if (is3day) {
        starsAward = 6;
      }
    } else {
      xpAward = 15 * baseMultiplier;
      // Sports awards Stars on EVERY completion!
      starsAward = 9;
    }

    onQuestVerified(activeCameraQuest, xpAward, starsAward, analysis);
    triggerToast(`Victory! Claimed +${xpAward} XP and ⭐ ${starsAward} Coins!`);
  }

  // Draw Protagonist Evolving Avatar using interactive inline Pixel SVGs
  const renderProtagonistSVG = () => {
    let charLevel = 1;
    if (profile.xp > 500 && profile.xp <= 1000) charLevel = 2;
    else if (profile.xp > 1000 && profile.xp <= 2000) charLevel = 3;
    else if (profile.xp > 2000 && profile.xp <= 3500) charLevel = 4;
    else if (profile.xp > 3500) charLevel = 5;

    // Equipments owned and active
    const wearsCape = profile.equipped?.includes("cape");
    const hasParrot = profile.equipped?.includes("parrot");

    return (
      <svg 
        viewBox="0 0 100 120" 
        className="w-40 h-48 mx-auto filter drop-shadow-[0_6px_0_rgba(0,0,0,0.5)] transition-all duration-300"
        id="protagonist-pixel-sprite"
      >
        <defs>
          {/* Subtle gradient glowing glows for high levels */}
          <radialGradient id="aura-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={charLevel === 5 ? "#E2703A" : charLevel === 4 ? "#EEB76B" : "#B2E7FA"} stopOpacity="0.7" />
            <stop offset="100%" stopColor="#310B0B" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Aura FX glow background */}
        {charLevel >= 3 && (
          <circle cx="50" cy="60" r="38" fill="url(#aura-glow)" className="animate-pulse" />
        )}

        {/* Dynamic wings (Level 5) */}
        {charLevel === 5 && (
          <g fill="#E2703A" className="animate-bounce">
            {/* Left pixel wing */}
            <rect x="12" y="25" width="12" height="6" />
            <rect x="8" y="31" width="16" height="6" />
            <rect x="16" y="37" width="12" height="6" />
            {/* Right wing */}
            <rect x="76" y="25" width="12" height="6" />
            <rect x="76" y="31" width="16" height="6" />
            <rect x="72" y="37" width="12" height="6" />
          </g>
        )}

        {/* Hero Cape (Purchased accessory) */}
        {wearsCape && (
          <g fill="#9c3d54">
            <rect x="30" y="55" width="40" height="30" />
            <rect x="25" y="60" width="5" height="25" />
            <rect x="70" y="60" width="5" height="25" />
          </g>
        )}

        {/* Human tan skin */}
        <g fill="#e3a476">
          <rect x="42" y="36" width="16" height="16" /> {/* face */}
          <rect x="46" y="52" width="8" height="4" /> {/* neck */}
          <rect x="30" y="56" width="4" height="12" /> {/* left hand */}
          <rect x="66" y="56" width="4" height="12" /> {/* right hand */}
        </g>

        {/* Hair and facial traits */}
        <g fill="#4a311a">
          <rect x="40" y="32" width="20" height="6" /> {/* hair crown */}
          <rect x="38" y="36" width="4" height="18" /> {/* left strand */}
          <rect x="58" y="36" width="4" height="18" /> {/* right strand */}
          {/* Eyes brown */}
          <rect x="45" y="42" width="2" height="2" fill="#2b1a0e" />
          <rect x="53" y="42" width="2" height="2" fill="#2b1a0e" />
        </g>

        {/* Level clothing */}
        {charLevel === 1 ? (
          /* Plain plain white t-shirt & dark pants */
          <g>
            <rect x="38" y="56" width="24" height="18" fill="#ffdad7" />
            <rect x="34" y="56" width="4" height="8" fill="#ffdad7" />
            <rect x="62" y="56" width="4" height="8" fill="#ffdad7" />
            <rect x="38" y="74" width="24" height="16" fill="#1d2e47" /> {/* Blue jeans */}
          </g>
        ) : charLevel === 2 ? (
          /* Collared shirt and neat details */
          <g>
            <rect x="38" y="56" width="24" height="18" fill="#d0dfeb" />
            <rect x="34" y="56" width="4" height="8" fill="#d0dfeb" />
            <rect x="62" y="56" width="4" height="8" fill="#d0dfeb" />
            <rect x="46" y="56" width="8" height="4" fill="#1b3d5c" /> {/* tie design */}
            <rect x="38" y="74" width="24" height="16" fill="#2a2e33" />
          </g>
        ) : charLevel === 3 ? (
          /* Royal suits armor */
          <g>
            <rect x="38" y="56" width="24" height="22" fill="#181a1c" />
            <rect x="34" y="56" width="4" height="10" fill="#181a1c" />
            <rect x="62" y="56" width="4" height="10" fill="#181a1c" />
            <rect x="46" y="58" width="8" height="14" fill="#9c3d54" /> {/* Red shirt vest */}
            <rect x="38" y="78" width="24" height="12" fill="#181a1c" />
          </g>
        ) : (
          /* Mythical metal gold plate armor (Levels 4 & 5) */
          <g>
            <rect x="36" y="54" width="28" height="24" fill="#EEB76B" /> {/* Gold plate body */}
            <rect x="32" y="54" width="4" height="12" fill="#E2703A" /> {/* Shoulders */}
            <rect x="64" y="54" width="4" height="12" fill="#E2703A" />
            <rect x="44" y="60" width="12" height="12" fill="#9c3d54" /> {/* Crest */}
            <rect x="38" y="78" width="24" height="12" fill="#310B0B" /> {/* leg gears */}
          </g>
        )}

        {/* Floating Crown of level 5 */}
        {charLevel === 5 && (
          <g fill="#EEB76B" className="animate-bounce">
            <rect x="44" y="22" width="12" height="4" />
            <rect x="42" y="24" width="16" height="4" />
            <rect x="44" y="20" width="2" height="2" fill="#E2703A" />
            <rect x="54" y="20" width="2" height="2" fill="#E2703A" />
            <rect x="49" y="18" width="2" height="2" fill="#E11D48" />
          </g>
        )}

        {/* Weapons items based on progress */}
        {charLevel === 2 && (
          /* Small book in hand */
          <g fill="#9c3d54">
            <rect x="24" y="64" width="8" height="10" />
            <rect x="26" y="66" width="4" height="6" fill="#fdf6e2" />
          </g>
        )}
        {charLevel === 3 && (
          /* Scribe Quest Book + Tennis Racket */
          <g>
            {/* Book left hand */}
            <rect x="24" y="64" width="8" height="10" fill="#9c3d54" />
            <rect x="26" y="66" width="4" height="6" fill="#fdf6e2" />
            {/* Tennis Racket right hand */}
            <rect x="68" y="44" width="10" height="14" fill="#EEB76B" />
            <rect x="72" y="58" width="2" height="16" fill="#E2703A" />
          </g>
        )}
        {charLevel >= 4 && (
          /* Epic Floating swords */
          <g className="animate-pulse">
            {/* Golden blade left */}
            <rect x="18" y="40" width="2" height="20" fill="#EEB76B" />
            <rect x="16" y="56" width="6" height="2" fill="#d4c297" />
            <rect x="18" y="58" width="2" height="4" fill="#4a311a" />

            {/* Glowing blade right */}
            <rect x="80" y="40" width="2" height="20" fill="#7DD3FC" />
            <rect x="78" y="56" width="6" height="2" fill="#0284C7" />
            <rect x="80" y="58" width="2" height="4" fill="#4a311a" />
          </g>
        )}

        {/* Equipped Accessories */}
        {hasParrot && (
          <g fill="#e11d48">
            {/* Red parrot on shoulder */}
            <rect x="64" y="44" width="6" height="10" />
            <rect x="68" y="46" width="4" height="4" fill="#FBBF24" /> {/* parrot face */}
            <rect x="62" y="48" width="2" height="8" fill="#2563EB" /> {/* wing tail */}
          </g>
        )}

        {/* Red Shield-Heart indicator bar under character */}
        <g fill="#9c3d54">
          <rect x="35" y="96" width="30" height="4" />
          <rect x="40" y="100" width="20" height="4" />
        </g>
      </svg>
    );
  };

  // Draw Antagonist Retro Pixel SVGs dynamically
  const renderAntagonistSVG = () => {
    return (
      <svg 
        viewBox="0 0 100 100" 
        className="w-36 h-36 mx-auto filter drop-shadow-[0_4px_0_rgba(0,0,0,0.6)] animate-pulse"
        id="antagonist-pixel-sprite"
      >
        {enemyVisualId === 1 ? (
          /* Lazy Sloth SVG */
          <g fill="#a1805b">
            {/* Claws & hanging log */}
            <rect x="15" y="25" width="70" height="12" fill="#4f3824" /> {/* Log branch */}
            {/* Sloth face & fur */}
            <rect x="35" y="32" width="30" height="25" />
            <rect x="38" y="38" width="24" height="12" fill="#d6bca2" /> {/* face details */}
            <rect x="42" y="42" width="4" height="4" fill="#310B0B" /> {/* left eye */}
            <rect x="54" y="42" width="4" height="4" fill="#310B0B" /> {/* right eye */}
            <rect x="48" y="48" width="4" height="2" fill="#000" /> {/* nose */}
            {/* Hanging arms */}
            <rect x="25" y="32" width="10" height="18" />
            <rect x="65" y="32" width="10" height="18" />
          </g>
        ) : enemyVisualId === 2 ? (
          /* Hooded Energy Thief SVG */
          <g>
            {/* Shadow robe */}
            <rect x="32" y="25" width="36" height="45" fill="#271c3b" /> {/* Robe body */}
            <rect x="30" y="28" width="40" height="20" fill="#392b54" /> {/* Hood structure */}
            {/* Glowing thief eyes */}
            <rect x="40" y="36" width="6" height="3" fill="#EEB76B" /> {/* Left glow */}
            <rect x="52" y="36" width="6" height="3" fill="#EEB76B" /> {/* Right glow */}
            {/* Stealing Sack */}
            <rect x="20" y="50" width="16" height="20" fill="#bfa15c" />
            <rect x="24" y="44" width="8" height="6" fill="#8c733a" />
          </g>
        ) : (
          /* Grim Reaper Impending Doom SVG */
          <g>
            {/* Midnight skeleton robes */}
            <rect x="30" y="20" width="40" height="55" fill="#121212" />
            <rect x="28" y="25" width="44" height="22" fill="#1f1f1f" /> {/* ragged hood */}
            {/* Pale boney skull */}
            <rect x="40" y="32" width="20" height="20" fill="#fffef2" />
            <rect x="43" y="38" width="4" height="4" fill="#000" /> {/* Hollow eyes */}
            <rect x="53" y="38" width="4" height="4" fill="#000" />
            <rect x="48" y="46" width="4" height="4" fill="#000" /> {/* nasal gap */}
            {/* Deadly harvesting scythe weapon */}
            <rect x="18" y="15" width="4" height="65" fill="#5c4424" /> {/* pole */}
            <rect x="10" y="12" width="40" height="6" fill="#b0b5b8" /> {/* sharp blade */}
            <rect x="14" y="18" width="4" height="4" fill="#b0b5b8" />
          </g>
        )}
      </svg>
    );
  };

  return (
    <div className="space-y-6">
      {/* Dynamic Toast Alerts */}
      <AnimatePresence>
        {toastText && (
          <motion.div
            initial={{ opacity: 0, y: -25 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -25 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 bg-[#EEB76B] border-2 border-[#E2703A] text-[#310B0B] px-5 py-3 rounded-full font-mono text-xs uppercase tracking-wide z-50 text-center shadow-lg"
          >
            <span>{toastText}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Medieval Attack Penalty Banner */}
      {missedYesterday && statusPenaltyText && (
        <div 
          className="bg-[#9c3d54] border-2 border-[#ffdad7] text-white p-4 rounded-[22px] flex items-center gap-3 relative overflow-hidden"
          id="arena-attack-alarm"
        >
          <ShieldAlert className="w-6 h-6 text-[#ffdad7] shrink-0 animate-bounce" />
          <div>
            <span className="font-headline font-bold text-xs uppercase block tracking-wider text-[#ffdad7]">
              Warning: Shadow Ambush Event!
            </span>
            <p className="font-mono text-xs text-white mt-0.5 leading-relaxed">
              {statusPenaltyText}
            </p>
          </div>
        </div>
      )}

      {/* Main Eevolving Protagonist vs Antagonist Battle Arena */}
      <section 
        className={`border-2 rounded-[22px] p-6 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 transition-all duration-300 ${arTheme.arenaBg} ${arTheme.arenaBorder} ${arTheme.arenaShadow}`}
        id="battle-arena-section"
      >
        {/* Arena background decoration */}
        <div className="absolute inset-x-0 bottom-0 h-10 bg-[#310B0B]/40 blur-sm pointer-events-none" />

        {/* Left Side: Evolving Protagonist */}
        <div className="flex-1 text-center flex flex-col items-center">
          <span className="bg-[#EEB76B]/20 text-[#EEB76B] border border-[#EEB76B]/30 font-mono text-[10px] font-bold px-3 py-1 rounded-full uppercase mb-2">
            Lv. {profile.level} Warrior
          </span>
          <div className={`w-40 h-48 rounded-xl flex items-center justify-center p-2 transition-all duration-300 ${arTheme.avatarBg}`}>
            {renderProtagonistSVG()}
          </div>
          <h4 className={`font-headline text-lg mt-3 truncate max-w-[150px] transition-all duration-300 ${arTheme.glowText}`}>
            {profile.displayName}
          </h4>
        </div>

        {/* Center Versus Indicator */}
        <div className="flex flex-col items-center justify-center text-center px-4 self-center">
          <div className="w-12 h-12 bg-[#310B0B] border-2 border-[#EEB76B]/40 rounded-full flex items-center justify-center font-headline text-[#E2703A] font-extrabold text-sm relative z-10 scale-90">
            VS
          </div>
          <div className="h-10 w-0.5 bg-gradient-to-b from-[#EEB76B]/30 to-transparent hidden md:block" />
        </div>

        {/* Right Side: Boss Monster */}
        <div className="flex-1 text-center flex flex-col items-center">
          <span className="bg-[#9c3d54]/20 text-[#ff8e8c] border border-[#9c3d54]/30 font-mono text-[10px] font-bold px-3 py-1 rounded-full uppercase mb-2">
            Level {enemyVisualId} Threat
          </span>
          <div className="w-40 h-48 bg-gradient-to-t from-[#310B0B]/90 to-transparent rounded-xl flex items-center justify-center p-2">
            {renderAntagonistSVG()}
          </div>
          <h4 className="font-headline font-bold text-base text-[#ffb4ab] mt-3 uppercase tracking-wide">
            {enemyName}
          </h4>
        </div>
      </section>

      {/* Boss Health Points status indicator bar */}
      <section className={`bg-[#310B0B] border-2 ${arTheme.questCardBorder} rounded-[22px] p-4 transition-all duration-300 ${arTheme.arenaShadow}`} id="boss-hp-section">
        <div className="flex justify-between items-center mb-2">
          <label className="font-headline text-xs font-bold text-[#EEB76B] uppercase tracking-wider">
            Boss Life Force Indicator
          </label>
          <span className="font-mono text-xs text-[#E2703A]">
            HP: {Math.round(currentBossHP)} / {maxHP}
          </span>
        </div>
        <div className="h-4 bg-[#240304] rounded-full overflow-hidden border border-[#504538] p-0.5">
          <div 
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${currentBossHP}%`, background: arTheme.bossHPBg }}
          />
        </div>
        <p className="font-mono text-[10px] text-[#d4c4b3] mt-2 italic text-center">
          HP depletes as you verify quests and complete your routine targets today!
        </p>
      </section>

      {/* Habit Quest Checklist Cards */}
      <section className="space-y-4" id="habit-checklist-section">
        <div className="flex justify-between items-center border-b border-[#504538] pb-1.5">
          <h3 className="font-headline text-lg text-[#EEB76B] font-bold uppercase tracking-wider">
            Today's Proclamations
          </h3>
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#ffb596]">
            <Calendar className="w-3.5 h-3.5" />
            <span>Cycle reset: <strong className="text-white">{countdownStr}</strong></span>
          </div>
        </div>

        {/* Quest 1 Card */}
        <div 
          className={`p-5 rounded-[22px] border-2 flex flex-col justify-between transition-all duration-300 ${
            habit1Completed 
              ? "bg-[#253e2a]/50 border-emerald-500 opacity-90 shadow-inner" 
              : `bg-[#3b1212]/90 ${arTheme.questCardBorder} ${arTheme.arenaShadow}`
          }`}
          id="quest-habit1-div"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="font-mono text-[10px] text-[#EEB76B] uppercase tracking-wider font-semibold block">Quest 1 • Easy [Performance]</span>
              <h4 className="font-headline text-lg font-bold text-[#ffd6a2]">dance for 15 minutes</h4>
              <p className="font-mono text-xs text-[#d4c4b3] mt-1 leading-relaxed">
                Unlock streak bonus points (+3 Stars on a 7-day streak cycle). Live tracker streak: <strong className="text-white">{profile.habit1_streak || 0} days</strong>
              </p>
            </div>
            
            {habit1Completed ? (
              <div className="h-10 w-10 border border-emerald-400 bg-emerald-900 rounded-full flex items-center justify-center text-emerald-400">
                <CheckCircle className="w-6 h-6" />
              </div>
            ) : (
              <button
                onClick={() => setActiveCameraQuest("habit1")}
                className={`h-[44px] min-w-[120px] px-5 font-headline font-bold rounded-xl text-xs uppercase duration-100 cursor-pointer flex items-center justify-center gap-2 active:translate-y-0.5 active:border-b-0 ${arTheme.buttonStyle}`}
              >
                Scan Quest
              </button>
            )}
          </div>
        </div>

        {/* Quest 2 Card */}
        <div 
          className={`p-5 rounded-[22px] border-2 flex flex-col justify-between transition-all duration-300 ${
            habit2Completed 
              ? "bg-[#253e2a]/50 border-emerald-500 opacity-90 shadow-inner" 
              : `bg-[#3b1212]/90 ${arTheme.questCardBorder} ${arTheme.arenaShadow}`
          }`}
          id="quest-habit2-div"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="font-mono text-[10px] text-[#EEB76B] uppercase tracking-wider font-semibold block">Quest 2 • Medium [Academic]</span>
              <h4 className="font-headline text-lg font-bold text-[#ffd6a2]">research or write for 20 minutes</h4>
              <p className="font-mono text-xs text-[#d4c4b3] mt-1 leading-relaxed">
                Gain scribing stars (+6 Stars on a 3-day consecutive cycle). Live tracker streak: <strong className="text-white">{profile.habit2_streak || 0} days</strong>
              </p>
            </div>
            
            {habit2Completed ? (
              <div className="h-10 w-10 border border-emerald-400 bg-emerald-900 rounded-full flex items-center justify-center text-emerald-400">
                <CheckCircle className="w-6 h-6" />
              </div>
            ) : (
              <button
                onClick={() => setActiveCameraQuest("habit2")}
                className={`h-[44px] min-w-[120px] px-5 font-headline font-bold rounded-xl text-xs uppercase duration-100 cursor-pointer flex items-center justify-center gap-2 active:translate-y-0.5 active:border-b-0 ${arTheme.buttonStyle}`}
              >
                Scan Quest
              </button>
            )}
          </div>
        </div>

        {/* Quest 3 Card */}
        <div 
          className={`p-5 rounded-[22px] border-2 flex flex-col justify-between transition-all duration-300 ${
            habit3Completed 
              ? "bg-[#253e2a]/50 border-emerald-500 opacity-90 shadow-inner" 
              : `bg-[#3b1212]/90 ${arTheme.questCardBorder} ${arTheme.arenaShadow}`
          }`}
          id="quest-habit3-div"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="font-mono text-[10px] text-[#EEB76B] uppercase tracking-wider font-semibold block">Quest 3 • Hard [Sports]</span>
              <h4 className="font-headline text-lg font-bold text-[#ffd6a2]">practice tennis drills for 30 minutes</h4>
              <p className="font-mono text-xs text-[#d4c4b3] mt-1 leading-relaxed">
                Awards immediate Armory drops (+9 Spendable heavy Stars on every completion). Live tracker streak: <strong className="text-white">{profile.habit3_streak || 0} days</strong>
              </p>
            </div>
            
            {habit3Completed ? (
              <div className="h-10 w-10 border border-emerald-400 bg-emerald-900 rounded-full flex items-center justify-center text-emerald-400">
                <CheckCircle className="w-6 h-6" />
              </div>
            ) : (
              <button
                onClick={() => setActiveCameraQuest("habit3")}
                className={`h-[44px] min-w-[120px] px-5 font-headline font-bold rounded-xl text-xs uppercase duration-100 cursor-pointer flex items-center justify-center gap-2 active:translate-y-0.5 active:border-b-0 ${arTheme.buttonStyle}`}
              >
                Scan Quest
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Skip Level Bypass Override Button Card (placed cleanly at the bottom of the Home page) */}
      {onSkipLevel && (
        <section className={`bg-[#240304]/40 border ${arTheme.questCardBorder} p-4 rounded-[22px] flex flex-col items-center justify-center text-center gap-2 transition-all duration-300 ${arTheme.arenaShadow}`}>
          <div className="flex items-center gap-1.5 text-[10px] text-[#d4c4b3]/70 font-mono uppercase tracking-widest">
            <Zap className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
            <span>Grand Master Ascendancy Trigger</span>
          </div>
          <p className="font-mono text-[9px] text-[#ffdad7]/60 max-w-xs leading-relaxed uppercase">
            Instantly advance to the next level, bypassing quest requirements to unlock epic weapons!
          </p>
          <button
            onClick={onSkipLevel}
            className="mt-1.5 flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-headline font-extrabold text-xs uppercase tracking-wider rounded-xl border-b-4 border-orange-850 transition-all duration-75 active:translate-y-0.5 active:border-b-0 cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.4)]"
            id="skip-level-btn"
          >
            <Sparkles className="w-4 h-4 animate-spin" />
            Bypass & Elevate Warrior
            <Sparkles className="w-4 h-4 animate-spin" />
          </button>
        </section>
      )}

      {/* Medieval scroll daily quotes with dither details */}
      <footer className="p-5 bg-[#310B0B] border-4 border-[#EEB76B] border-double rounded-[22px] relative mt-8" id="arena-lore-footer">
        <h4 className="font-headline text-[#EEB76B] text-xs uppercase tracking-widest text-center font-bold mb-1 flex items-center justify-center gap-1">
          <Award className="w-3.5 h-3.5" /> Note From The Keep
        </h4>
        <p className="font-mono text-center text-xs text-[#ffdad7] italic leading-relaxed">
          {quote}
        </p>
      </footer>

      {/* Dynamic Camera Modal wrapper hook */}
      {activeCameraQuest && (
        <CameraModal
          isOpen={true}
          onClose={() => setActiveCameraQuest(null)}
          habitId={activeCameraQuest}
          habitName={
            activeCameraQuest === "habit1" 
              ? "dance for 15 minutes" 
              : activeCameraQuest === "habit2" 
              ? "research or write for 20 minutes" 
              : "practice tennis drills for 30 minutes"
          }
          onSuccess={handleCameraVerifySuccess}
        />
      )}
    </div>
  );
}
