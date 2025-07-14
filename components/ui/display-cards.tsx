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
          className="w-full bg-gray-900 ring-1 ring-white/10 rounded-xl shadow-lg hover:scale-[1.02] hover:shadow-xl hover:shadow-white/10 hover:ring-white/20 transition-all duration-300 ease-out"
          onMouseEnter={() => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              {/* Icon Container */}
              <div className={`
                w-12 h-12 rounded-full bg-gradient-to-br flex items-center justify-center shadow-lg shrink-0 transition-all duration-300
                ${card.iconClassName?.includes('blue') ? 'from-blue-600 to-blue-400 shadow-blue-500/25' : ''}
                ${card.iconClassName?.includes('purple') ? 'from-purple-600 to-purple-400 shadow-purple-500/25' : ''}
                ${card.iconClassName?.includes('orange') ? 'from-orange-600 to-orange-400 shadow-orange-500/25' : ''}
                ${card.iconClassName?.includes('emerald') ? 'from-emerald-600 to-emerald-400 shadow-emerald-500/25' : ''}
                ${hoveredIndex === index ? 'scale-110 rotate-6' : ''}
              `}>
                <div className="text-white">
                  {card.icon}
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="text-lg font-semibold text-white mb-2 tracking-tight">
                  {card.title}
                </h4>
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
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export { DisplayCards };