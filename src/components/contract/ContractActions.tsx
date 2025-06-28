
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, Send, Eye, Edit, Download, Trash2 } from 'lucide-react';

interface ContractActionsProps {
  isLoading: boolean;
  isFormValid: boolean;
  onSaveDraft: (e: React.FormEvent) => void;
  onSendToClient: (e: React.FormEvent) => void;
  onView?: () => void;
  onEdit?: () => void;
  onDownload?: () => void;
  onDelete?: () => void;
  showAllActions?: boolean;
}

const ContractActions = ({ 
  isLoading, 
  isFormValid, 
  onSaveDraft, 
  onSendToClient,
  onView,
  onEdit,
  onDownload,
  onDelete,
  showAllActions = false
}: ContractActionsProps) => {
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

        {showAllActions && (
          <>
            <div className="border-t border-slate-200 my-3 pt-3">
              <p className="text-sm text-slate-600 mb-3">Outras ações:</p>
              
              <div className="space-y-2">
                {onView && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={onView}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Visualizar
                  </Button>
                )}

                {onEdit && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={onEdit}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                )}

                {onDownload && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={onDownload}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Baixar PDF
                  </Button>
                )}

                {onDelete && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={onDelete}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Excluir
                  </Button>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ContractActions;
