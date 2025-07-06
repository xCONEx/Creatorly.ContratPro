import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface ContractUserInfoProps {
  userData: {
    user_name: string;
    user_email: string;
    user_cnpj: string;
    user_address: string;
    user_phone: string;
  };
  onUserDataChange: (field: string, value: string) => void;
  isEditable?: boolean;
  isLoading?: boolean;
}

const ContractUserInfo = ({ userData, onUserDataChange, isEditable = false, isLoading = false }: ContractUserInfoProps) => {
  const handleChange = (field: string, value: string) => {
    onUserDataChange(field, value);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Dados da Empresa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Carregando dados da empresa...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dados da Empresa</CardTitle>
        <CardDescription>
          Dados carregados automaticamente do seu perfil
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="user_name">Nome da Empresa</Label>
            {isEditable ? (
              <Input
                id="user_name"
                value={userData.user_name}
                onChange={(e) => handleChange('user_name', e.target.value)}
                placeholder="Nome da sua empresa"
              />
            ) : (
              <div className="p-2 bg-gray-50 rounded border">
                {userData.user_name || 'Não informado'}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="user_email">Email</Label>
            {isEditable ? (
              <Input
                id="user_email"
                type="email"
                value={userData.user_email}
                onChange={(e) => handleChange('user_email', e.target.value)}
                placeholder="email@empresa.com"
              />
            ) : (
              <div className="p-2 bg-gray-50 rounded border">
                {userData.user_email || 'Não informado'}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="user_cnpj">CNPJ</Label>
            {isEditable ? (
              <Input
                id="user_cnpj"
                value={userData.user_cnpj}
                onChange={(e) => handleChange('user_cnpj', e.target.value)}
                placeholder="00.000.000/0001-00"
              />
            ) : (
              <div className="p-2 bg-gray-50 rounded border">
                {userData.user_cnpj || 'Não informado'}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="user_phone">Telefone</Label>
            {isEditable ? (
              <Input
                id="user_phone"
                value={userData.user_phone}
                onChange={(e) => handleChange('user_phone', e.target.value)}
                placeholder="(11) 99999-9999"
              />
            ) : (
              <div className="p-2 bg-gray-50 rounded border">
                {userData.user_phone || 'Não informado'}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="user_address">Endereço</Label>
          {isEditable ? (
            <Textarea
              id="user_address"
              value={userData.user_address}
              onChange={(e) => handleChange('user_address', e.target.value)}
              placeholder="Rua, número, bairro, cidade - Estado, CEP"
              rows={2}
            />
          ) : (
            <div className="p-2 bg-gray-50 rounded border">
              {userData.user_address || 'Não informado'}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ContractUserInfo; 