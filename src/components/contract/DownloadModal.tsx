
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Download } from 'lucide-react';
import { formatProfessionalContract } from './ContractFormatter';
import { toast } from '@/hooks/use-toast';

interface Contract {
  id: string;
  title: string;
  content: string;
  clients?: {
    name: string;
    email?: string;
  };
  total_value?: number;
  due_date?: string;
  created_at: string;
}

interface DownloadModalProps {
  contract: Contract | null;
  isOpen: boolean;
  onClose: () => void;
}

const DownloadModal = ({ contract, isOpen, onClose }: DownloadModalProps) => {
  if (!contract) return null;

  const handleDownload = (format: 'txt' | 'pdf' | 'docx') => {
    try {
      const formattedContract = formatProfessionalContract({
        id: contract.id,
        title: contract.title,
        content: contract.content,
        client_name: contract.clients?.name || 'Cliente não informado',
        client_email: contract.clients?.email,
        total_value: contract.total_value,
        due_date: contract.due_date,
        created_at: contract.created_at
      });

      let mimeType = 'text/plain;charset=utf-8';
      let fileExtension = 'txt';
      let content = formattedContract;

      if (format === 'docx') {
        // Para DOCX, vamos criar um formato RTF que o Word pode abrir
        mimeType = 'application/rtf';
        fileExtension = 'rtf';
        content = `{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Times New Roman;}}
{\\*\\generator ContratPro;}
\\f0\\fs24 ${formattedContract.replace(/\n/g, '\\par ')}}`;
      } else if (format === 'pdf') {
        // Para PDF, vamos usar HTML que pode ser convertido
        mimeType = 'text/html;charset=utf-8';
        fileExtension = 'html';
        content = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${contract.title}</title>
  <style>
    body { font-family: Arial, sans-serif; font-size: 12pt; line-height: 1.5; margin: 2.5cm; }
    h1 { text-align: center; font-weight: bold; margin-bottom: 20px; }
    .contract-number { text-align: center; margin-bottom: 30px; }
    .section { margin-bottom: 20px; }
    .signature-section { margin-top: 50px; }
    .signature-line { border-bottom: 1px solid #000; width: 300px; margin: 20px 0 5px 0; }
  </style>
</head>
<body>
  <pre style="white-space: pre-wrap; font-family: Arial, sans-serif;">${formattedContract}</pre>
</body>
</html>`;
      }

      const blob = new Blob([content], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Contrato_${contract.title.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().slice(0, 10)}.${fileExtension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      let message = "Contrato baixado com sucesso!";
      if (format === 'docx') {
        message = "Arquivo RTF baixado. Abra no Microsoft Word para melhor formatação.";
      } else if (format === 'pdf') {
        message = "Arquivo HTML baixado. Abra no navegador e use 'Imprimir > Salvar como PDF'.";
      } else {
        message = "Contrato formatado baixado. Importe no Google Docs para melhor visualização.";
      }

      toast({
        title: "Download concluído",
        description: message,
      });

      onClose();
    } catch (error) {
      console.error('Error downloading contract:', error);
      toast({
        title: "Erro",
        description: "Erro ao baixar contrato",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Baixar Contrato</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Escolha o formato para download do contrato "{contract.title}":
          </p>

          <div className="space-y-3">
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleDownload('txt')}>
              <CardContent className="flex items-center p-4">
                <FileText className="w-8 h-8 text-slate-600 mr-3" />
                <div className="flex-1">
                  <h3 className="font-medium">Texto (.txt)</h3>
                  <p className="text-sm text-slate-600">Para Google Docs ou Word</p>
                </div>
                <Download className="w-5 h-5 text-slate-400" />
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleDownload('docx')}>
              <CardContent className="flex items-center p-4">
                <FileText className="w-8 h-8 text-blue-600 mr-3" />
                <div className="flex-1">
                  <h3 className="font-medium">Word (.rtf)</h3>
                  <p className="text-sm text-slate-600">Para Microsoft Word</p>
                </div>
                <Download className="w-5 h-5 text-slate-400" />
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleDownload('pdf')}>
              <CardContent className="flex items-center p-4">
                <FileText className="w-8 h-8 text-red-600 mr-3" />
                <div className="flex-1">
                  <h3 className="font-medium">PDF (.html)</h3>
                  <p className="text-sm text-slate-600">Converter para PDF no navegador</p>
                </div>
                <Download className="w-5 h-5 text-slate-400" />
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DownloadModal;
