import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { User, Camera, Upload, X, RotateCw, ZoomIn, ZoomOut } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface AvatarUploadProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  className?: string;
  onInitials?: (name: string) => string;
}

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const AvatarUpload: React.FC<AvatarUploadProps> = ({
  value,
  onChange,
  label = "Foto do Perfil",
  className = "",
  onInitials
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [crop, setCrop] = useState<CropArea>({ x: 0, y: 0, width: 200, height: 200 });
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getInitials = useCallback((name: string) => {
    if (onInitials) return onInitials(name);
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }, [onInitials]);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Tipo de arquivo inválido",
        description: "Por favor, selecione apenas arquivos de imagem.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        title: "Arquivo muito grande",
        description: "Por favor, selecione uma imagem menor que 5MB.",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setIsOpen(true);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const cropImage = () => {
    if (!canvasRef.current || !imageRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = imageRef.current;
    
    // Set canvas size to crop area
    canvas.width = crop.width;
    canvas.height = crop.height;

    // Calculate scaled and rotated dimensions
    const scaledWidth = img.width * scale;
    const scaledHeight = img.height * scale;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Save context
    ctx.save();

    // Move to center of canvas
    ctx.translate(canvas.width / 2, canvas.height / 2);

    // Apply rotation
    ctx.rotate((rotation * Math.PI) / 180);

    // Draw scaled image
    ctx.drawImage(
      img,
      -scaledWidth / 2,
      -scaledHeight / 2,
      scaledWidth,
      scaledHeight
    );

    // Restore context
    ctx.restore();

    // Convert to base64
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    onChange(dataUrl);
    
    setIsOpen(false);
    setSelectedFile(null);
    setImageUrl('');
    setCrop({ x: 0, y: 0, width: 200, height: 200 });
    setScale(1);
    setRotation(0);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const resetCrop = () => {
    setCrop({ x: 0, y: 0, width: 200, height: 200 });
    setScale(1);
    setRotation(0);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <Label>{label}</Label>
      
      <div className="flex items-center space-x-4">
        {/* Avatar Preview */}
        <div className="flex-shrink-0">
          <Avatar className="w-16 h-16">
            <AvatarImage src={value} alt="Avatar do usuário" />
            <AvatarFallback className="bg-primary text-primary-foreground">
              <User className="w-6 h-6" />
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Upload Controls */}
        <div className="flex-1 space-y-2">
          <div className="flex space-x-2">
            <Button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center space-x-2 border"
            >
              <Upload className="w-4 h-4" />
              <span>Upload</span>
            </Button>
            
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button
                  type="button"
                  className="flex items-center space-x-2 border"
                >
                  <Camera className="w-4 h-4" />
                  <span>Editar</span>
                </Button>
              </DialogTrigger>
              
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Editar Foto do Perfil</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4">
                  {/* Image Preview and Crop */}
                  <div className="relative border rounded-lg overflow-hidden bg-gray-100">
                    <div
                      className={`relative ${isDragging ? 'bg-blue-50 border-blue-300' : ''}`}
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                    >
                      {imageUrl && (
                        <img
                          ref={imageRef}
                          src={imageUrl}
                          alt="Preview"
                          className="max-w-full max-h-96 object-contain"
                          onLoad={() => {
                            if (imageRef.current) {
                              const img = imageRef.current;
                              const aspectRatio = img.width / img.height;
                              const maxSize = Math.min(200, 200);
                              
                              if (aspectRatio > 1) {
                                setCrop({
                                  x: 0,
                                  y: 0,
                                  width: maxSize,
                                  height: maxSize / aspectRatio
                                });
                              } else {
                                setCrop({
                                  x: 0,
                                  y: 0,
                                  width: maxSize * aspectRatio,
                                  height: maxSize
                                });
                              }
                            }
                          }}
                        />
                      )}
                      
                      {!imageUrl && (
                        <div className="flex items-center justify-center h-48 text-gray-500">
                          <div className="text-center">
                            <Upload className="w-8 h-8 mx-auto mb-2" />
                            <p>Arraste uma imagem aqui ou clique para selecionar</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Label className="text-sm">Zoom:</Label>
                      <Button
                        type="button"
                        className="px-2 py-1 text-sm border"
                        onClick={() => setScale(Math.max(0.5, scale - 0.1))}
                      >
                        <ZoomOut className="w-4 h-4" />
                      </Button>
                      <span className="text-sm min-w-[3rem] text-center">{Math.round(scale * 100)}%</span>
                      <Button
                        type="button"
                        className="px-2 py-1 text-sm border"
                        onClick={() => setScale(Math.min(3, scale + 0.1))}
                      >
                        <ZoomIn className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Label className="text-sm">Rotação:</Label>
                      <Button
                        type="button"
                        className="px-2 py-1 text-sm border"
                        onClick={() => setRotation(rotation - 90)}
                      >
                        <RotateCw className="w-4 h-4" />
                      </Button>
                      <span className="text-sm min-w-[3rem] text-center">{rotation}°</span>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        type="button"
                        className="border"
                        onClick={resetCrop}
                      >
                        Resetar
                      </Button>
                      <Button
                        type="button"
                        onClick={cropImage}
                        className="flex-1"
                      >
                        Aplicar
                      </Button>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {value && (
              <Button
                type="button"
                className="flex items-center space-x-2 border"
                onClick={() => onChange('')}
              >
                <X className="w-4 h-4" />
                <span>Remover</span>
              </Button>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
          />
        </div>
      </div>

      {/* Canvas for cropping (hidden) */}
      <canvas
        ref={canvasRef}
        className="hidden"
        width={200}
        height={200}
      />
    </div>
  );
}; 