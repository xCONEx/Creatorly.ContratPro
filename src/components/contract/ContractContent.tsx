
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ContractContentProps {
  content: string;
  onContentChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const ContractContent = ({ content, onContentChange }: ContractContentProps) => {
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const fileContent = event.target?.result as string;
        const syntheticEvent = {
          target: {
            name: 'content',
            value: fileContent
          }
        } as React.ChangeEvent<HTMLTextAreaElement>;
        onContentChange(syntheticEvent);
        toast({
          title: "Arquivo carregado",
          description: "O conteúdo do arquivo foi adicionado ao contrato",
        });
      };
      reader.readAsText(file);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Conteúdo do Contrato</CardTitle>
        <CardDescription>
          Digite o texto do contrato ou faça upload de um arquivo
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-4">
          <input
            type="file"
            accept=".txt,.doc,.docx"
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
          />
          <Label htmlFor="file-upload">
            <Button type="button" variant="outline" asChild>
              <span className="cursor-pointer">
                <Upload className="w-4 h-4 mr-2" />
                Upload de Arquivo
              </span>
            </Button>
          </Label>
          <span className="text-sm text-slate-500">
            Aceita .txt, .doc, .docx
          </span>
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">Texto do Contrato *</Label>
          <Textarea
            id="content"
            name="content"
            value={content}
            onChange={onContentChange}
            placeholder="Digite o conteúdo do contrato aqui..."
            className="min-h-96"
            required
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ContractContent;
