
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Mail, Phone, MapPin, FileText, Calendar, DollarSign, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  cpf_cnpj?: string;
  tags?: string[];
  created_at: string;
}

interface Contract {
  id: string;
  title: string;
  status: string;
  created_at: string;
  total_value?: number;
  due_date?: string;
}

interface ClientDetailModalProps {
  client: Client | null;
  isOpen: boolean;
  onClose: () => void;
}

const ClientDetailModal = ({ client, isOpen, onClose }: ClientDetailModalProps) => {
  const { user } = useAuth();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (client && user && isOpen) {
      fetchClientContracts();
    }
  }, [client, user, isOpen]);

  const fetchClientContracts = async () => {
    if (!client || !user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('contracts')
        .select('id, title, status, created_at, total_value, due_date')
        .eq('client_id', client.id)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContracts(data || []);
    } catch (error) {
      console.error('Error fetching client contracts:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar contratos do cliente",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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

  if (!client) return null;

  const totalValue = contracts.reduce((sum, contract) => sum + (contract.total_value || 0), 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <User className="w-5 h-5 mr-2" />
            {client.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações do Cliente */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações do Cliente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {client.email && (
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                    <span className="text-sm">{client.email}</span>
                  </div>
                )}
                {client.phone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                    <span className="text-sm">{client.phone}</span>
                  </div>
                )}
                {client.cpf_cnpj && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">
                      <strong>CPF/CNPJ:</strong> {client.cpf_cnpj}
                    </span>
                  </div>
                )}
                {client.address && (
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                    <span className="text-sm">{client.address}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  <span className="text-sm">
                    <strong>Cliente desde:</strong> {new Date(client.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>

              {/* Tags */}
              {client.tags && client.tags.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Tags:</p>
                  <div className="flex flex-wrap gap-2">
                    {client.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Resumo de Contratos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold">{contracts.length}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Contratos</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Valor Total</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-2xl font-bold">
                      {contracts.filter(c => c.status === 'signed' || c.status === 'approved').length}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Aprovados</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lista de Contratos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contratos do Cliente</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : contracts.length > 0 ? (
                <div className="space-y-3">
                  {contracts.map((contract) => (
                    <div key={contract.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg gap-2">
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <h4 className="font-medium">{contract.title}</h4>
                          {getStatusBadge(contract.status)}
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center text-sm text-slate-600 dark:text-slate-400 gap-1 sm:gap-4 mt-1">
                          <span>{new Date(contract.created_at).toLocaleDateString('pt-BR')}</span>
                          {contract.total_value && (
                            <>
                              <span className="hidden sm:inline">•</span>
                              <span>R$ {Number(contract.total_value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                            </>
                          )}
                          {contract.due_date && (
                            <>
                              <span className="hidden sm:inline">•</span>
                              <span>Vence em {new Date(contract.due_date).toLocaleDateString('pt-BR')}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 sm:mr-2" />
                        <span className="hidden sm:inline">Ver Contrato</span>
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <p className="text-slate-600 dark:text-slate-400">
                    Nenhum contrato encontrado para este cliente.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ClientDetailModal;
