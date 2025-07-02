import React from "react"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
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
  buttonVariant = "outline",
  buttonText = "Start Free Trial",
  features,
  highlight = false,
  badge,
  onClick,
}: PricingCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col justify-between p-6 space-y-4 relative",
        highlight ? "bg-gray-800/60 rounded-xl w-full md:w-1/2 space-y-8 border border-yellow-500/40" : "flex-1"
      )}
    >
      {badge && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
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

      <div className={highlight ? "grid gap-6 sm:grid-cols-2" : ""}>
        <div className="space-y-4">
          <div>
            <h2 className="font-medium text-white">{title}</h2>
            <span className="my-3 block text-2xl font-semibold text-white">{price}</span>
            <p className="text-gray-300 text-sm">{description}</p>
          </div>

          <Button 
            className={cn(
              "w-full",
              buttonVariant === "outline" 
                ? "border border-gray-500 bg-transparent hover:bg-gray-800 text-white"
                : highlight && badge === "Most Advanced AI"
                  ? "bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-400 hover:to-orange-500 text-white"
                : highlight
                  ? "bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500 text-white"
                  : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white"
            )}
            variant={buttonVariant}
            onClick={onClick}
          >
            {buttonText}
          </Button>
        </div>
      </div>

      {highlight && (
        <div>
          <div className="text-sm font-medium text-gray-300">Everything in Starter, plus:</div>
        </div>
      )}

      <ul className={cn(
        "list-outside space-y-3 text-sm",
        highlight ? "mt-4" : "border-t border-gray-600/30 pt-4"
      )}>
        {features.map((item, index) => (
          <li key={index} className="flex items-center gap-2 text-gray-200">
            <Check className={cn(
              "size-3",
              highlight && badge === "Most Advanced AI" ? "text-yellow-400" :
              highlight ? "text-purple-400" : "text-emerald-400"
            )} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}