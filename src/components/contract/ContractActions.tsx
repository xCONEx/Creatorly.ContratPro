
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, Send } from 'lucide-react';

interface ContractActionsProps {
  isLoading: boolean;
  isFormValid: boolean;
  onSaveDraft: (e: React.FormEvent) => void;
  onSendToClient: (e: React.FormEvent) => void;
}

const ContractActions = ({ isLoading, isFormValid, onSaveDraft, onSendToClient }: ContractActionsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ações</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button
          type="submit"
          variant="outline"
          className="w-full"
          disabled={isLoading || !isFormValid}
          onClick={onSaveDraft}
        >
          <Save className="w-4 h-4 mr-2" />
          {isLoading ? 'Salvando...' : 'Salvar Rascunho'}
        </Button>

        <Button
          type="button"
          onClick={onSendToClient}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          disabled={isLoading || !isFormValid}
        >
          <Send className="w-4 h-4 mr-2" />
          {isLoading ? 'Enviando...' : 'Enviar para Cliente'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ContractActions;
