import React from 'react';

interface CompanyAvatarProps {
  company: string;
  size?: 'sm' | 'md' | 'lg';
}

export function CompanyAvatar({ company, size = 'md' }: CompanyAvatarProps) {
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-xs',
    lg: 'w-12 h-12 text-sm'
  };

  // Generate a consistent hash from company name for stable colors
  const hashCode = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  };

  // Creative avatar generation logic
  const generateAvatar = (companyName: string) => {
    const hash = hashCode(companyName.toLowerCase());
    
    // Define gradient combinations
    const gradients = [
      'from-purple-500 to-pink-500',
      'from-blue-500 to-cyan-500', 
      'from-green-500 to-emerald-500',
      'from-yellow-500 to-orange-500',
      'from-red-500 to-pink-500',
      'from-indigo-500 to-purple-500',
      'from-teal-500 to-green-500',
      'from-orange-500 to-red-500',
      'from-cyan-500 to-blue-500',
      'from-pink-500 to-rose-500',
      'from-violet-500 to-purple-500',
      'from-amber-500 to-yellow-500',
      'from-lime-500 to-green-500',
      'from-emerald-500 to-teal-500',
      'from-sky-500 to-blue-500'
    ];
    
    const gradient = gradients[hash % gradients.length];
    
    // Special cases for well-known companies with creative representations
    const specialCases: Record<string, { text: string; gradient?: string }> = {
      'google': { text: 'G', gradient: 'from-blue-500 via-red-500 to-yellow-500' },
      'alphabet': { text: 'α', gradient: 'from-blue-500 via-red-500 to-yellow-500' },
      'meta': { text: '∞', gradient: 'from-blue-600 to-purple-600' },
      'facebook': { text: 'f', gradient: 'from-blue-600 to-blue-800' },
      'apple': { text: '', gradient: 'from-gray-800 to-black' },
      'microsoft': { text: '⊞', gradient: 'from-blue-500 to-cyan-500' },
      'amazon': { text: 'a→z', gradient: 'from-orange-400 to-yellow-500' },
      'netflix': { text: 'N', gradient: 'from-red-600 to-black' },
      'tesla': { text: 'T', gradient: 'from-red-500 to-white' },
      'spacex': { text: '🚀', gradient: 'from-blue-900 to-black' },
      'nvidia': { text: '◢', gradient: 'from-green-500 to-black' },
      'intel': { text: 'i', gradient: 'from-blue-600 to-cyan-400' },
      'amd': { text: 'A', gradient: 'from-red-600 to-orange-500' },
      'ibm': { text: '█', gradient: 'from-blue-800 to-blue-600' },
      'oracle': { text: 'O', gradient: 'from-red-600 to-orange-500' },
      'salesforce': { text: '☁', gradient: 'from-blue-500 to-cyan-400' },
      'stripe': { text: '//', gradient: 'from-purple-600 to-blue-500' },
      'uber': { text: 'U', gradient: 'from-black to-gray-600' },
      'lyft': { text: 'L', gradient: 'from-pink-500 to-purple-500' },
      'airbnb': { text: 'A', gradient: 'from-red-500 to-pink-500' },
      'spotify': { text: '♫', gradient: 'from-green-500 to-black' },
      'discord': { text: 'D', gradient: 'from-purple-600 to-indigo-600' },
      'slack': { text: '#', gradient: 'from-purple-500 to-pink-500' },
      'zoom': { text: 'Z', gradient: 'from-blue-500 to-purple-500' },
      'dropbox': { text: '□', gradient: 'from-blue-500 to-blue-700' },
      'github': { text: '※', gradient: 'from-gray-800 to-black' },
      'twitter': { text: '𝕏', gradient: 'from-black to-gray-700' },
      'x': { text: '𝕏', gradient: 'from-black to-gray-700' },
      'linkedin': { text: 'in', gradient: 'from-blue-600 to-blue-800' },
      'tiktok': { text: '♪', gradient: 'from-black via-red-500 to-cyan-400' },
      'snap': { text: '👻', gradient: 'from-yellow-400 to-yellow-500' },
      'snapchat': { text: '👻', gradient: 'from-yellow-400 to-yellow-500' },
      'pinterest': { text: 'P', gradient: 'from-red-600 to-pink-500' },
      'reddit': { text: 'r/', gradient: 'from-orange-600 to-red-600' },
      'twitch': { text: 'T', gradient: 'from-purple-600 to-pink-500' },
      'paypal': { text: 'P', gradient: 'from-blue-600 to-blue-800' },
      'square': { text: '□', gradient: 'from-blue-600 to-green-500' },
      'shopify': { text: 'S', gradient: 'from-green-500 to-emerald-500' },
      'coinbase': { text: '₿', gradient: 'from-blue-500 to-purple-500' },
      'robinhood': { text: 'R', gradient: 'from-green-500 to-emerald-600' },
      'palantir': { text: '👁', gradient: 'from-blue-900 to-purple-900' },
      'cloudflare': { text: '☁', gradient: 'from-orange-500 to-yellow-500' },
      'datadog': { text: '🐕', gradient: 'from-purple-600 to-pink-500' },
      'snowflake': { text: '❄', gradient: 'from-blue-400 to-cyan-300' },
      'mongodb': { text: '🍃', gradient: 'from-green-600 to-green-800' },
      'redis': { text: 'R', gradient: 'from-red-600 to-red-800' },
      'elastic': { text: 'E', gradient: 'from-yellow-500 to-orange-500' }
    };
    
    const lowerName = companyName.toLowerCase();
    const special = specialCases[lowerName];
    
    if (special) {
      return {
        text: special.text,
        gradient: special.gradient || gradient
      };
    }
    
    // Default logic for other companies
    const words = companyName.split(' ').filter(word => word.length > 0);
    
    if (words.length === 1) {
      // Single word - use first letter with creative twist for certain patterns
      const word = words[0];
      if (word.length <= 3) {
        // Short companies like "AMD", "IBM" - use full name
        return { text: word.toUpperCase(), gradient };
      }
      
      // Check for common patterns
      if (word.toLowerCase().includes('tech')) {
        return { text: '⚡', gradient };
      }
      if (word.toLowerCase().includes('soft')) {
        return { text: '◇', gradient };
      }
      if (word.toLowerCase().includes('data')) {
        return { text: '◈', gradient };
      }
      if (word.toLowerCase().includes('cloud')) {
        return { text: '☁', gradient };
      }
      if (word.toLowerCase().includes('cyber')) {
        return { text: '🛡', gradient };
      }
      if (word.toLowerCase().includes('bio')) {
        return { text: '🧬', gradient };
      }
      
      // Default to first letter
      return { text: word.charAt(0).toUpperCase(), gradient };
    }
    
    // Multiple words - use initials or creative combinations
    if (words.length === 2) {
      const first = words[0].charAt(0).toUpperCase();
      const second = words[1].charAt(0).toUpperCase();
      return { text: first + second, gradient };
    }
    
    // 3+ words - use first two initials
    const first = words[0].charAt(0).toUpperCase();
    const second = words[1].charAt(0).toUpperCase();
    return { text: first + second, gradient };
  };

  const avatar = generateAvatar(company);

  return (
    <div className={`${sizeClasses[size]} bg-gradient-to-br ${avatar.gradient} rounded-md flex items-center justify-center shadow-sm`}>
      <span className="text-white font-bold leading-none">
        {avatar.text}
      </span>
    </div>
  );
}