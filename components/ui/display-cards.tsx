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
            relative bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 shadow-2xl transition-all duration-500 ease-out hover:shadow-3xl hover:scale-105 hover:z-10
            ${card.className || ''}
          `}
        >
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className={`${card.iconClassName || ''}`}>
                {card.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className={`font-semibold text-base mb-2 text-white ${card.titleClassName || ''}`}>
                  {card.title}
                </h4>
                <p className="text-sm text-gray-300 mb-3 leading-relaxed">
                  {card.description}
                </p>
                <p className="text-xs text-gray-400">
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