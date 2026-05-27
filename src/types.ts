export interface UserProfile {
  userId: string;
  email: string;
  displayName: string;
  xp: number;
  stars: number;
  level: number;
  accessories: string[]; // e.g. ["cape", "parrot", "glasses", "tome"]
  equipped: string[]; // items currently worn
  perfectDays: number;
  bestStreak: number;
  lastCheckedDate: string; // YYYY-MM-DD
  
  // Habit Streaks and Daily completions
  habit1_streak: number;
  habit1_lastCompleted: string; // YYYY-MM-DD
  
  habit2_streak: number;
  habit2_lastCompleted: string; // YYYY-MM-DD
  
  habit3_streak: number;
  habit3_lastCompleted: string; // YYYY-MM-DD
}

export interface HabitLog {
  logId: string;
  userId: string;
  habitId: string;
  completedDate: string; // YYYY-MM-DD
  timestamp: string; // ISO
  xpGained: number;
  starsGained: number;
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  type: "cosmetic" | "artifact" | "multiplier";
  perk: string;
  image: string;
  avatarAddon?: string;
}

export const SHOP_ITEMS: ShopItem[] = [
  {
    id: "cape",
    name: "Hero's Cape",
    description: "A gorgeous, flowing red cape to buffer your health.",
    cost: 50,
    type: "cosmetic",
    perk: "+20 Max Health bonus",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAt6Fj1vGt84474omF25D3wqvHUgDsgsDMZO3Xy8e3Uf5EBKJhu1Ktl76PGNIV8_Nd_U-gYcbkuij9rtZQYd-BIU4lQ_IxGn-ZeB87y2Ob9DTK5hMnCeV-YwIeNM4lzlpPZ9ERiZQ5zy-RpWPb4QvYjispBaiKuNUc2DgwmPQ0N2XZ9C0GjKLGoC-kqxCE00kYo-uMBERxDsTLVCrf6p12xBffyWcaztX8ZysRmfxFhoD0h0KEah0ikoiF14PJCr0Is9W8SSzuk2u_A"
  },
  {
    id: "parrot",
    name: "Parrot Pet",
    description: "A tropical parrot companion that alerts you to bonus XP.",
    cost: 50,
    type: "multiplier",
    perk: "Coin Multiplier (2x Star drops)",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBmzcPizkRfR8zSdtqb1F8xSfB27nCzIYYbcMqHII7931AZND5hJjIuf7IOHnZ34yuLu3xe_6v6CSfYNut_dBgPOTc6kfFizq28mnYSDPk5LFbll6Hu_ssIoTjYSqcjL8AWLSgUY5EPPnvHNLvdR4VHzd0PBCOgg75B45w5SA_7I8a0H5IVlD6KMhTgmtUaWxU1r336cxnN9-IYjmtYvjzivGop7k0a8no-CFmqd6BBRMLGLPN0-eQhSS8whB2eho65dZB6WkTsEod4"
  },
  {
    id: "glasses",
    name: "Glowing Glasses",
    description: "A mystical pair of high-vis glasses protecting your daily streaks.",
    cost: 50, // Updated from 75 in image but user specifications said 50 in some descriptions or 75. Let's make it 75. Wait! Section 9 says: "glowing glasses (75 Stars) — streak protector". Section 7 says: "glowing glasses (50 coins)". Let's make it 75 Stars.
    type: "artifact",
    perk: "Prevents immediate streak breakage",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDkyC1v3C9Vu2DqFOZUis4SfWs6bXn3Un4o4Z-anfTDTieh0V4he1nmYok2kbV4vtZpqpgvcolqqZQgyonsyWg9f6Qkr2EIvYbLcaQGVxMriE1yU93Tv6Gx3SZ81tmG_oHALXdy9E7DKDuutZzu9OwrbCkWnygB3pd4rswjrsBkzq-wzTCF32MCK9MAOfx8UFrp0r83o0c2TMErpV42RuNdxQ2OQrdzME9aW_jzDGHrWnrKBn2FEsZcP2KUequakFx-3BiS5YpGDyBp"
  },
  {
    id: "tome",
    name: "XP Tome",
    description: "Ancient leather-bound book containing high-dimensional knowledge.",
    cost: 50,
    type: "multiplier",
    perk: "Instantly awards +500 XP to reader",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDimfKBBr11fVwmFtr3yXwusJtKvDXtB1qSAD7sVBCfqJ_-8szFX4iH8HWcpzeY3x-oWoJgmuz62SUKRHYzsxkIHQe3V6sijdtlvV_A-jVefvDoSpzP9V03NCMkZrnGUH7JtpH75Lnul4QFKv798uMlpRxxGIgPztcb1Bj-6q2KyeQz8tJ29mWNoI7yFLX_nxyk0Dzbcd7QL6l6zPpbZ0X5FYs5xqUQeySjVkzXVx3qzz5CG1W27-Aca-7udDq_Ix9Jq4KjKhczBapY"
  }
];

export const INITIAL_PROFILE = (userId: string, email: string, displayName: string): UserProfile => ({
  userId,
  email,
  displayName: displayName || "Hero",
  xp: 0,
  stars: 12, // Default fallback stars to make it easy to start
  level: 1,
  accessories: [],
  equipped: [],
  perfectDays: 0,
  bestStreak: 0,
  lastCheckedDate: new Date().toISOString().split("T")[0],
  
  habit1_streak: 0,
  habit1_lastCompleted: "",
  
  habit2_streak: 0,
  habit2_lastCompleted: "",
  
  habit3_streak: 0,
  habit3_lastCompleted: ""
});
