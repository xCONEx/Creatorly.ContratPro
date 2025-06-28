
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Plus, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { toast } from '@/hooks/use-toast';

interface Template {
  id: string;
  name: string;
  category: string;
  content: string;
  is_premium: boolean;
  created_by?: string;
}

interface TemplateSelectorProps {
  onSelect: (template: Template) => void;
  onClose: () => void;
}

const TemplateSelector = ({ onSelect, onClose }: TemplateSelectorProps) => {
  const { user } = useAuth();
  const { subscription } = useSubscription();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const defaultTemplates: Template[] = [
    {
      id: 'audiovisual-1',
      name: 'Produção Audiovisual',
      category: 'audiovisual',
      is_premium: false,
      content: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE PRODUÇÃO AUDIOVISUAL

CLÁUSULA PRIMEIRA – DO OBJETO
O CONTRATADO compromete-se a prestar serviços de produção audiovisual, incluindo:
a) Pré-produção: Desenvolvimento de roteiro, planejamento de filmagem, definição de locações;
b) Produção: Captação de imagens e áudio conforme briefing estabelecido;
c) Pós-produção: Edição, correção de cor, mixagem de áudio e finalização;
d) Entrega: Material finalizado nos formatos acordados.

CLÁUSULA SEGUNDA – DAS ESPECIFICAÇÕES TÉCNICAS
- Resolução mínima: Full HD (1920x1080)
- Formatos de entrega: MP4, MOV ou conforme especificado
- Duração: Conforme briefing aprovado

CLÁUSULA TERCEIRA – DOS DIREITOS AUTORAIS
Os direitos de uso do material produzido serão transferidos ao CONTRATANTE mediante pagamento integral.

CLÁUSULA QUARTA – DO PRAZO
O prazo para entrega será de [X] dias úteis após aprovação do briefing final.`
    },
    {
      id: 'video-editing-1',
      name: 'Edição de Vídeo',
      category: 'audiovisual',
      is_premium: false,
      content: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE EDIÇÃO DE VÍDEO

CLÁUSULA PRIMEIRA – DO OBJETO
O CONTRATADO compromete-se a prestar serviços de edição de vídeo, incluindo:
a) Recebimento e organização do material bruto;
b) Edição e montagem conforme briefing;
c) Aplicação de efeitos visuais e transições;
d) Correção de cor e tratamento de áudio;
e) Entrega nos formatos solicitados.

CLÁUSULA SEGUNDA – DOS MATERIAIS
O CONTRATANTE fornecerá todo material bruto, logos, músicas licenciadas e elementos necessários.

CLÁUSULA TERCEIRA – DAS REVISÕES
Estão incluídas até 3 (três) rodadas de revisão. Revisões adicionais serão cobradas separadamente.

CLÁUSULA QUARTA – DO PRAZO
Material será entregue em até [X] dias úteis após recebimento completo dos materiais.`
    },
    {
      id: 'marketing-digital-1',
      name: 'Marketing Digital',
      category: 'marketing',
      is_premium: true,
      content: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE MARKETING DIGITAL

CLÁUSULA PRIMEIRA – DO OBJETO
O CONTRATADO prestará serviços de marketing digital, incluindo:
a) Estratégia digital personalizada;
b) Gestão de redes sociais e criação de conteúdo;
c) Campanhas de tráfego pago (Google Ads, Facebook Ads);
d) Análise de métricas e relatórios mensais;
e) SEO e otimização para mecanismos de busca.

CLÁUSULA SEGUNDA – DO INVESTIMENTO EM MÍDIA
Valores de investimento em mídia paga são de responsabilidade do CONTRATANTE.

CLÁUSULA TERCEIRA – DOS ACESSOS
O CONTRATANTE fornecerá acessos necessários às plataformas digitais.

CLÁUSULA QUARTA – DAS METAS
Serão estabelecidas metas específicas e KPIs conforme anexo técnico.`
    },
    {
      id: 'content-creation-1',
      name: 'Criação de Conteúdo',
      category: 'conteudo',
      is_premium: true,
      content: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE CRIAÇÃO DE CONTEÚDO

CLÁUSULA PRIMEIRA – DO OBJETO
O CONTRATADO prestará serviços de criação de conteúdo, incluindo:
a) Planejamento editorial mensal;
b) Criação de conteúdo textual para redes sociais;
c) Desenvolvimento de artes gráficas e infográficos;
d) Produção de vídeos curtos para redes sociais;
e) Copywriting para campanhas e landing pages.

CLÁUSULA SEGUNDA – DA APROVAÇÃO
Todo conteúdo será submetido à aprovação antes da publicação.

CLÁUSULA TERCEIRA – DAS DIRETRIZES
Seguirá manual de marca e tom de voz fornecido pelo CONTRATANTE.

CLÁUSULA QUARTA – DA PROPRIEDADE
Todo conteúdo criado será propriedade do CONTRATANTE após pagamento integral.`
    }
  ];

  useEffect(() => {
    fetchTemplates();
  }, [user]);

  const fetchTemplates = async () => {
    try {
      let userTemplates: Template[] = [];
      if (user) {
        // Simplified query without complex type inference
        const { data: rawData, error } = await supabase
          .from('contract_templates')
          .select('id, name, category, content')
          .eq('user_id', user.id);

        if (error) throw error;
        
        if (rawData) {
          userTemplates = rawData.map((item) => ({
            id: item.id,
            name: item.name,
            category: item.category,
            content: item.content,
            is_premium: false,
            created_by: user.id
          }));
        }
      }

      const allTemplates = [...defaultTemplates, ...userTemplates];
      setTemplates(allTemplates);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar templates",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 'all', name: 'Todos' },
    { id: 'audiovisual', name: 'Audiovisual' },
    { id: 'marketing', name: 'Marketing' },
    { id: 'conteudo', name: 'Conteúdo' },
    { id: 'custom', name: 'Meus Templates' }
  ];

  const filteredTemplates = templates.filter(template => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'custom') return !!template.created_by;
    return template.category === selectedCategory;
  });

  const handleSelectTemplate = (template: Template) => {
    const isFreePlan = subscription?.plan?.name === 'Gratuito' || !subscription;
    
    if (template.is_premium && isFreePlan) {
      toast({
        title: "Recurso Premium",
        description: "Este template está disponível apenas para planos Professional e Empresarial",
        variant: "destructive",
      });
      return;
    }
    onSelect(template);
  };

  const canCreateCustomTemplates = () => {
    const planName = subscription?.plan?.name;
    return planName === 'Profissional' || planName === 'Empresarial';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Escolher Template</h2>
        <Button onClick={onClose} variant="outline">
          Fechar
        </Button>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category.id)}
          >
            {category.name}
          </Button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map((template) => (
          <Card
            key={template.id}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleSelectTemplate(template)}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{template.name}</CardTitle>
                {template.is_premium && (
                  <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                    <Star className="w-3 h-3 mr-1" />
                    Premium
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 text-sm text-slate-600 mb-3">
                <FileText className="w-4 h-4" />
                <span className="capitalize">{template.category}</span>
              </div>
              <p className="text-sm text-slate-600 line-clamp-3">
                {template.content.substring(0, 150)}...
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {canCreateCustomTemplates() && (
        <Card className="border-dashed border-2 border-slate-300">
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <Plus className="w-12 h-12 text-slate-400 mb-4" />
            <h3 className="text-lg font-semibold text-slate-700 mb-2">
              Criar Template Personalizado
            </h3>
            <p className="text-slate-600 mb-4">
              Crie seus próprios templates para reutilizar em futuros contratos
            </p>
            <Button variant="outline">
              Criar Template
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TemplateSelector;
