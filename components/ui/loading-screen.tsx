"use client"

import { Leaf } from "lucide-react"

export default function LoadingScreen() {
  return (
    <div className="min-h-[100dvh] w-full bg-black flex items-center justify-center relative overflow-hidden">
      {/* Safe area padding for mobile */}
      <div 
        className="flex flex-col items-center justify-center z-10 px-4"
        style={{
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: 'env(safe-area-inset-bottom)',
          paddingLeft: 'env(safe-area-inset-left)',
          paddingRight: 'env(safe-area-inset-right)'
        }}
      >
        {/* Main Logo */}
        <div className="mb-8">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-500/25 animate-pulse">
            <Leaf className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
        </div>

        {/* Loading Text */}
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent font-cursive">
              Sprouting ideas
            </span>
          </h2>
          <p className="text-gray-300 text-lg">Just a moment...</p>
        </div>

        {/* Loading Dots Animation */}
        <div className="flex space-x-1 mt-6">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></div>
        </div>
      </div>

      {/* Falling Leaves Animation */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Leaf 1 */}
        <div className="absolute animate-fall-1 opacity-60">
          <Leaf className="w-4 h-4 text-emerald-400 transform rotate-12" />
        </div>
        
        {/* Leaf 2 */}
        <div className="absolute animate-fall-2 opacity-40">
          <Leaf className="w-3 h-3 text-teal-400 transform -rotate-45" />
        </div>
        
        {/* Leaf 3 */}
        <div className="absolute animate-fall-3 opacity-50">
          <Leaf className="w-5 h-5 text-emerald-300 transform rotate-90" />
        </div>
        
        {/* Leaf 4 */}
        <div className="absolute animate-fall-4 opacity-30">
          <Leaf className="w-3 h-3 text-teal-300 transform -rotate-12" />
        </div>
        
        {/* Leaf 5 */}
        <div className="absolute animate-fall-5 opacity-45">
          <Leaf className="w-4 h-4 text-emerald-500 transform rotate-180" />
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fall-1 {
          0% {
            top: -20px;
            left: 20%;
            transform: rotate(0deg);
          }
          100% {
            top: 100vh;
            left: 25%;
            transform: rotate(360deg);
          }
        }
        
        @keyframes fall-2 {
          0% {
            top: -20px;
            left: 50%;
            transform: rotate(0deg);
          }
          100% {
            top: 100vh;
            left: 45%;
            transform: rotate(-360deg);
          }
        }
        
        @keyframes fall-3 {
          0% {
            top: -20px;
            left: 80%;
            transform: rotate(0deg);
          }
          100% {
            top: 100vh;
            left: 75%;
            transform: rotate(180deg);
          }
        }
        
        @keyframes fall-4 {
          0% {
            top: -20px;
            left: 10%;
            transform: rotate(0deg);
          }
          100% {
            top: 100vh;
            left: 15%;
            transform: rotate(-180deg);
          }
        }
        
        @keyframes fall-5 {
          0% {
            top: -20px;
            left: 70%;
            transform: rotate(0deg);
          }
          100% {
            top: 100vh;
            left: 65%;
            transform: rotate(270deg);
          }
        }
        
        .animate-fall-1 {
          animation: fall-1 3s linear infinite;
        }
        
        .animate-fall-2 {
          animation: fall-2 4s linear infinite 0.5s;
        }
        
        .animate-fall-3 {
          animation: fall-3 3.5s linear infinite 1s;
        }
        
        .animate-fall-4 {
          animation: fall-4 4.5s linear infinite 1.5s;
        }
        
        .animate-fall-5 {
          animation: fall-5 3.8s linear infinite 2s;
        }
      `}</style>
    </div>
  )
}