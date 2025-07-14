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
    <div className="relative w-full max-w-2xl mx-auto h-[500px] lg:h-[550px]">
      {cards.map((card, index) => {
        const isHovered = hoveredIndex === index;
        const isOtherHovered = hoveredIndex !== null && hoveredIndex !== index;
        
        // Define positions for diagonal stacking
        const positions = [
          { x: 0, y: 0, rotation: 0 }, // Top card
          { x: 40, y: 60, rotation: 2 }, // Middle card  
          { x: 80, y: 120, rotation: 4 }, // Third card
          { x: 120, y: 180, rotation: 6 }, // Fourth card
        ];
        
        const position = positions[index];
        
        return (
          <Card 
            key={index}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            className={`
              absolute w-full max-w-md bg-black/50 backdrop-blur-sm border border-white/10 rounded-xl shadow-2xl 
              transition-all duration-300 ease-in-out cursor-pointer overflow-hidden
              ${isHovered ? 'z-50 scale-105 -translate-y-4 shadow-2xl shadow-white/20 border-white/20' : ''}
              ${isOtherHovered ? 'opacity-70' : ''}
            `}
            style={{
              transform: isHovered 
                ? 'translateX(0px) translateY(-16px) rotate(0deg) scale(1.05)' 
                : `translateX(${position.x}px) translateY(${position.y}px) rotate(${position.rotation}deg)`,
              zIndex: isHovered ? 50 : 30 - index,
            }}
          >
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                {/* Icon Container with Gradient */}
                <div className={`
                  w-12 h-12 rounded-full bg-gradient-to-br flex items-center justify-center shadow-lg shrink-0
                  ${card.iconClassName?.includes('blue') ? 'from-blue-600 to-blue-400 shadow-blue-500/25' : ''}
                  ${card.iconClassName?.includes('purple') ? 'from-purple-600 to-purple-400 shadow-purple-500/25' : ''}
                  ${card.iconClassName?.includes('orange') ? 'from-orange-600 to-orange-400 shadow-orange-500/25' : ''}
                `}>
                  <div className="text-white">
                    {card.icon}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="text-lg font-semibold text-white mb-2 tracking-tight">
                    {card.title}
                  </h4>
                  <div className={`transition-all duration-300 ${isHovered ? 'opacity-100 max-h-48' : 'opacity-60 max-h-8 overflow-hidden'}`}>
                    <p className="text-sm text-white/80 mb-3 leading-relaxed tracking-wide">
                      {card.description}
                    </p>
                    {card.badge && (
                      <div className="mb-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-emerald-500/20 to-blue-500/20 text-emerald-300 border border-emerald-400/30">
                          {card.badge}
                        </span>
                      </div>
                    )}
                    <p className="text-xs text-white/60">
                      {card.date}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export { DisplayCards };