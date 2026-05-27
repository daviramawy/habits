import { useState } from "react";
import { UserProfile, SHOP_ITEMS, ShopItem } from "../types";
import { Coins, CheckCircle, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ShopProps {
  profile: UserProfile;
  onPurchase: (item: ShopItem) => void;
  onEquip: (itemId: string, equip: boolean) => void;
}

export default function Shop({ profile, onPurchase, onEquip }: ShopProps) {
  const [rainingStars, setRainingStars] = useState<{ id: number; left: number; delay: number }[]>([]);

  // Trigger golden star coin rain
  function triggerCoinRain() {
    const starsArray = Array.from({ length: 40 }).map((_, i) => ({
      id: Math.random(),
      left: Math.random() * 100, // percentage
      delay: Math.random() * 2 // seconds
    }));
    setRainingStars(starsArray);
    setTimeout(() => {
      setRainingStars([]);
    }, 4000);
  }

  function handleBuy(item: ShopItem) {
    if (profile.stars >= item.cost && !profile.accessories.includes(item.id)) {
      triggerCoinRain();
      onPurchase(item);
    }
  }

  return (
    <div className="space-y-6 relative overflow-hidden" id="shop-container">
      {/* Golden Coin Rain Overlay */}
      <AnimatePresence>
        {rainingStars.length > 0 && (
          <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {rainingStars.map((star) => (
              <motion.div
                key={star.id}
                initial={{ y: -50, opacity: 1, rotate: 0 }}
                animate={{ 
                  y: window.innerHeight + 50, 
                  opacity: 0,
                  rotate: 360
                }}
                transition={{ 
                  duration: 2.2, 
                  delay: star.delay,
                  ease: "linear" 
                }}
                className="absolute text-2xl font-mono"
                style={{ left: `${star.left}%` }}
              >
                ⭐
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Header Panel */}
      <section className="text-center py-2" id="shop-header">
        <h2 className="font-headline font-bold text-3xl text-[#EEB76B] tracking-wider uppercase">
          Royal Armory Shop
        </h2>
        <p className="font-mono text-[#d4c4b3] text-xs uppercase tracking-widest mt-1">
          Barter your hard-earned stars for mythical loot & gear
        </p>
      </section>

      {/* Balance Indicator Card */}
      <div 
        className="bg-[#EEB76B] border-b-4 border-[#E2703A] text-[#310B0B] rounded-[22px] p-5 flex justify-between items-center max-w-sm mx-auto"
        id="shop-balance-card"
      >
        <span className="font-headline font-bold uppercase tracking-wider text-sm flex items-center gap-2">
          <Coins className="w-5 h-5" />
          Treasury Balance:
        </span>
        <div className="flex items-center gap-1.5 font-headline font-bold text-2xl">
          <span>⭐</span>
          <span>{profile.stars}</span>
        </div>
      </div>

      {/* Goods Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4" id="shop-items-grid">
        {SHOP_ITEMS.map((item) => {
          const isOwned = profile.accessories.includes(item.id);
          const isEquipped = profile.equipped?.includes(item.id);
          const canAfford = profile.stars >= item.cost;

          return (
            <div 
              key={item.id}
              className={`bg-[#3b1212]/90 rounded-[22px] border-2 flex flex-col justify-between overflow-hidden relative group transition-all duration-300 ${
                isOwned 
                  ? "border-[#EEB76B] shadow-[0_4px_22px_rgba(238,183,107,0.15)]" 
                  : canAfford 
                  ? "border-[#EEB76B]/60 hover:border-[#EEB76B]" 
                  : "border-[#504538] opacity-70"
              }`}
              id={`shop-item-card-${item.id}`}
            >
              {/* Card visual banner */}
              <div className="relative aspect-video bg-[#240304]/60 flex items-center justify-center p-4">
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className={`w-20 h-20 object-cover rounded-md pixelated group-hover:scale-110 transition-transform ${!isOwned && !canAfford ? "grayscale" : ""}`}
                />
                
                {/* Visual badges */}
                <div className="absolute top-3 left-3 bg-[#EEB76B]/90 text-[#310B0B] font-mono text-[10px] font-bold px-2 py-1 rounded-md uppercase">
                  {item.type}
                </div>

                <div className="absolute top-3 right-3 flex items-center gap-1 bg-[#310B0B] border border-[#EEB76B]/30 font-mono text-xs font-bold text-[#EEB76B] px-2.5 py-1 rounded-md">
                  <span>⭐</span>
                  <span>{item.cost}</span>
                </div>
              </div>

              {/* Specifications Description Section */}
              <div className="p-5 flex-grow flex flex-col justify-between">
                <div>
                  <h4 className="font-headline font-bold text-lg text-[#EEB76B] flex items-center gap-1">
                    {item.name}
                    {isOwned && <CheckCircle className="w-4 h-4 text-[#EEB76B] fill-[#310B0B]" />}
                  </h4>
                  <p className="font-mono text-xs text-[#d4c4b3] mt-1.5 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Performance stats perks */}
                <div className="bg-[#240304]/40 border-l-2 border-[#E2703A] p-2.5 rounded-lg my-4">
                  <span className="font-mono text-[10px] text-[#ffb596] block uppercase tracking-wider">Passive Perk</span>
                  <p className="font-headline font-bold text-xs text-[#ffdad7] mt-0.5">{item.perk}</p>
                </div>

                {/* Bartering actions */}
                {isOwned ? (
                  <div className="flex gap-2">
                    {item.type === "cosmetic" ? (
                      <button
                        onClick={() => onEquip(item.id, !isEquipped)}
                        className={`w-full py-2.5 font-headline font-bold rounded-xl text-xs uppercase cursor-pointer text-center duration-100 ${
                          isEquipped 
                            ? "bg-[#9c3d54] text-white border-b-4 border-[#61192b] active:translate-y-0.5 active:border-b-0" 
                            : "bg-[#EEB76B] text-[#310B0B] border-b-4 border-[#E2703A] active:translate-y-0.5 active:border-b-0"
                        }`}
                        id={`shop-item-equip-${item.id}`}
                      >
                        {isEquipped ? "Unequip" : "Equip Weapon"}
                      </button>
                    ) : (
                      <div className="w-full text-center py-2 bg-[#2d1212] rounded-xl border border-[#EEB76B]/20">
                        <span className="font-mono text-xs text-[#EEB76B]">Artifact Active</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    disabled={!canAfford}
                    onClick={() => handleBuy(item)}
                    className={`w-full py-3 font-headline font-bold rounded-xl text-xs uppercase duration-100 cursor-pointer ${
                      canAfford 
                        ? "bg-[#E2703A] hover:bg-[#EEB76B] text-[#ffd6a2] border-b-4 border-[#943700] active:translate-y-0.5 active:border-b-0" 
                        : "bg-[#45362f] text-[#9c8e7f] cursor-not-allowed border-b-4 border-[#2b221e]"
                    }`}
                    id={`shop-item-buy-${item.id}`}
                  >
                    Barter Stars
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
