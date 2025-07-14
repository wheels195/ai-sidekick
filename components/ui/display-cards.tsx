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
            relative bg-card/80 backdrop-blur-xl border border-border/50 shadow-lg transition-all duration-500 ease-out
            ${card.className || ''}
          `}
        >
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className={`${card.iconClassName || ''}`}>
                {card.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className={`font-semibold text-base mb-2 ${card.titleClassName || 'text-foreground'}`}>
                  {card.title}
                </h4>
                <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                  {card.description}
                </p>
                <p className="text-xs text-muted-foreground/70">
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