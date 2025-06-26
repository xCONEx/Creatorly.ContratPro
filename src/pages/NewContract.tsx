
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import ContractForm from '@/components/contract/ContractForm';

const NewContract = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/contracts">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Novo Contrato</h1>
            <p className="text-slate-600">Crie um novo contrato para seus clientes</p>
          </div>
        </div>
      </div>

      <ContractForm />
    </div>
  );
};

export default NewContract;
