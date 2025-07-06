import React from 'react';
import { Button } from "@/components/ui/button";

// Internal Helper Components
const CheckIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16" height="16" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="3"
    strokeLinecap="round" strokeLinejoin="round"
    className={className}
  >
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

export interface ModernPricingCardProps {
  planName: string;
  description: string;
  price: string;
  features: string[];
  buttonText: string;
  isPopular?: boolean;
  badge?: string;
  onClick?: () => void;
}

export const ModernPricingCard = ({
  planName, description, price, features, buttonText, isPopular = false, badge, onClick
}: ModernPricingCardProps) => {
  const cardClasses = `
    backdrop-blur-2xl bg-gradient-to-br rounded-2xl shadow-2xl flex-1 max-w-sm px-8 py-10 flex flex-col transition-all duration-300 relative font-inter
    from-gray-900/80 to-gray-950/80 border border-emerald-500/20
    hover:border-emerald-500/40 hover:shadow-emerald-500/25 hover:scale-105
    ${isPopular ? 'scale-110 ring-4 ring-emerald-400/40 border-emerald-400/60 shadow-emerald-500/50 bg-gradient-to-br from-emerald-900/30 to-gray-900/80' : ''}
  `;

  return (
    <div className={cardClasses.trim()}>
      {badge && (
        <div className={`absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-2 text-xs font-bold rounded-full shadow-lg ${
          isPopular 
            ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black animate-pulse' 
            : 'bg-gradient-to-r from-emerald-400 to-teal-500 text-black'
        }`}>
          {badge}
        </div>
      )}
      
      <div className="mb-6">
        <h2 className="text-4xl font-extralight tracking-tight text-white mb-2">{planName}</h2>
        <p className="text-gray-300 text-base leading-relaxed">{description}</p>
      </div>
      
      <div className="my-8 flex items-baseline gap-2">
        <span className="text-5xl font-extralight text-white">{price}</span>
        {price !== "$0" && <span className="text-sm text-gray-400">/mo</span>}
      </div>
      
      <div className="w-full mb-6 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent"></div>
      
      <ul className="flex flex-col gap-3 text-sm text-gray-200 mb-8 flex-grow">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center gap-3">
            <CheckIcon className="text-emerald-400 w-4 h-4 flex-shrink-0" /> 
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      
      <Button
        onClick={onClick}
        className={`
          mt-auto w-full py-4 rounded-xl font-semibold text-base transition-all duration-300
          ${isPopular 
            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white shadow-lg hover:shadow-emerald-500/25 hover:scale-105' 
            : 'bg-gray-800/60 hover:bg-gray-700/60 text-white border border-gray-600/40 hover:border-emerald-500/40 backdrop-blur-xl'
          }
        `}
      >
        {buttonText}
      </Button>
    </div>
  );
};