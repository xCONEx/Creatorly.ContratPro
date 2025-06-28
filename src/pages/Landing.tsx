
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  FileText, 
  Shield, 
  Zap, 
  Users, 
  CheckCircle, 
  Star,
  ArrowRight,
  Play,
  Award,
  Clock,
  Globe
} from 'lucide-react';

const Landing = () => {
  const features = [
    {
      icon: FileText,
      title: "Contratos Inteligentes",
      description: "Modelos personalizáveis com variáveis dinâmicas e automação completa"
    },
    {
      icon: Shield,
      title: "Assinatura Digital Certificada",
      description: "Validade jurídica com certificado digital ICP-Brasil"
    },
    {
      icon: Zap,
      title: "Automação Completa",
      description: "Workflow automatizado da criação à assinatura"
    },
    {
      icon: Users,
      title: "Gestão de Clientes",
      description: "Cadastro completo com tags personalizadas e histórico"
    }
  ];

  const plans = [
    {
      name: "Starter",
      price: "R$ 97",
      period: "/mês",
      description: "Perfeito para freelancers e pequenos negócios",
      features: [
        "10 contratos por mês",
        "3 templates básicos",
        "Assinatura digital",
        "Suporte por email"
      ],
      popular: false
    },
    {
      name: "Professional",
      price: "R$ 297",
      period: "/mês",
      description: "Ideal para empresas em crescimento",
      features: [
        "100 contratos por mês",
        "Templates ilimitados",
        "API completa",
        "Relatórios avançados",
        "Suporte prioritário",
        "Integrações personalizadas"
      ],
      popular: true
    },
    {
      name: "Enterprise",
      price: "R$ 697",
      period: "/mês",
      description: "Para grandes empresas e corporações",
      features: [
        "Contratos ilimitados",
        "White label",
        "Múltiplos usuários",
        "Consultoria técnica",
        "SLA garantido",
        "Desenvolvimento customizado"
      ],
      popular: false
    }
  ];

  const testimonials = [
    {
      name: "Maria Silva",
      role: "CEO, TechStart",
      content: "Revolucionou nossa gestão de contratos. Economizamos 80% do tempo na criação e assinatura.",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150"
    },
    {
      name: "João Santos",
      role: "Advogado",
      content: "A validade jurídica é impecável. Uso em todos os meus casos e nunca tive problemas.",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150"
    },
    {
      name: "Ana Costa",
      role: "Consultora",
      content: "Interface intuitiva e recursos poderosos. Recomendo para qualquer profissional.",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold gradient-text">
                ContratPro
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link to="/login">
                <Button variant="ghost" className="text-slate-700 hover:text-primary">Entrar</Button>
              </Link>
              <Link to="/register">
                <Button className="gradient-primary text-white hover:opacity-90">
                  Começar Grátis
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
              Contratos Inteligentes e 
              <span className="gradient-text">
                {" "}Assinatura Digital
              </span>
            </h1>
            <p className="text-xl text-slate-600 mb-8 leading-relaxed">
              Plataforma profissional para criação, gestão e assinatura de contratos com validade jurídica. 
              Automatize seu workflow e economize até 90% do tempo.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link to="/register">
                <Button size="lg" className="gradient-primary text-white text-lg px-8 py-6 hover:opacity-90">
                  Começar Gratuitamente
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="text-lg px-8 py-6 border-slate-300 text-slate-700 hover:bg-slate-50">
                <Play className="w-5 h-5 mr-2" />
                Ver Demonstração
              </Button>
            </div>

            <div className="flex items-center justify-center space-x-8 text-sm text-slate-600">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-success" />
                <span>Teste grátis por 14 dias</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-success" />
                <span>Sem cartão de crédito</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-success" />
                <span>Suporte 24/7</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Recursos Poderosos para seu Negócio
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Tudo que você precisa para modernizar sua gestão de contratos
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-xl transition-all duration-300 border-slate-200 shadow-lg bg-white">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-primary/20 to-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl text-slate-900">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-slate-600">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6 gradient-primary text-white">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">50k+</div>
              <div className="text-white/80">Contratos Criados</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">2.5k+</div>
              <div className="text-white/80">Empresas Ativas</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">90%</div>
              <div className="text-white/80">Economia de Tempo</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">99.9%</div>
              <div className="text-white/80">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Planos que Crescem com seu Negócio
            </h2>
            <p className="text-xl text-slate-600">
              Escolha o plano ideal para suas necessidades
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <Card 
                key={index} 
                className={`relative hover:shadow-2xl transition-all duration-300 bg-white ${
                  plan.popular ? 'border-2 border-primary shadow-xl scale-105' : 'border border-slate-200 shadow-lg'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="gradient-secondary text-white px-4 py-2 rounded-full text-sm font-medium">
                      Mais Popular
                    </div>
                  </div>
                )}
                
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl text-slate-900">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                    <span className="text-slate-600">{plan.period}</span>
                  </div>
                  <CardDescription className="mt-2 text-slate-600">{plan.description}</CardDescription>
                </CardHeader>
                
                <CardContent>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                        <span className="text-slate-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Link to="/register">
                    <Button 
                      className={`w-full ${
                        plan.popular 
                          ? 'gradient-primary text-white hover:opacity-90' 
                          : 'bg-slate-900 hover:bg-slate-800 text-white'
                      }`}
                      size="lg"
                    >
                      Começar Agora
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              O que nossos clientes dizem
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow bg-white border-slate-200">
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-warning text-warning" />
                    ))}
                  </div>
                  <p className="text-slate-600 italic mb-6">"{testimonial.content}"</p>
                  <div className="flex items-center space-x-3">
                    <img 
                      src={testimonial.avatar} 
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-semibold text-slate-900">{testimonial.name}</div>
                      <div className="text-sm text-slate-600">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 gradient-primary text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">
            Pronto para Revolucionar seus Contratos?
          </h2>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Junte-se a milhares de empresas que já transformaram sua gestão de contratos
          </p>
          <Link to="/register">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6 bg-white text-primary hover:bg-slate-50">
              Começar Gratuitamente
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 px-6">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-bold">ContratPro</span>
              </div>
              <p className="text-slate-400">
                Contratos inteligentes e assinatura digital profissional.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Produto</h4>
              <ul className="space-y-2 text-slate-400">
                <li>Recursos</li>
                <li>Preços</li>
                <li>Integrações</li>
                <li>API</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-slate-400">
                <li>Sobre</li>
                <li>Blog</li>
                <li>Carreiras</li>
                <li>Contato</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Suporte</h4>
              <ul className="space-y-2 text-slate-400">
                <li>Central de Ajuda</li>
                <li>Documentação</li>
                <li>Status</li>
                <li>Segurança</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-700 mt-12 pt-8 text-center text-slate-400">
            <p>&copy; 2024 ContratPro. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
