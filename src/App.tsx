import { useState, useEffect } from "react";
import { UserProfile, HabitLog, INITIAL_PROFILE, ShopItem } from "./types";
import { auth, db, isMockFirebase, signInWithGoogle, handleFirestoreError, OperationType } from "./firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, collection, addDoc, getDocs, deleteDoc, writeBatch } from "firebase/firestore";
import { Sword, BarChart3, ShoppingBag, Settings as SettingsIcon, LogOut, Shield, Coins, Sparkles, Trophy, Star } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import Arena from "./components/Arena";
import Stats from "./components/Stats";
import Shop from "./components/Shop";
import Settings from "./components/Settings";

// Dynamic Theme Configuration helper for each level (becoming more glowy/colourful)
function getLevelTheme(level: number) {
  switch (level) {
    case 1:
      return {
        headerBg: "bg-[#240304]",
        headerBorder: "border-[#E2703A]",
        textGlow: "text-[#EEB76B]",
        badgeBorder: "border-[#EEB76B]",
        badgeText: "text-[#EEB76B]",
        badgeBg: "bg-[#310B0B]",
        labelColor: "text-[#ffb4ab]",
        levelTitle: "Apprentice",
        barColor: "repeating-linear-gradient(45deg, #EEB76B, #EEB76B 5px, #E2703A 5px, #E2703A 10px)",
        glowFilter: "",
        outerBorder: "border-[#EEB76B]"
      };
    case 2:
      return {
        headerBg: "bg-[#091a2e]",
        headerBorder: "border-[#2196f3]",
        textGlow: "text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]",
        badgeBorder: "border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.6)]",
        badgeText: "text-cyan-300",
        badgeBg: "bg-[#041121]",
        labelColor: "text-sky-300",
        levelTitle: "Scribe Scholar",
        barColor: "repeating-linear-gradient(45deg, #22d3ee, #22d3ee 5px, #0284c7 5px, #0284c7 10px)",
        glowFilter: "shadow-[inset_0_0_15px_rgba(14,165,233,0.3)]",
        outerBorder: "border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.4)]"
      };
    case 3:
      return {
        headerBg: "bg-[#21092e]",
        headerBorder: "border-purple-500",
        textGlow: "text-fuchsia-400 drop-shadow-[0_0_10px_rgba(232,121,249,0.6)] animate-pulse",
        badgeBorder: "border-fuchsia-400 shadow-[0_0_15px_rgba(232,121,249,0.8)]",
        badgeText: "text-fuchsia-300",
        badgeBg: "bg-[#160421]",
        labelColor: "text-purple-300",
        levelTitle: "Grand Templar",
        barColor: "repeating-linear-gradient(45deg, #e879f9, #e879f9 5px, #a855f7 5px, #a855f7 10px)",
        glowFilter: "shadow-[inset_0_0_20px_rgba(168,85,247,0.4)]",
        outerBorder: "border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.5)]"
      };
    case 4:
      return {
        headerBg: "bg-[#2d1b06]",
        headerBorder: "border-amber-500",
        textGlow: "text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.7)] font-extrabold",
        badgeBorder: "border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.9)]",
        badgeText: "text-amber-300 animate-pulse",
        badgeBg: "bg-[#1c0e01]",
        labelColor: "text-amber-200",
        levelTitle: "Paladin of Sol",
        barColor: "repeating-linear-gradient(45deg, #fbbf24, #fbbf24 5px, #f59e0b 5px, #f59e0b 10px)",
        glowFilter: "shadow-[inset_0_0_25px_rgba(245,158,11,0.5)]",
        outerBorder: "border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.7)]"
      };
    default: // Level 5+
      return {
        headerBg: "bg-[#1f0219]",
        headerBorder: "border-rose-500",
        textGlow: "text-rose-400 drop-shadow-[0_0_15px_rgba(244,63,94,0.9)] font-black tracking-widest animate-pulse",
        badgeBorder: "border-rose-400 shadow-[0_0_30px_rgba(244,63,94,1),_0_0_10px_rgba(6,182,212,0.8)]",
        badgeText: "text-rose-300 font-extrabold",
        badgeBg: "bg-[#3b022b]",
        labelColor: "text-rose-200 uppercase font-extrabold tracking-wide",
        levelTitle: `Celestial Lord (Lvl ${level})`,
        barColor: "repeating-linear-gradient(45deg, #f43f5e, #f43f5e 5px, #ec4899 5px, #ec4899 10px, #06b6d4 10px, #06b6d4 15px)",
        glowFilter: "shadow-[inset_0_0_30px_rgba(244,63,94,0.6)] animate-pulse",
        outerBorder: "border-rose-500 shadow-[0_0_40px_rgba(244,63,94,0.9),_inset_0_0_20px_rgba(6,182,212,0.4)]"
      };
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("home");
  const [loading, setLoading] = useState<boolean>(true);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  
  // Real or Localized Guest user state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [logs, setLogs] = useState<HabitLog[]>([]);

  // Cinematic alert triggers
  const [activeLevelUp, setActiveLevelUp] = useState<number | null>(null);
  const [showPerfectDayOverlay, setShowPerfectDayOverlay] = useState<boolean>(false);

  // General App Loading and Persistence Syncer
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      if (user) {
        setCurrentUser(user);
        await syncUserProfile(user.uid, user.email || "", user.displayName || "Hero");
      } else {
        setCurrentUser(null);
        if (isMockFirebase) {
          // Automatic login to Local Guest context if running in offline sandbox Mode
          await syncUserProfile("guest-uid", "guest@overstressed.domain", "Galahad the Brave");
        } else {
          setProfile(null);
          setLogs([]);
          setLoading(false);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  async function syncUserProfile(uid: string, email: string, displayName: string) {
    try {
      if (isMockFirebase) {
        // Mock mode pulls and updates local storage
        const localProf = localStorage.getItem("overstressed_profile");
        const localLogs = localStorage.getItem("overstressed_logs");

        if (localProf) {
          setProfile(JSON.parse(localProf));
        } else {
          const initP = INITIAL_PROFILE(uid, email, displayName);
          setProfile(initP);
          localStorage.setItem("overstressed_profile", JSON.stringify(initP));
        }

        if (localLogs) {
          setLogs(JSON.parse(localLogs));
        } else {
          setLogs([]);
          localStorage.setItem("overstressed_logs", JSON.stringify([]));
        }
      } else {
        // Query Firestore profile
        const uDocRef = doc(db, "users", uid);
        const uDocSnap = await getDoc(uDocRef);

        let activeProfile: UserProfile;

        if (uDocSnap.exists()) {
          activeProfile = uDocSnap.data() as UserProfile;
        } else {
          // Initialize a brand new profile on Firestore immediately
          activeProfile = INITIAL_PROFILE(uid, email, displayName);
          await setDoc(uDocRef, activeProfile);
        }

        // Query Logs subcol
        const logsColRef = collection(db, "users", uid, "logs");
        const logsSnap = await getDocs(logsColRef);
        const loadedLogs: HabitLog[] = [];
        logsSnap.forEach((docSnap) => {
          loadedLogs.push(docSnap.data() as HabitLog);
        });

        // Resolve outstanding yesterday misses on load
        const reconciledProfile = resolveDailyAmbushCheck(activeProfile);
        if (reconciledProfile.lastCheckedDate !== activeProfile.lastCheckedDate || reconciledProfile.xp !== activeProfile.xp) {
          await updateDoc(uDocRef, { ...reconciledProfile });
        }

        setProfile(reconciledProfile);
        setLogs(loadedLogs);
      }
    } catch (err) {
      console.error("Critical Profile Fetch Failure:", err);
      // Failover safely to LocalStorage to protect the user's efforts
      const fallbackProf = INITIAL_PROFILE(uid, email, displayName);
      setProfile(fallbackProf);
    } finally {
      setLoading(false);
    }
  }

  // Calculate Boss attacks if any habits missed yesterday
  function resolveDailyAmbushCheck(prof: UserProfile): UserProfile {
    const todayStr = new Date().toISOString().split("T")[0];
    if (prof.lastCheckedDate === todayStr) {
      return prof; // Checked today already
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    // Check if missed yesterday
    const missed1 = prof.habit1_lastCompleted !== yesterdayStr && prof.habit1_lastCompleted !== todayStr;
    const missed2 = prof.habit2_lastCompleted !== yesterdayStr && prof.habit2_lastCompleted !== todayStr;
    const missed3 = prof.habit3_lastCompleted !== yesterdayStr && prof.habit3_lastCompleted !== todayStr;

    const missedCount = [missed1, missed2, missed3].filter(Boolean).length;
    let xpPenalty = 0;
    let starPenalty = 0;

    if (missedCount > 0) {
      // Sloth level 1: XP freeze. Energy Thief level 2: minus 5 XP. Reaper level 3: minus stars.
      if (prof.xp <= 500) {
        // Frozen - no numerical drops
      } else if (prof.xp > 500 && prof.xp <= 1500) {
        xpPenalty = 5;
      } else {
        starPenalty = 1;
      }
    }

    return {
      ...prof,
      xp: Math.max(0, prof.xp - xpPenalty),
      stars: Math.max(0, prof.stars - starPenalty),
      lastCheckedDate: todayStr,
      // Reset streak counters to 0 on misses
      habit1_streak: missed1 ? 0 : prof.habit1_streak,
      habit2_streak: missed2 ? 0 : prof.habit2_streak,
      habit3_streak: missed3 ? 0 : prof.habit3_streak
    };
  }

  function handleLogin() {
    signInWithGoogle().catch(err => {
      console.error("Login popup cancelled or blocked:", err);
    });
  }

  function handleLogout() {
    signOut(auth).then(() => {
      setCurrentUser(null);
      setProfile(null);
      setLogs([]);
    });
  }

  // Calculate Level dynamically from cumulative XP milestones
  function calcEvolvedLevel(xpVal: number): number {
    if (xpVal >= 3501) return 5;
    if (xpVal >= 2001) return 4;
    if (xpVal >= 1001) return 3;
    if (xpVal >= 501) return 2;
    return 1;
  }

  // Instantly skip level, automatically advance user to the next level
  async function handleSkipLevel() {
    if (!profile) return;

    const currentLvl = profile.level;
    const nextLvl = currentLvl + 1;

    // Determine minimal XP requirement for the next level
    let targetXP = profile.xp;
    if (nextLvl === 2) targetXP = 501;
    else if (nextLvl === 3) targetXP = 1001;
    else if (nextLvl === 4) targetXP = 2001;
    else if (nextLvl === 5) targetXP = 3501;
    else {
      // Level 5 and beyond, add +1500 XP to keep advancing nicely
      targetXP = Math.max(3501, profile.xp) + 1500;
    }

    const updated = {
      ...profile,
      level: nextLvl,
      xp: targetXP
    };

    setProfile(updated);
    setActiveLevelUp(nextLvl);

    if (isMockFirebase) {
      localStorage.setItem("overstressed_profile", JSON.stringify(updated));
    } else {
      try {
        await updateDoc(doc(db, "users", profile.userId), { ...updated });
      } catch (e) {
        handleFirestoreError(e, OperationType.UPDATE, `/users/${profile.userId}`);
      }
    }
  }

  // Handles daily routine validation completions
  async function handleQuestVerified(habitId: "habit1" | "habit2" | "habit3", xpGained: number, starsGained: number, analysis: string) {
    if (!profile) return;

    const todayStr = new Date().toISOString().split("T")[0];

    // Compile update fields
    const updated = { ...profile };
    let streakValue = 0;

    if (habitId === "habit1") {
      updated.habit1_lastCompleted = todayStr;
      updated.habit1_streak = (updated.habit1_streak || 0) + 1;
      streakValue = updated.habit1_streak;
    } else if (habitId === "habit2") {
      updated.habit2_lastCompleted = todayStr;
      updated.habit2_streak = (updated.habit2_streak || 0) + 1;
      streakValue = updated.habit2_streak;
    } else {
      updated.habit3_lastCompleted = todayStr;
      updated.habit3_streak = (updated.habit3_streak || 0) + 1;
      streakValue = updated.habit3_streak;
    }

    // Accumulate metrics
    updated.xp = updated.xp + xpGained;
    updated.stars = updated.stars + starsGained;

    // Track highest streak overall
    if (streakValue > updated.bestStreak) {
      updated.bestStreak = streakValue;
    }

    // Determine Level threshold changes
    const newLvl = calcEvolvedLevel(updated.xp);
    if (newLvl > updated.level) {
      updated.level = newLvl;
      setActiveLevelUp(newLvl);
    }

    // Create completion log
    const logId = `log-${Date.now()}`;
    const newLog: HabitLog = {
      logId,
      userId: profile.userId,
      habitId,
      completedDate: todayStr,
      timestamp: new Date().toISOString(),
      xpGained,
      starsGained
    };

    // Check newly achieved perfect day
    const isHabit1Done = updated.habit1_lastCompleted === todayStr;
    const isHabit2Done = updated.habit2_lastCompleted === todayStr;
    const isHabit3Done = updated.habit3_lastCompleted === todayStr;

    if (isHabit1Done && isHabit2Done && isHabit3Done) {
      // Double check they didn't already get the perfect day today!
      const logsToday = logs.filter(l => l.completedDate === todayStr);
      const isFirstPerfectDayToday = logsToday.length === 2; // this is the 3rd completion
      if (isFirstPerfectDayToday) {
        updated.stars += 50;
        updated.perfectDays += 1;
        setShowPerfectDayOverlay(true);
      }
    }

    // Synchronize to memory and databases
    const updatedLogs = [newLog, ...logs];
    setLogs(updatedLogs);
    setProfile(updated);

    if (isMockFirebase) {
      localStorage.setItem("overstressed_profile", JSON.stringify(updated));
      localStorage.setItem("overstressed_logs", JSON.stringify(updatedLogs));
    } else {
      try {
        await updateDoc(doc(db, "users", profile.userId), { ...updated });
        await setDoc(doc(db, "users", profile.userId, "logs", logId), newLog);
      } catch (e) {
        handleFirestoreError(e, OperationType.UPDATE, `/users/${profile.userId}`);
      }
    }
  }

  // Handle Equipment Purchase
  async function handlePurchaseItem(item: ShopItem) {
    if (!profile) return;

    const updated = {
      ...profile,
      stars: profile.stars - item.cost,
      accessories: [...profile.accessories, item.id],
      equipped: [...(profile.equipped || []), item.id] // Auto equip on purchase
    };

    // Apply Tome instant booster:
    if (item.id === "tome") {
      updated.xp += 500;
      const newLvl = calcEvolvedLevel(updated.xp);
      if (newLvl > updated.level) {
        updated.level = newLvl;
        setActiveLevelUp(newLvl);
      }
    }

    setProfile(updated);

    if (isMockFirebase) {
      localStorage.setItem("overstressed_profile", JSON.stringify(updated));
    } else {
      await updateDoc(doc(db, "users", profile.userId), { ...updated });
    }
  }

  // Handle Equipment toggles
  async function handleEquipItem(itemId: string, equip: boolean) {
    if (!profile) return;

    let updatedEquipped = [...(profile.equipped || [])];
    if (equip) {
      if (!updatedEquipped.includes(itemId)) {
        updatedEquipped.push(itemId);
      }
    } else {
      updatedEquipped = updatedEquipped.filter(id => id !== itemId);
    }

    const updated = {
      ...profile,
      equipped: updatedEquipped
    };

    setProfile(updated);

    if (isMockFirebase) {
      localStorage.setItem("overstressed_profile", JSON.stringify(updated));
    } else {
      await updateDoc(doc(db, "users", profile.userId), { ...updated });
    }
  }

  // Purge Character campaign
  async function handleMasterPurge() {
    if (!profile) return;
    const blank = INITIAL_PROFILE(profile.userId, profile.email, profile.displayName);
    setProfile(blank);
    setLogs([]);

    if (isMockFirebase) {
      localStorage.setItem("overstressed_profile", JSON.stringify(blank));
      localStorage.setItem("overstressed_logs", JSON.stringify([]));
    } else {
      // Safe batch deletion on Firestore logs subcollection
      try {
        await updateDoc(doc(db, "users", profile.userId), { ...blank });
        const logsColRef = collection(db, "users", profile.userId, "logs");
        const snap = await getDocs(logsColRef);
        
        // Write dry-run logs deletion recursively
        for (const logDoc of snap.docs) {
          await deleteDoc(doc(db, "users", profile.userId, "logs", logDoc.id));
        }
      } catch (e) {
        handleFirestoreError(e, OperationType.DELETE, `/users/${profile.userId}/logs`);
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#310B0B] text-[#EEB76B] flex flex-col items-center justify-center p-4">
        <Sparkles className="w-12 h-12 text-[#EEB76B] animate-spin mb-4" />
        <h2 className="font-headline font-bold text-xl uppercase tracking-wider">
          Entering OverStressed...
        </h2>
        <p className="font-mono text-[10px] text-[#ffdad7]/60 mt-1 uppercase">
          Verifying Quest Book and Guild Seals
        </p>
      </div>
    );
  }

  // Authentication Gate Screen for genuine production setup
  if (!profile) {
    return (
      <div className="min-h-screen bg-[#1c0404] text-[#EEB76B] flex flex-col items-center justify-center p-6 relative overflow-hidden" id="auth-gate-screen">
        <div className="absolute inset-x-0 bottom-0 top-1/2 bg-[#310B0B]/40 blur-3xl pointer-events-none" />
        
        <div className="w-full max-w-md bg-[#2b0707] border-4 border-[#EEB76B] rounded-[22px] p-8 text-center relative z-10" style={{ boxShadow: "0 10px 0 0 #3b1212" }}>
          
          {/* Gothic Diamond Accents */}
          <div className="absolute top-0 left-0 w-3 h-3 bg-[#EEB76B] polygon-diamond"></div>
          <div className="absolute top-0 right-0 w-3 h-3 bg-[#EEB76B] polygon-diamond"></div>
          <div className="absolute bottom-0 left-0 w-3 h-3 bg-[#EEB76B] polygon-diamond"></div>
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#EEB76B] polygon-diamond"></div>

          <div className="w-20 h-20 bg-[#310B0B] border-2 border-[#EEB76B] rounded-full flex items-center justify-center mx-auto mb-4 text-[#EEB76B]">
            <Trophy className="w-10 h-10 animate-bounce" />
          </div>

          <h1 className="font-headline font-bold text-4xl text-[#EEB76B] tracking-wider uppercase mb-1">
            OverStressed
          </h1>
          <p className="font-mono text-[#d4c4b3] text-xs uppercase tracking-widest mb-6">
            Gamified Skill Habit Tracker
          </p>

          <p className="font-mono text-xs text-[#ffd6a2] leading-relaxed mb-8">
            An action-RPG campaign where your daily routines power your warrior, slay lazy habits, and barters epic weapons inside the Armory Shop.
          </p>

          <button
            onClick={handleLogin}
            className="w-full bg-[#E2703A] hover:bg-[#EEB76B] text-[#ffd6a2] font-headline font-bold py-4 rounded-xl border-b-4 border-[#943700] text-sm uppercase transition-all duration-100 active:translate-y-1 active:border-b-0 cursor-pointer"
            id="google-signin-btn"
          >
            Step Inside the Guild (Google Sign In)
          </button>

          <div className="text-[10px] font-mono text-[#d4c4b3]/60 mt-4 uppercase">
            Authentication and progress are securely guarded
          </div>
        </div>
      </div>
    );
  }

  // Evolving XP boundaries info
  const calcNextXPBorrow = () => {
    if (profile.xp <= 500) return { min: 0, max: 500 };
    if (profile.xp <= 1000) return { min: 501, max: 1000 };
    if (profile.xp <= 2000) return { min: 1001, max: 2000 };
    if (profile.xp <= 3500) return { min: 2001, max: 3500 };
    return { min: 3501, max: 5000 };
  };

  const xpBounds = calcNextXPBorrow();
  const xpProgressPercent = Math.min(100, ((profile.xp - xpBounds.min) / (xpBounds.max - xpBounds.min)) * 100);
  const lvTheme = getLevelTheme(profile.level);

  return (
    <div className={`min-h-screen ${theme === "light" ? "bg-[#eae2cf] text-[#4f311c]" : "bg-[#1c0404] text-[#ffdad7]"} transition-colors duration-300`}>
      
      {/* Centered Phone Viewport bounds constraint layout */}
      <div className={`max-w-md mx-auto min-h-screen flex flex-col justify-between relative shadow-2xl bg-[#310B0B] border-x-4 ${lvTheme.outerBorder} outline-none transition-all duration-300`}>
        
        {/* Fixed Top Header bar */}
        <header className={`${lvTheme.headerBg} border-b-4 ${lvTheme.headerBorder} p-4 text-[#ffdad7] sticky top-0 z-40 transition-all duration-300`} id="global-nav-header">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-3">
              {/* Shield badge */}
              <div className={`w-10 h-10 ${lvTheme.badgeBg} border-2 ${lvTheme.badgeBorder} rounded-full flex items-center justify-center font-headline text-lg ${lvTheme.badgeText} font-extrabold shadow-inner relative transition-all duration-300`}>
                {profile.level}
                {/* Level indicators glow */}
                {profile.level >= 3 && (
                  <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-sky-400"></span>
                  </span>
                )}
              </div>
              <div>
                <h1 className={`font-headline font-bold text-lg ${lvTheme.textGlow} tracking-wider uppercase leading-none transition-all duration-300`}>
                  OverStressed
                </h1>
                <p className={`font-mono text-[9px] ${lvTheme.labelColor} mt-1.5 leading-none uppercase transition-all duration-300`}>
                  Level {profile.level} {lvTheme.levelTitle}
                </p>
              </div>
            </div>

            {/* Spendable currency block */}
            <div className="flex items-center gap-3">
              <div className="bg-[#310B0B] border border-[#EEB76B]/40 py-1.5 px-3 rounded-full flex items-center gap-1.5 font-headline font-bold text-sm text-[#EEB76B]">
                <span>⭐</span>
                <span>{profile.stars}</span>
              </div>

              {!isMockFirebase && (
                <button 
                  onClick={handleLogout}
                  className="p-2.5 bg-red-950 hover:bg-red-900 border border-red-500 rounded-xl cursor-pointer duration-75 text-red-100 flex items-center justify-center"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Level Progress Slider bar */}
          <div className="space-y-1">
            <div className={`flex justify-between items-center font-mono text-[9px] ${lvTheme.labelColor} uppercase transition-all duration-300`}>
              <span>Experience Pool</span>
              <span>{profile.xp} / {xpBounds.max} XP</span>
            </div>
            <div className="h-3 bg-[#170102] rounded-full overflow-hidden border border-[#504538] p-0.5">
              <div 
                className={`h-full rounded-full transition-all duration-300 ${lvTheme.glowFilter}`}
                style={{ width: `${xpProgressPercent}%`, background: lvTheme.barColor }}
              />
            </div>
          </div>
        </header>

        {/* Scrollable Center gameboard content */}
        <main className="flex-grow p-5 pb-24 overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
          {activeTab === "home" && (
            <Arena 
              profile={profile}
              onQuestVerified={handleQuestVerified}
              onSkipLevel={handleSkipLevel}
            />
          )}

          {activeTab === "stats" && (
            <Stats 
              profile={profile}
              logs={logs}
              onNavigate={(t) => setActiveTab(t)}
            />
          )}

          {activeTab === "shop" && (
            <Shop 
              profile={profile}
              onPurchase={handlePurchaseItem}
              onEquip={handleEquipItem}
            />
          )}

          {activeTab === "settings" && (
            <Settings 
              profile={profile}
              theme={theme}
              onToggleTheme={() => setTheme(theme === "dark" ? "light" : "dark")}
              onClearData={handleMasterPurge}
            />
          )}
        </main>

        {/* Fixed bottom safe-area Navigation Header */}
        <footer className="fixed bottom-0 max-w-md w-full bg-[#240304] border-t-4 border-[#E2703A] grid grid-cols-4 p-2 pb-5 z-40 text-center" id="global-nav-footer">
          <button 
            onClick={() => setActiveTab("home")}
            className={`flex flex-col items-center justify-center p-2.5 h-[50px] cursor-pointer rounded-xl transition-all duration-100 ${activeTab === "home" ? "text-[#EEB76B] bg-[#310B0B] border border-[#EEB76B]/40" : "text-[#ffd6a2]/60 hover:text-white"}`}
            id="nav-tab-home"
          >
            <Sword className="w-5 h-5 mb-0.5" />
            <span className="font-headline text-[10px] tracking-wider uppercase font-semibold">Arena</span>
          </button>
          
          <button 
            onClick={() => setActiveTab("stats")}
            className={`flex flex-col items-center justify-center p-2.5 h-[50px] cursor-pointer rounded-xl transition-all duration-100 ${activeTab === "stats" ? "text-[#EEB76B] bg-[#310B0B] border border-[#EEB76B]/40" : "text-[#ffd6a2]/60 hover:text-white"}`}
            id="nav-tab-stats"
          >
            <BarChart3 className="w-5 h-5 mb-0.5" />
            <span className="font-headline text-[10px] tracking-wider uppercase font-semibold">Record</span>
          </button>

          <button 
            onClick={() => setActiveTab("shop")}
            className={`flex flex-col items-center justify-center p-2.5 h-[50px] cursor-pointer rounded-xl transition-all duration-100 ${activeTab === "shop" ? "text-[#EEB76B] bg-[#310B0B] border border-[#EEB76B]/40" : "text-[#ffd6a2]/60 hover:text-white"}`}
            id="nav-tab-shop"
          >
            <ShoppingBag className="w-5 h-5 mb-0.5" />
            <span className="font-headline text-[10px] tracking-wider uppercase font-semibold">Armory</span>
          </button>

          <button 
            onClick={() => setActiveTab("settings")}
            className={`flex flex-col items-center justify-center p-2.5 h-[50px] cursor-pointer rounded-xl transition-all duration-100 ${activeTab === "settings" ? "text-[#EEB76B] bg-[#310B0B] border border-[#EEB76B]/40" : "text-[#ffd6a2]/60 hover:text-white"}`}
            id="nav-tab-settings"
          >
            <SettingsIcon className="w-5 h-5 mb-0.5" />
            <span className="font-headline text-[10px] tracking-wider uppercase font-semibold">Options</span>
          </button>
        </footer>

        {/* Level-Up Majestic Cinematic Overlay Popups */}
        <AnimatePresence>
          {activeLevelUp && (
            <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50">
              <motion.div 
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.85, opacity: 0 }}
                className="w-full max-w-sm bg-[#3b1212] border-4 border-[#ffb596] rounded-[22px] p-6 text-center text-[#ffdad7] relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-[#2b0707] to-transparent pointer-events-none" />
                <Sparkles className="w-16 h-16 text-[#ffd6a2] animate-spin mx-auto mb-4" />
                <h3 className="font-headline font-extrabold text-[#ffd6a2] text-2xl uppercase tracking-wider mb-2">
                  WARRIOR EVOLVED!
                </h3>
                <p className="font-mono text-[#EEB76B] text-sm uppercase font-bold mb-4">
                  REACHED LEVEL {activeLevelUp}!
                </p>

                <p className="font-mono text-xs text-[#d4c4b3] leading-relaxed mb-6">
                  {activeLevelUp === 2 && "Unlocks Scribe Skills! A leather-bound research book now floats in your left hand, boosting cognitive stance stats!"}
                  {activeLevelUp === 3 && "Unlocks Athletic Weaponry! You wield a mystical martial tennis racket, granting you continuous spendable Armory coins."}
                  {activeLevelUp === 4 && "Gold Armored Shell! High-grade plate armor covers your body with levitating secondary broadswords!"}
                  {activeLevelUp === 5 && "Angelic Ascendancy! Guardian seraphim wings grow on your back, crowning your name across the kingdom!"}
                </p>

                <button
                  onClick={() => setActiveLevelUp(null)}
                  className="w-full bg-[#E2703A] hover:bg-[#EEB76B] text-[#ffd6a2] font-headline font-bold py-3.5 rounded-xl border-b-4 border-[#943700] text-xs uppercase cursor-pointer"
                >
                  Continue Journey
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Triple Completion PERFECT DAY Epic Cinematic Alert */}
        <AnimatePresence>
          {showPerfectDayOverlay && (
            <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50">
              <motion.div 
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.85, opacity: 0 }}
                className="w-full max-w-sm bg-[#1c0f20] border-4 border-[#f2a8ff] rounded-[22px] p-6 text-center text-[#fbd5ff] relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-[#1b0021] to-transparent pointer-events-none" />
                <Star className="w-16 h-16 text-[#fbd5ff] animate-pulse mx-auto mb-4" />
                <h3 className="font-headline font-extrabold text-[#EEB76B] text-2xl uppercase tracking-wider mb-2">
                  QUEST PERFECTED!
                </h3>
                <p className="font-mono text-[#fbd5ff] text-sm uppercase font-bold mb-4">
                  All 3 Proclamations Sealed!
                </p>

                <p className="font-mono text-xs text-[#ebd8ff] leading-relaxed mb-6">
                  The gods of the OverStressed Keep rejoice! Complete focus on easy, medium and hard tasks awards you an incremental bonus of:
                </p>

                <div className="p-3 bg-[#44234f] border border-[#f5b8ff]/20 rounded-xl mb-6 flex justify-center items-center gap-2">
                  <span className="text-xl">⭐</span>
                  <span className="font-headline font-extrabold text-[#EEB76B] text-lg">+50 Spendable Stars</span>
                </div>

                <button
                  onClick={() => setShowPerfectDayOverlay(false)}
                  className="w-full bg-[#E2703A] hover:bg-[#EEB76B] text-[#ffd6a2] font-headline font-bold py-3.5 rounded-xl border-b-4 border-[#943700] text-xs uppercase cursor-pointer"
                >
                  Proclaim Victory
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
