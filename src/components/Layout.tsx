import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAutoSync } from '@/hooks/useAutoSync';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Usar o novo hook de sincronização automática
  const { syncData, isSyncing, lastSync } = useAutoSync();

  const handleManualSync = async () => {
    console.log('Sincronização manual iniciada');
    try {
      const result = await syncData();
      console.log('Resultado da sincronização:', result);
    } catch (error) {
      console.error('Erro na sincronização manual:', error);
    }
  };

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
          
          {/* Botão de sincronização manual */}
          <div className="fixed bottom-4 right-4">
            <Button 
              onClick={handleManualSync}
              disabled={isSyncing}
              className="shadow-lg text-sm px-3 py-2"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
            </Button>
          </div>
          
          {/* Indicador de última sincronização */}
          {lastSync && (
            <div className="fixed bottom-4 left-4 text-xs text-gray-500 bg-white px-2 py-1 rounded shadow">
              Última sincronização: {lastSync.toLocaleTimeString('pt-BR')}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Layout;
