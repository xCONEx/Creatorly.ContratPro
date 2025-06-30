
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link } from 'react-router-dom';

interface Client {
  id: string;
  name: string;
  email?: string;
}

interface ContractBasicInfoProps {
  formData: {
    title: string;
    client_id: string;
    total_value: string;
    due_date: string;
  };
  clients: Client[];
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClientChange: (value: string) => void;
}

const ContractBasicInfo = ({ formData, clients, onInputChange, onClientChange }: ContractBasicInfoProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Informações do Contrato</CardTitle>
        <CardDescription>
          Preencha os dados básicos do contrato
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Título do Contrato *</Label>
          <Input
            id="title"
            name="title"
            value={formData.title}
            onChange={onInputChange}
            placeholder="Ex: Contrato de Prestação de Serviços"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="client_id">Cliente *</Label>
          <Select
            value={formData.client_id}
            onValueChange={onClientChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione um cliente" />
            </SelectTrigger>
            <SelectContent>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name} {client.email && `(${client.email})`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {clients.length === 0 && (
            <p className="text-sm text-slate-500">
              <Link to="/clients" className="text-blue-600 hover:text-blue-700">
                Cadastre um cliente primeiro
              </Link>
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="total_value">Valor Total</Label>
            <Input
              id="total_value"
              name="total_value"
              type="number"
              step="0.01"
              min="0"
              value={formData.total_value}
              onChange={onInputChange}
              placeholder="0,00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="due_date">Data de Vencimento</Label>
            <Input
              id="due_date"
              name="due_date"
              type="date"
              value={formData.due_date}
              onChange={onInputChange}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContractBasicInfo;
