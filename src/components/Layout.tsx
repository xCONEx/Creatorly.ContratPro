
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useFinanceFlowSync } from '@/hooks/useFinanceFlowSync';
import { Button } from '@/components/ui/button';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Inicializar sincronização com FinanceFlow
  const { isLoading } = useFinanceFlowSync();

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />
      
      <div className="flex-1 flex flex-col lg:ml-0">
        <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 overflow-auto p-6">
          {children}
          
          {/* Botão de teste para sincronização */}
          <div className="fixed bottom-4 right-4">
            <Button 
              onClick={() => {
                console.log('Manual sync triggered');
                // Forçar sincronização manual
                window.location.reload();
              }}
              disabled={isLoading}
            >
              {isLoading ? 'Sincronizando...' : 'Teste Sync'}
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
