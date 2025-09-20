import React from 'react';

export default function BeautifulLoader({ size = 'medium', text = 'Loading...' }) {
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-16 h-16',
    xl: 'w-20 h-20'
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      {/* Animated Spinner */}
      <div className={`${sizeClasses[size]} relative`}>
        {/* Outer Ring */}
        <div className="absolute inset-0 border-4 border-white/20 rounded-full"></div>
        
        {/* Inner Spinning Ring */}
        <div className="absolute inset-0 border-4 border-transparent border-t-white rounded-full animate-spin"></div>
        
        {/* Center Glow */}
        <div className="absolute inset-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full opacity-20 animate-pulse"></div>
      </div>
      
      {/* Loading Text */}
      <div className="text-white/80 text-sm font-medium animate-pulse">
        {text}
      </div>
      
      {/* Animated Dots */}
      <div className="flex space-x-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 bg-white/60 rounded-full animate-bounce"
            style={{
              animationDelay: `${i * 0.2}s`,
              animationDuration: '1s'
            }}
          />
        ))}
      </div>
    </div>
  );
}

export function BeautifulProgressBar({ progress = 0, text = 'Processing...' }) {
  return (
    <div className="w-full space-y-3">
      {/* Progress Text */}
      <div className="flex justify-between items-center text-white/80 text-sm">
        <span>{text}</span>
        <span>{Math.round(progress)}%</span>
      </div>
      
      {/* Progress Bar */}
      <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all duration-500 ease-out relative"
          style={{ width: `${progress}%` }}
        >
          {/* Shimmer Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
        </div>
      </div>
      
      {/* Progress Steps */}
      <div className="flex justify-between text-xs text-white/60">
        <span>Upload</span>
        <span>Process</span>
        <span>Analyze</span>
        <span>Complete</span>
      </div>
    </div>
  );
}

export function BeautifulSuccessIcon() {
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      {/* Success Circle */}
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full animate-pulse-glow"></div>
        <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>
      
      {/* Success Text */}
      <div className="text-white font-semibold text-lg">
        Success!
      </div>
    </div>
  );
}

export function BeautifulErrorIcon() {
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      {/* Error Circle */}
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-600 rounded-full animate-pulse-glow"></div>
        <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      </div>
      
      {/* Error Text */}
      <div className="text-white font-semibold text-lg">
        Error!
      </div>
    </div>
  );
}
