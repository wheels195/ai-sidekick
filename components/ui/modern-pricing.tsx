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
  savingsText?: string;
  isAnnual?: boolean;
}

export const ModernPricingCard = ({
  planName, description, price, features, buttonText, isPopular = false, badge, onClick, savingsText, isAnnual = false
}: ModernPricingCardProps) => {
  const cardClasses = `
    backdrop-blur-2xl bg-gradient-to-br rounded-2xl shadow-2xl flex-1 max-w-sm px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 flex flex-col transition-all duration-300 relative font-inter h-full min-h-[400px] sm:min-h-[450px] lg:min-h-[500px]
    from-gray-900/80 to-gray-950/80 border border-emerald-500/20
    ${isPopular 
      ? 'sm:xl:scale-110 ring-2 sm:ring-4 ring-emerald-400/40 border-emerald-400/60 shadow-emerald-500/50 bg-gradient-to-br from-emerald-900/30 to-gray-900/80 sm:hover:xl:scale-[1.15] sm:hover:ring-emerald-400/60 sm:hover:shadow-emerald-500/75' 
      : 'sm:hover:border-emerald-500/40 sm:hover:shadow-emerald-500/25 sm:hover:scale-105'
    }
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
      
      <div className="mb-4 sm:mb-6">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white mb-2">{planName}</h2>
        <p className="text-gray-300 text-sm sm:text-base lg:text-lg leading-relaxed">{description}</p>
      </div>
      
      <div className="my-6 sm:my-8">
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-3xl sm:text-4xl lg:text-5xl font-extralight text-white">{price}</span>
          {price !== "0" && price !== "Contact Us" && (
            <span className="text-sm sm:text-base text-gray-400">
              /mo
            </span>
          )}
        </div>
        {savingsText && (
          <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg px-3 py-1 inline-block">
            <span className="text-green-400 text-sm font-semibold">{savingsText}</span>
          </div>
        )}
      </div>
      
      <div className="w-full mb-6 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent"></div>
      
      <ul className="flex flex-col gap-2 sm:gap-3 text-sm sm:text-base text-gray-200 mb-6 sm:mb-8 flex-grow">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center gap-3">
            <CheckIcon className="text-emerald-400 w-4 sm:w-5 h-4 sm:h-5 flex-shrink-0" /> 
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      
      <Button
        onClick={onClick}
        className={`
          mt-auto w-full py-3 sm:py-4 lg:py-5 rounded-xl font-semibold text-sm sm:text-base lg:text-lg transition-all duration-300 min-h-[44px] sm:min-h-[48px] lg:min-h-[52px]
          ${isPopular 
            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 sm:hover:from-emerald-400 sm:hover:to-teal-400 text-white shadow-lg sm:hover:shadow-emerald-500/25 sm:hover:scale-105' 
            : 'bg-gray-800/60 sm:hover:bg-gray-700/60 text-white border border-gray-600/40 sm:hover:border-emerald-500/40 backdrop-blur-xl'
          }
        `}
      >
        {buttonText}
      </Button>
    </div>
  );
};