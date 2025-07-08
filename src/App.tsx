import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { SubscriptionProvider } from "@/hooks/useSubscription";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Contracts from "./pages/Contracts";
import NewContract from "./pages/NewContract";
import Clients from "./pages/Clients";
import Features from "./pages/Features";
import Reports from "./pages/Reports";
import Admin from "./pages/Admin";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

// Configuração otimizada do QueryClient para performance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Dados considerados frescos por 5 minutos
      staleTime: 5 * 60 * 1000,
      // Cache mantido por 10 minutos
      gcTime: 10 * 60 * 1000,
      // Retry apenas 1 vez em caso de erro
      retry: 1,
      // Refetch apenas quando a janela ganha foco
      refetchOnWindowFocus: false,
      // Refetch apenas quando reconecta
      refetchOnReconnect: true,
    },
    mutations: {
      // Retry apenas 1 vez para mutations
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <SubscriptionProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Rotas públicas sem Layout */}
              <Route path="/" element={<Landing />} />
              <Route path="/landing" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              {/* Rotas protegidas com Layout */}
              <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/contracts" element={<Contracts />} />
                <Route path="/contracts/new" element={<NewContract />} />
                <Route path="/new-contract" element={<NewContract />} />
                <Route path="/clients" element={<Clients />} />
                <Route path="/features" element={<Features />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
              {/* NotFound sem Layout */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </SubscriptionProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
