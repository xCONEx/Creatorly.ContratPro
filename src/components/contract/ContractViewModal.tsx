import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Calendar, DollarSign, FileText, Download } from 'lucide-react';
import DownloadModal from './DownloadModal';

interface Contract {
  id: string;
  title: string;
  content: string;
  status: string;
  created_at: string;
  total_value?: number;
  due_date?: string;
  user_name?: string;
  user_email?: string;
  user_cnpj?: string;
  user_address?: string;
  user_phone?: string;
  clients?: {
    name: string;
    email?: string;
    cpf_cnpj?: string;
    cnpj?: string;
    address?: string;
    phone?: string;
  };
}

interface ContractViewModalProps {
  contract: Contract | null;
  isOpen: boolean;
  onClose: () => void;
}

const ContractViewModal = ({ contract, isOpen, onClose }: ContractViewModalProps) => {
  const [showDownloadModal, setShowDownloadModal] = useState(false);

  if (!contract) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'enviado':
        return <Badge className="bg-yellow-100 text-yellow-800">Enviado</Badge>;
      case 'assinado':
        return <Badge className="bg-green-100 text-green-800">Assinado</Badge>;
      case 'rascunho':
        return <Badge className="bg-gray-100 text-gray-800">Rascunho</Badge>;
      case 'expirado':
        return <Badge className="bg-red-100 text-red-800">Expirado</Badge>;
      case 'ativo':
        return <Badge className="bg-blue-100 text-blue-800">Ativo</Badge>;
      case 'finalizado':
        return <Badge className="bg-green-100 text-green-800">Finalizado</Badge>;
      case 'cancelado':
        return <Badge className="bg-red-100 text-red-800">Cancelado</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status || 'Desconhecido'}</Badge>;
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{contract.title}</span>
              <div className="flex items-center gap-2">
                {getStatusBadge(contract.status)}
                <Button
                  onClick={() => setShowDownloadModal(true)}
                  variant="default"
                  className="ml-2 px-3 py-1 text-sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
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
                    <User className="w-4 h-4 text-slate-600" />
                    <span className="text-sm">
                      <strong>Cliente:</strong> {contract.clients?.name || ''}
                    </span>
                  </div>
                  {contract.clients?.email && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">
                        <strong>Email:</strong> {contract.clients.email}
                      </span>
                    </div>
                  )}
                  {(contract.clients?.cpf_cnpj || contract.clients?.cnpj) && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">
                        <strong>CPF/CNPJ:</strong> {contract.clients?.cpf_cnpj || contract.clients?.cnpj || ''}
                      </span>
                    </div>
                  )}
                  {contract.clients?.address && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">
                        <strong>Endereço:</strong> {contract.clients.address}
                      </span>
                    </div>
                  )}
                  {contract.clients?.phone && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">
                        <strong>Telefone:</strong> {contract.clients.phone}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-slate-600" />
                    <span className="text-sm">
                      <strong>Criado em:</strong> {new Date(contract.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  {contract.due_date && (
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-slate-600" />
                      <span className="text-sm">
                        <strong>Vencimento:</strong> {new Date(contract.due_date).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  )}
                  {contract.total_value && (
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-slate-600" />
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
                <div className="prose max-w-none">
                  <div className="whitespace-pre-wrap text-sm bg-slate-50 p-4 rounded-lg border">
                    {contract.content}
                  </div>
                </div>
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">
                    <strong>💡 Dica:</strong> Use o botão "Download" para obter uma versão profissional deste contrato, 
                    formatada conforme padrões jurídicos brasileiros. Disponível em múltiplos formatos.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      <DownloadModal
        contract={contract}
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
      />
    </>
  );
};

export default ContractViewModal;
