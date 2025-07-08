import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAutoSync } from '@/hooks/useAutoSync';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  
  // Usar o novo hook de sincronização automática
  const { syncData } = useAutoSync();

  const handleManualSync = async () => {
    console.log('Sincronização manual iniciada');
    setIsSyncing(true);
    try {
      await syncData();
      setLastSync(new Date());
      console.log('Sincronização manual concluída');
    } catch (error) {
      console.error('Erro na sincronização manual:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar - Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            <Outlet />
          </div>
          
          {/* Floating Action Buttons - Mobile Optimized */}
          <div className="fixed bottom-4 right-4 z-30 flex flex-col gap-2">
            {/* Sync Button */}
            <Button 
              onClick={handleManualSync}
              disabled={isSyncing}
              className="shadow-lg bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 h-12 w-12 p-0 rounded-full"
              title="Sincronizar dados"
            >
              <RefreshCw className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
            </Button>
            
            {/* Last Sync Indicator - Only show on larger screens */}
            {lastSync && (
              <div className="hidden sm:block bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg text-xs text-gray-600 border border-gray-200">
                Última sincronização: {lastSync.toLocaleTimeString('pt-BR')}
              </div>
            )}
          </div>
          
          {/* Mobile Sync Indicator */}
          {lastSync && (
            <div className="sm:hidden fixed bottom-4 left-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs text-gray-600 border border-gray-200 shadow">
              {lastSync.toLocaleTimeString('pt-BR')}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Layout;
