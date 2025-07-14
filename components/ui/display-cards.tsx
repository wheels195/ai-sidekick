"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface DisplayCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  date: string;
  iconClassName?: string;
  titleClassName?: string;
  className?: string;
}

interface DisplayCardsProps {
  cards: DisplayCardProps[];
}

export default function DisplayCards({ cards }: DisplayCardsProps) {
  return (
    <div className="relative grid [grid-template-areas:'stack'] place-content-center min-h-[300px] w-full max-w-lg mx-auto">
      {cards.map((card, index) => (
        <Card 
          key={index} 
          className={`
            relative bg-white/5 backdrop-blur-md ring-1 ring-white/10 rounded-xl shadow-lg transition-all duration-300 ease-in-out
            hover:scale-[1.02] hover:-translate-y-1 hover:shadow-xl hover:shadow-white/10 hover:ring-white/20 hover:z-10
            ${card.className || ''}
          `}
        >
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              {/* Icon Container with Gradient */}
              <div className={`
                w-12 h-12 rounded-full bg-gradient-to-br flex items-center justify-center shadow-lg
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
                <p className="text-sm text-white/80 mb-3 leading-relaxed tracking-wide">
                  {card.description}
                </p>
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