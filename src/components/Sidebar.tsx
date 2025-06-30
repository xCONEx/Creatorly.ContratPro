
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FileText, Users, BarChart3, Settings, X, Plus, Home, Shield, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const location = useLocation();
  const { user } = useAuth();
  
  // Verificar se é admin pelo email
  const isAdmin = user?.email === 'yuriadrskt@gmail.com';

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: FileText, label: 'Contratos', path: '/contracts' },
    { icon: Plus, label: 'Novo Contrato', path: '/contracts/new' },
    { icon: Users, label: 'Clientes', path: '/clients' },
    { icon: Zap, label: 'Recursos', path: '/features' },
    { icon: BarChart3, label: 'Relatórios', path: '/reports' },
    { icon: Settings, label: 'Configurações', path: '/settings' },
  ];

  // Adicionar item admin se for administrador
  if (isAdmin) {
    menuItems.splice(-1, 0, { icon: Shield, label: 'Painel Admin', path: '/admin' });
  }

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div
        className={cn(
          "fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out z-50",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0 lg:static lg:z-auto"
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ContratPro
            </h1>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="lg:hidden"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors",
                location.pathname === item.path && "bg-blue-50 text-blue-600 border border-blue-200"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
