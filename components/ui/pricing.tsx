import React from "react"
import { CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface PricingCardProps {
  title: string
  price: string
  description: string
  buttonVariant?: "default" | "outline"
  buttonText?: string
  features: string[]
  highlight?: boolean
  badge?: string
  onClick?: () => void
}

export function PricingCard({
  title,
  price,
  description,
  buttonVariant = "default",
  buttonText = "Start Free Trial",
  features,
  highlight = false,
  badge,
  onClick,
}: PricingCardProps) {
  return (
    <Card className={cn(
      "relative flex-1 backdrop-blur-2xl bg-gray-800/40 border-gray-600/30 shadow-2xl hover:shadow-xl transition-all duration-500 hover:scale-105",
      highlight && badge === "Most Advanced AI" && "border-yellow-500/40 hover:shadow-yellow-500/20 bg-gray-800/60",
      highlight && badge !== "Most Advanced AI" && "border-purple-500/40 hover:shadow-purple-500/20 bg-gray-800/60"
    )}>
      {badge && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className={cn(
            "text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg",
            badge === "Most Advanced AI" 
              ? "bg-gradient-to-r from-yellow-500 to-orange-600"
              : badge === "General Contractors"
              ? "bg-gradient-to-r from-gray-500 to-slate-700"
              : "bg-gradient-to-r from-purple-500 to-pink-500"
          )}>
            {badge}
          </span>
        </div>
      )}
      <CardContent className="p-6 h-full flex flex-col">
        <div className="text-left mb-6">
          <h3 className="text-lg font-bold text-white mb-3">{title}</h3>
          <div className="text-3xl font-bold text-white mb-3">
            {price}
          </div>
          <p className="text-gray-200 text-sm">{description}</p>
        </div>

        <ul className="space-y-2 mb-6 flex-1">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start group">
              <CheckCircle className={cn(
                "w-4 h-4 mr-2 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-all duration-300",
                highlight && badge === "Most Advanced AI" ? "text-yellow-400" :
                highlight ? "text-purple-400" : "text-emerald-400"
              )} />
              <span className="text-gray-200 text-xs text-left">{feature}</span>
            </li>
          ))}
        </ul>

        <div className="mt-auto">
          <Button
            className={cn(
              "w-full shadow-xl transition-all duration-300 hover:scale-105 text-xs py-2 px-3",
              buttonVariant === "outline" 
                ? "border border-gray-500 bg-transparent hover:bg-gray-800 text-white"
                : highlight && badge === "Most Advanced AI"
                  ? "bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-400 hover:to-orange-500 text-white hover:shadow-yellow-500/25"
                : highlight
                  ? "bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500 text-white hover:shadow-purple-500/25"
                  : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white hover:shadow-blue-500/25"
            )}
            onClick={onClick}
          >
            {buttonText}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}