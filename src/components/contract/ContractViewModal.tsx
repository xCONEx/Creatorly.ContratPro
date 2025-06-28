
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Calendar, DollarSign, FileText } from 'lucide-react';

interface Contract {
  id: string;
  title: string;
  content: string;
  status: string;
  created_at: string;
  total_value?: number;
  due_date?: string;
  clients?: {
    name: string;
    email?: string;
  };
}

interface ContractViewModalProps {
  contract: Contract | null;
  isOpen: boolean;
  onClose: () => void;
}

const ContractViewModal = ({ contract, isOpen, onClose }: ContractViewModalProps) => {
  if (!contract) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Enviado</Badge>;
      case 'signed':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Assinado</Badge>;
      case 'approved':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Aprovado</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Rejeitado</Badge>;
      case 'draft':
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">Rascunho</Badge>;
      case 'expired':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Expirado</Badge>;
      default:
        return <Badge>Desconhecido</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{contract.title}</span>
            {getStatusBadge(contract.status)}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações do Contrato</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  <span className="text-sm">
                    <strong>Cliente:</strong> {contract.clients?.name || 'Não informado'}
                  </span>
                </div>
                {contract.clients?.email && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">
                      <strong>Email:</strong> {contract.clients.email}
                    </span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  <span className="text-sm">
                    <strong>Criado em:</strong> {new Date(contract.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                {contract.due_date && (
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                    <span className="text-sm">
                      <strong>Vencimento:</strong> {new Date(contract.due_date).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                )}
                {contract.total_value && (
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                    <span className="text-sm">
                      <strong>Valor:</strong> R$ {Number(contract.total_value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Conteúdo do Contrato */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Conteúdo do Contrato
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none dark:prose-invert">
                <div className="whitespace-pre-wrap text-sm">{contract.content}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ContractViewModal;
