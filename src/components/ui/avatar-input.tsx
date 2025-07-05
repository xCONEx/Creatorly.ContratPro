import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Camera } from 'lucide-react';

interface AvatarInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

export const AvatarInput: React.FC<AvatarInputProps> = ({
  value,
  onChange,
  label = "Avatar",
  placeholder = "URL da imagem",
  className = ""
}) => {
  const [isValidUrl, setIsValidUrl] = useState(true);

  const handleUrlChange = (url: string) => {
    onChange(url);
    
    // Validar URL se não estiver vazia
    if (url) {
      try {
        new URL(url);
        setIsValidUrl(true);
      } catch {
        setIsValidUrl(false);
      }
    } else {
      setIsValidUrl(true);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <Label>{label}</Label>
      
      <div className="flex items-center space-x-4">
        {/* Avatar Preview */}
        <div className="flex-shrink-0">
          <Avatar className="w-16 h-16">
            <AvatarImage 
              src={value} 
              alt="Avatar do usuário"
              onError={() => setIsValidUrl(false)}
            />
            <AvatarFallback className="bg-primary text-primary-foreground">
              <User className="w-6 h-6" />
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Input e Botões */}
        <div className="flex-1 space-y-2">
          <div className="flex space-x-2">
            <Input
              value={value}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder={placeholder}
              className={`flex-1 ${!isValidUrl && value ? 'border-red-500' : ''}`}
            />
            <Button
              type="button"
              className="px-3"
              onClick={() => {
                const url = prompt('Digite a URL da imagem:');
                if (url) {
                  handleUrlChange(url);
                }
              }}
            >
              <Camera className="w-4 h-4" />
            </Button>
          </div>
          
          {!isValidUrl && value && (
            <p className="text-sm text-red-500">
              URL inválida. Digite uma URL válida de imagem.
            </p>
          )}
          
          {value && isValidUrl && (
            <p className="text-sm text-green-600">
              ✓ URL válida
            </p>
          )}
        </div>
      </div>
    </div>
  );
}; 