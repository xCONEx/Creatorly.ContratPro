
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, Send, Eye, Edit, Download, Trash2, Check, X } from 'lucide-react';

interface ContractActionsProps {
  isLoading: boolean;
  isFormValid: boolean;
  onSaveDraft: (e: React.FormEvent) => void;
  onSendToClient: (e: React.FormEvent) => void;
  onView?: () => void;
  onEdit?: () => void;
  onDownload?: () => void;
  onDelete?: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  showAllActions?: boolean;
  contractStatus?: string;
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
  onApprove,
  onReject,
  showAllActions = false,
  contractStatus
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
          {isLoading ? 'Salvando...' : 'Salvar Contrato'}
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
            <div className="border-t border-slate-200 dark:border-slate-700 my-3 pt-3">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">Outras ações:</p>
              
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

                {contractStatus === 'sent' && (
                  <div className="flex gap-2">
                    {onApprove && (
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950"
                        onClick={onApprove}
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Aprovar
                      </Button>
                    )}
                    {onReject && (
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                        onClick={onReject}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Rejeitar
                      </Button>
                    )}
                  </div>
                )}

                {onDelete && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
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
