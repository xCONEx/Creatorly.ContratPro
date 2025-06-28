
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Plus, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { usePlanFeatures } from '@/hooks/usePlanFeatures';
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
  const { hasFeature } = usePlanFeatures();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const defaultTemplates: Template[] = [
    {
      id: 'audiovisual-1',
      name: 'Produção Audiovisual',
      category: 'audiovisual',
      is_premium: false,
      content: `OBJETO: O CONTRATADO compromete-se a prestar serviços de produção audiovisual, incluindo:

a) Pré-produção: Desenvolvimento de roteiro, planejamento de filmagem, definição de locações e cronograma;
b) Produção: Captação de imagens e áudio conforme briefing estabelecido;
c) Pós-produção: Edição, correção de cor, mixagem de áudio e finalização do material;
d) Entrega: Disponibilização do material finalizado nos formatos acordados.

ESPECIFICAÇÕES TÉCNICAS:
- Resolução mínima: Full HD (1920x1080)
- Formatos de entrega: MP4, MOV ou conforme especificado
- Prazo de entrega: Conforme cronograma anexo

DIREITOS AUTORAIS:
Os direitos de uso do material produzido serão transferidos ao CONTRATANTE mediante pagamento integral dos valores acordados.`
    },
    {
      id: 'video-editing-1',
      name: 'Edição de Vídeo',
      category: 'audiovisual',
      is_premium: false,
      content: `OBJETO: O CONTRATADO compromete-se a prestar serviços de edição de vídeo, incluindo:

a) Recebimento e organização do material bruto fornecido pelo CONTRATANTE;
b) Edição e montagem conforme briefing e referências fornecidas;
c) Aplicação de efeitos visuais, transições e motion graphics quando aplicável;
d) Correção de cor e tratamento de áudio;
e) Entrega do material finalizado nos formatos solicitados.

MATERIAIS NECESSÁRIOS:
O CONTRATANTE deverá fornecer todo material bruto, logos, músicas licenciadas e demais elementos necessários para a edição.

REVISÕES:
Estão incluídas até 3 (três) rodadas de revisão no valor acordado. Revisões adicionais serão cobradas separadamente.

PRAZO DE ENTREGA:
O material será entregue em até [X] dias úteis após recebimento de todo material necessário e briefing completo.`
    },
    {
      id: 'marketing-digital-1',
      name: 'Marketing Digital',
      category: 'marketing',
      is_premium: true,
      content: `OBJETO: O CONTRATADO compromete-se a prestar serviços de marketing digital, incluindo:

a) Estratégia Digital: Desenvolvimento de estratégia personalizada para o negócio do CONTRATANTE;
b) Gestão de Redes Sociais: Criação de conteúdo, programação de posts e engajamento;
c) Campanhas de Tráfego Pago: Criação e gestão de campanhas no Google Ads e Facebook Ads;
d) Análise e Relatórios: Monitoramento de métricas e entrega de relatórios mensais;
e) SEO: Otimização para mecanismos de busca quando aplicável.

INVESTIMENTO EM MÍDIA:
Os valores de investimento em mídia paga (Google Ads, Facebook Ads, etc.) são de responsabilidade do CONTRATANTE e não estão inclusos no valor dos serviços.

ACESSO E PERMISSÕES:
O CONTRATANTE deverá fornecer acessos necessários às plataformas digitais (redes sociais, Google Analytics, etc.).

METAS E KPIS:
Serão estabelecidas metas específicas e KPIs a serem acompanhados mensalmente, conforme anexo técnico.`
    },
    {
      id: 'content-creation-1',
      name: 'Criação de Conteúdo',
      category: 'conteudo',
      is_premium: true,
      content: `OBJETO: O CONTRATADO compromete-se a prestar serviços de criação de conteúdo, incluindo:

a) Planejamento Editorial: Desenvolvimento de calendário editorial mensal;
b) Criação de Conteúdo Textual: Posts para redes sociais, artigos para blog e newsletters;
c) Conteúdo Visual: Criação de artes gráficas, infográficos e imagens para posts;
d) Conteúdo em Vídeo: Roteirização e produção de vídeos curtos para redes sociais;
e) Copywriting: Textos persuasivos para campanhas e landing pages.

APROVAÇÃO DE CONTEÚDO:
Todo conteúdo será submetido à aprovação do CONTRATANTE antes da publicação.

DIRETRIZES DE MARCA:
O CONTRATADO seguirá o manual de marca e tom de voz fornecido pelo CONTRATANTE.

PROPRIEDADE INTELECTUAL:
Todo conteúdo criado será de propriedade do CONTRATANTE após pagamento integral dos valores acordados.

QUANTIDADE DE PEÇAS:
Serão produzidas [X] peças de conteúdo por mês, conforme especificado no cronograma anexo.`
    }
  ];

  useEffect(() => {
    fetchTemplates();
  }, [user]);

  const fetchTemplates = async () => {
    try {
      // Buscar templates personalizados do usuário
      let userTemplates: Template[] = [];
      if (user) {
        const { data, error } = await supabase
          .from('contract_templates')
          .select('*')
          .eq('user_id', user.id);

        if (error) throw error;
        userTemplates = data || [];
      }

      // Combinar templates padrão com templates do usuário
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
    if (template.is_premium && !hasFeature('premiumTemplates')) {
      toast({
        title: "Recurso Premium",
        description: "Este template está disponível apenas para planos Professional e Empresarial",
        variant: "destructive",
      });
      return;
    }
    onSelect(template);
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

      {hasFeature('customTemplates') && (
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
