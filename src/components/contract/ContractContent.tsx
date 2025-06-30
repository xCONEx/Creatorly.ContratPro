
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, FileText } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import TemplateSelector from './TemplateSelector';

interface ContractContentProps {
  content: string;
  onContentChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const ContractContent = ({ content, onContentChange }: ContractContentProps) => {
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);

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

  const handleTemplateSelect = (template: any) => {
    const syntheticEvent = {
      target: {
        name: 'content',
        value: template.content
      }
    } as React.ChangeEvent<HTMLTextAreaElement>;
    onContentChange(syntheticEvent);
    setShowTemplateSelector(false);
    toast({
      title: "Template aplicado",
      description: `Template "${template.name}" foi adicionado ao contrato`,
    });
  };

  if (showTemplateSelector) {
    return (
      <Card>
        <CardContent className="p-6">
          <TemplateSelector
            onSelect={handleTemplateSelect}
            onClose={() => setShowTemplateSelector(false)}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Conteúdo do Contrato</CardTitle>
        <CardDescription>
          Digite o texto do contrato, use um template ou faça upload de um arquivo
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-4 flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowTemplateSelector(true)}
          >
            <FileText className="w-4 h-4 mr-2" />
            Usar Template
          </Button>
          
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
            placeholder="Digite o conteúdo do contrato aqui ou use um template..."
            className="min-h-96"
            required
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ContractContent;
