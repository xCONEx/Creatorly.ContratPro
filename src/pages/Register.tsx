
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, Mail, Lock, User, FileText, Check } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const getPasswordStrength = (password: string) => {
    if (password.length < 6) return { level: 0, text: 'Muito fraca' };
    if (password.length < 8) return { level: 1, text: 'Fraca' };
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) return { level: 2, text: 'Média' };
    return { level: 3, text: 'Forte' };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem",
        variant: "destructive",
      });
      return;
    }

    if (!acceptTerms) {
      toast({
        title: "Erro",
        description: "Você deve aceitar os termos de uso",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    // Simular registro
    setTimeout(() => {
      localStorage.setItem('user', JSON.stringify({ 
        email: formData.email,
        name: formData.name,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.email}`,
        plan: 'Trial',
        joinDate: new Date().toISOString()
      }));
      
      toast({
        title: "Conta criada com sucesso!",
        description: "Bem-vindo ao ContratPro",
      });
      
      navigate('/dashboard');
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left side - Features */}
        <div className="hidden lg:block space-y-8">
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ContratPro
              </h1>
            </div>
            <p className="text-xl text-slate-600 font-medium">
              Comece gratuitamente e revolucione seus contratos
            </p>
          </div>

          <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-semibold text-slate-800">✨ Incluso no plano gratuito:</h3>
            
            <div className="space-y-3 text-slate-600">
              <div className="flex items-center space-x-3">
                <Check className="w-5 h-5 text-green-600" />
                <span>5 contratos por mês</span>
              </div>
              <div className="flex items-center space-x-3">
                <Check className="w-5 h-5 text-green-600" />
                <span>Templates pré-definidos</span>
              </div>
              <div className="flex items-center space-x-3">
                <Check className="w-5 h-5 text-green-600" />
                <span>Assinatura digital básica</span>
              </div>
              <div className="flex items-center space-x-3">
                <Check className="w-5 h-5 text-green-600" />
                <span>Suporte por email</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Register Form */}
        <Card className="w-full max-w-md mx-auto shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-4 text-center">
            <div className="lg:hidden flex items-center justify-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ContratPro
              </h1>
            </div>
            <CardTitle className="text-2xl font-bold text-slate-800">Criar conta</CardTitle>
            <CardDescription className="text-slate-600">
              Comece gratuitamente em menos de 2 minutos
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-700">Nome completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Seu nome completo"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="pl-10 h-12 border-slate-200 focus:border-blue-500 transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-10 h-12 border-slate-200 focus:border-blue-500 transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pl-10 pr-10 h-12 border-slate-200 focus:border-blue-500 transition-colors"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                
                {formData.password && (
                  <div className="space-y-2">
                    <div className="flex space-x-1">
                      {[0, 1, 2, 3].map((level) => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded ${
                            level <= passwordStrength.level
                              ? level < 2 ? 'bg-red-500' : level < 3 ? 'bg-yellow-500' : 'bg-green-500'
                              : 'bg-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-slate-600">Força da senha: {passwordStrength.text}</p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-slate-700">Confirmar senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="pl-10 pr-10 h-12 border-slate-200 focus:border-blue-500 transition-colors"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <label className="flex items-start space-x-3 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="rounded border-slate-300 mt-0.5 flex-shrink-0"
                />
                <span>
                  Concordo com os{' '}
                  <Link to="/terms" className="text-blue-600 hover:text-blue-700">
                    termos de uso
                  </Link>{' '}
                  e{' '}
                  <Link to="/privacy" className="text-blue-600 hover:text-blue-700">
                    política de privacidade
                  </Link>
                </span>
              </label>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold transition-all duration-200 transform hover:scale-[1.02]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Criando conta...</span>
                  </div>
                ) : (
                  'Criar conta grátis'
                )}
              </Button>

              <div className="text-center text-slate-600">
                Já tem uma conta?{' '}
                <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">
                  Fazer login
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;
