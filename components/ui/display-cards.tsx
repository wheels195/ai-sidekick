"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface DisplayCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  date: string;
  badge?: string;
  iconClassName?: string;
  titleClassName?: string;
  className?: string;
}

interface DisplayCardsProps {
  cards: DisplayCardProps[];
}

export default function DisplayCards({ cards }: DisplayCardsProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {cards.map((card, index) => (
        <Card 
          key={index}
          className="group w-full bg-white/5 backdrop-blur-md ring-1 ring-white/10 rounded-xl shadow-2xl hover:scale-[1.03] hover:shadow-2xl hover:shadow-white/20 hover:ring-white/30 hover:bg-white/10 transition-all duration-500 ease-out cursor-pointer relative overflow-hidden"
          onMouseEnter={() => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          {/* Animated glow effect on hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl"></div>
          
          <CardContent className="p-6 relative z-10">
            <div className="flex items-start gap-4">
              {/* Enhanced Icon Container with better gradients */}
              <div className={`
                w-12 h-12 rounded-full bg-gradient-to-br flex items-center justify-center shadow-lg shrink-0 transition-all duration-300 group-hover:shadow-xl
                ${card.iconClassName?.includes('blue') ? 'from-blue-600 to-blue-400 shadow-blue-500/25 group-hover:shadow-blue-500/40' : ''}
                ${card.iconClassName?.includes('purple') ? 'from-purple-600 to-purple-400 shadow-purple-500/25 group-hover:shadow-purple-500/40' : ''}
                ${card.iconClassName?.includes('orange') ? 'from-orange-600 to-orange-400 shadow-orange-500/25 group-hover:shadow-orange-500/40' : ''}
                ${card.iconClassName?.includes('emerald') ? 'from-emerald-600 to-emerald-400 shadow-emerald-500/25 group-hover:shadow-emerald-500/40' : ''}
                ${hoveredIndex === index ? 'scale-110 rotate-6' : ''}
              `}>
                <div className="text-white transition-all duration-300 group-hover:scale-110">
                  {card.icon}
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="text-lg font-semibold text-white mb-2 tracking-tight transition-all duration-300 group-hover:text-white group-hover:scale-105">
                  {card.title}
                </h4>
                <p className="text-sm text-white/80 mb-3 leading-relaxed tracking-wide transition-colors duration-300 group-hover:text-white/90">
                  {card.description}
                </p>
                {card.badge && (
                  <div className="mb-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-emerald-500/20 to-blue-500/20 text-emerald-300 border border-emerald-400/30 transition-all duration-300 group-hover:from-emerald-500/30 group-hover:to-blue-500/30 group-hover:border-emerald-400/50">
                      {card.badge}
                    </span>
                  </div>
                )}
                <p className="text-xs text-white/60 transition-colors duration-300 group-hover:text-white/70">
                  {card.date}
                </p>
              </div>
            </div>

            {/* Subtle animated border on hover */}
            <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                 style={{
                   background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)',
                   backgroundSize: '200% 200%',
                   animation: hoveredIndex === index ? 'shimmer 2s ease-in-out infinite' : 'none'
                 }}>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export { DisplayCards };