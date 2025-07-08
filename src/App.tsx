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
              <Route element={<Layout />}>
                <Route path="/" element={<Landing />} />
                <Route path="/landing" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/contracts" element={<ProtectedRoute><Contracts /></ProtectedRoute>} />
                <Route path="/contracts/new" element={<ProtectedRoute><NewContract /></ProtectedRoute>} />
                <Route path="/new-contract" element={<ProtectedRoute><NewContract /></ProtectedRoute>} />
                <Route path="/clients" element={<ProtectedRoute><Clients /></ProtectedRoute>} />
                <Route path="/features" element={<ProtectedRoute><Features /></ProtectedRoute>} />
                <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
                <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </SubscriptionProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
