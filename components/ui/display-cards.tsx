import React from "react"
import { Card, CardContent } from "@/components/ui/card"

interface DisplayCardProps {
  icon: React.ReactNode
  title: string
  description: string
  date: string
}

interface DisplayCardsProps {
  cards: DisplayCardProps[]
}

export function DisplayCards({ cards }: DisplayCardsProps) {
  return (
    <div className="grid md:grid-cols-3 gap-4 mb-8">
      {cards.map((card, index) => (
        <Card key={index} className="bg-background/50 border-white/10 hover:bg-background/70 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              {card.icon}
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm text-foreground mb-1">
                  {card.title}
                </h4>
                <p className="text-xs text-muted-foreground mb-2 leading-relaxed">
                  {card.description}
                </p>
                <p className="text-xs text-muted-foreground/80">
                  {card.date}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}