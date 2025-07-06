import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
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
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/landing" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/contracts" element={
              <ProtectedRoute>
                <Layout>
                  <Contracts />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/contracts/new" element={
              <ProtectedRoute>
                <Layout>
                  <NewContract />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/new-contract" element={
              <ProtectedRoute>
                <Layout>
                  <NewContract />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/clients" element={
              <ProtectedRoute>
                <Layout>
                  <Clients />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/features" element={
              <ProtectedRoute>
                <Layout>
                  <Features />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/reports" element={
              <ProtectedRoute>
                <Layout>
                  <Reports />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute>
                <Layout>
                  <Admin />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <Layout>
                  <Settings />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
