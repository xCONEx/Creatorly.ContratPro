import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from 'lucide-react';

interface AvatarWithInitialsProps {
  src?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  fallbackIcon?: React.ReactNode;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-12 h-12 text-sm',
  lg: 'w-16 h-16 text-base',
  xl: 'w-20 h-20 text-lg'
};

const fallbackSizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-7 h-7'
};

export const AvatarWithInitials: React.FC<AvatarWithInitialsProps> = ({
  src,
  name,
  size = 'md',
  className = '',
  fallbackIcon
}) => {
  const getInitials = (name: string) => {
    if (!name) return '';
    
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRandomColor = (name: string) => {
    const colors = [
      'bg-red-500',
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500',
      'bg-orange-500',
      'bg-cyan-500'
    ];
    
    // Generate consistent color based on name
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  const initials = getInitials(name);
  const bgColor = getRandomColor(name);

  return (
    <Avatar className={`${sizeClasses[size]} ${className}`}>
      <AvatarImage src={src} alt={`Avatar de ${name}`} />
      <AvatarFallback className={`${bgColor} text-white`}>
        {fallbackIcon || (initials || <User className={fallbackSizeClasses[size]} />)}
      </AvatarFallback>
    </Avatar>
  );
}; 