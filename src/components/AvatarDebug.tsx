import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from 'lucide-react';

interface AvatarDebugProps {
  src?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-12 h-12 text-sm',
  lg: 'w-16 h-16 text-base',
  xl: 'w-20 h-20 text-lg'
};

export const AvatarDebug: React.FC<AvatarDebugProps> = ({
  src,
  name,
  size = 'md',
  className = ''
}) => {
  const [imageStatus, setImageStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [imageError, setImageError] = useState<string>('');

  useEffect(() => {
    console.log('AvatarDebug - Props:', { src, name, size });
    setImageStatus('loading');
    setImageError('');
  }, [src, name, size]);

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
    
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  const initials = getInitials(name);
  const bgColor = getRandomColor(name);

  const handleImageLoad = () => {
    console.log('AvatarDebug - Imagem carregada com sucesso:', src);
    setImageStatus('loaded');
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error('AvatarDebug - Erro ao carregar imagem:', {
      src,
      error: e,
      name
    });
    setImageStatus('error');
    setImageError('Falha ao carregar imagem');
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      <Avatar className={`${sizeClasses[size]} ${className}`}>
        <AvatarImage 
          src={src} 
          alt={`Avatar de ${name}`}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
        <AvatarFallback className={`${bgColor} text-white`}>
          {initials || <User className="w-4 h-4" />}
        </AvatarFallback>
      </Avatar>
      
      {/* Debug Info */}
      <div className="text-xs text-gray-500 space-y-1">
        <div>Status: {imageStatus}</div>
        {src && <div>URL: {src.substring(0, 50)}...</div>}
        {imageError && <div className="text-red-500">Erro: {imageError}</div>}
        <div>Nome: {name}</div>
        <div>Iniciais: {initials}</div>
      </div>
    </div>
  );
}; 