
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ContractTips = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Dicas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-slate-600">
        <div>
          <p className="font-medium">📝 Use variáveis</p>
          <p>Nome do cliente, data atual, valor total</p>
        </div>
        <div>
          <p className="font-medium">📋 Templates</p>
          <p>Use nossos templates pré-definidos para agilizar</p>
        </div>
        <div>
          <p className="font-medium">📄 Upload</p>
          <p>Carregue contratos existentes em .txt ou .doc</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContractTips;
