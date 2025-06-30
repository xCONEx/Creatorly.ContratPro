
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface Contract {
  id: string;
  title: string;
  content: string;
  status: string;
  created_at: string;
  total_value?: number;
  due_date?: string;
  client_id: string;
  clients?: {
    name: string;
    email?: string;
  };
}

interface Client {
  id: string;
  name: string;
  email?: string;
}

interface ContractEditModalProps {
  contract: Contract | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const ContractEditModal = ({ contract, isOpen, onClose, onUpdate }: ContractEditModalProps) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    client_id: '',
    total_value: '',
    due_date: ''
  });

  useEffect(() => {
    if (contract) {
      setFormData({
        title: contract.title,
        content: contract.content,
        client_id: contract.client_id,
        total_value: contract.total_value?.toString() || '',
        due_date: contract.due_date || ''
      });
    }
  }, [contract]);

  useEffect(() => {
    if (user && isOpen) {
      fetchClients();
    }
  }, [user, isOpen]);

  const fetchClients = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('clients')
        .select('id, name, email')
        .eq('user_id', user.id)
        .order('name');

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleClientChange = (value: string) => {
    setFormData(prev => ({ ...prev, client_id: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contract || !user) return;

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('contracts')
        .update({
          title: formData.title,
          content: formData.content,
          client_id: formData.client_id,
          total_value: formData.total_value ? parseFloat(formData.total_value) : null,
          due_date: formData.due_date || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', contract.id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Contrato atualizado!",
        description: "As alterações foram salvas com sucesso.",
      });

      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating contract:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar contrato",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!contract) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Contrato</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Título do contrato"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="client_id">Cliente *</Label>
            <Select value={formData.client_id} onValueChange={handleClientChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um cliente" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="total_value">Valor Total</Label>
              <Input
                id="total_value"
                name="total_value"
                type="number"
                step="0.01"
                value={formData.total_value}
                onChange={handleInputChange}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="due_date">Data de Vencimento</Label>
              <Input
                id="due_date"
                name="due_date"
                type="date"
                value={formData.due_date}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Conteúdo do Contrato *</Label>
            <Textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              placeholder="Digite o conteúdo do contrato..."
              className="min-h-32"
              required
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ContractEditModal;
