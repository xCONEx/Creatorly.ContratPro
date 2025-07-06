export interface ContractData {
  id: string;
  title: string;
  content: string;
  client_name: string;
  client_email?: string;
  client_cnpj?: string;
  client_address?: string;
  client_phone?: string;
  total_value?: number;
  due_date?: string;
  created_at: string;
  user_name?: string;
  user_email?: string;
  user_cnpj?: string;
  user_address?: string;
  user_phone?: string;
}

export const formatProfessionalContract = (contract: ContractData): string => {
  const currentDate = new Date().toLocaleDateString('pt-BR');
  const contractNumber = contract.id.slice(0, 8).toUpperCase();
  const createdDate = new Date(contract.created_at).toLocaleDateString('pt-BR');
  
  // Função para converter números em palavras por extenso (básica)
  const numberToWords = (value: number): string => {
    const units = ['', 'mil', 'milhão', 'bilhão'];
    const ones = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'];
    const tens = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
    const teens = ['dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];
    
    if (value === 0) return 'zero reais';
    
    const reais = Math.floor(value);
    const centavos = Math.round((value - reais) * 100);
    
    let result = '';
    
    if (reais >= 1000) {
      const thousands = Math.floor(reais / 1000);
      if (thousands === 1) {
        result += 'mil';
      } else {
        result += `${thousands} mil`;
      }
      
      const remainder = reais % 1000;
      if (remainder > 0) {
        if (remainder < 100) {
          result += ' e ';
        } else {
          result += ' ';
        }
        result += convertHundreds(remainder);
      }
    } else {
      result = convertHundreds(reais);
    }
    
    result += reais === 1 ? ' real' : ' reais';
    
    if (centavos > 0) {
      result += ' e ' + convertHundreds(centavos);
      result += centavos === 1 ? ' centavo' : ' centavos';
    }
    
    return result;
  };
  
  const convertHundreds = (num: number): string => {
    const ones = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'];
    const tens = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
    const teens = ['dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];
    const hundreds = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos'];
    
    if (num === 0) return '';
    if (num === 100) return 'cem';
    
    let result = '';
    
    const h = Math.floor(num / 100);
    const t = Math.floor((num % 100) / 10);
    const o = num % 10;
    
    if (h > 0) {
      result += hundreds[h];
      if (t > 0 || o > 0) result += ' e ';
    }
    
    if (t === 1) {
      result += teens[o];
    } else {
      if (t > 0) {
        result += tens[t];
        if (o > 0) result += ' e ';
      }
      if (o > 0) {
        result += ones[o];
      }
    }
    
    return result;
  };

  return `CONTRATO DE PRESTAÇÃO DE SERVIÇOS

Número: ${contractNumber}
Data: ${createdDate}

═══════════════════════════════════════════════════════════════════════════

QUALIFICAÇÃO DAS PARTES

CONTRATANTE:
${contract.client_name}
${contract.client_email ? `E-mail: ${contract.client_email}` : 'E-mail: [________________@_______.com]'}
CNPJ/CPF: ${contract.client_cnpj || '[___.___.___-__ / __.___.___.____/____-__]'}
Endereço: ${contract.client_address || '[Rua/Av., nº ___, Bairro]'}
Telefone: ${contract.client_phone || '[(__) _____-____]'}

CONTRATADO:
${contract.user_name || '[Nome da empresa/pessoa física]'}
CNPJ: ${contract.user_cnpj || '[___.___.___-__ / __.___.___.____/____-__]'}
Endereço: ${contract.user_address || '[Rua/Av., nº ___, Bairro]'}
Cidade: [________], [Estado], CEP: [_____-___]
Telefone: ${contract.user_phone || '[(__) _____-____]'}
E-mail: ${contract.user_email || '[________________@_______.com]'}

═══════════════════════════════════════════════════════════════════════════

CLÁUSULA PRIMEIRA – DO OBJETO

${contract.content}

CLÁUSULA SEGUNDA – DO PRAZO

O presente contrato terá vigência a partir da data de sua assinatura${contract.due_date ? ` até ${new Date(contract.due_date).toLocaleDateString('pt-BR')}` : ', com prazo a ser definido entre as partes'}.

§1º O prazo poderá ser prorrogado mediante acordo entre as partes.

§2º O descumprimento dos prazos estabelecidos sujeitará a parte inadimplente às penalidades previstas neste contrato.

CLÁUSULA TERCEIRA – DAS CONDIÇÕES FINANCEIRAS

${contract.total_value ? 
  `O valor total dos serviços contratados é de R$ ${Number(contract.total_value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (${numberToWords(contract.total_value)}).

§1º O pagamento será efetuado conforme cronograma a ser acordado entre as partes.

§2º Os valores não pagos na data do vencimento sofrerão acréscimo de juros de 1% (um por cento) ao mês e multa de 2% (dois por cento) sobre o valor em atraso.` : 
  `O valor dos serviços será definido conforme acordo específico entre as partes, devendo ser formalizado por meio de aditivo contratual.

§1º Os valores acordados deverão ser pagos conforme cronograma estabelecido.

§2º Os pagamentos em atraso estarão sujeitos a juros e multa conforme legislação vigente.`
}

CLÁUSULA QUARTA – DAS RESPONSABILIDADES

§1º O CONTRATADO compromete-se a:
a) Executar os serviços com qualidade técnica e profissional;
b) Cumprir os prazos estabelecidos;
c) Manter sigilo sobre informações confidenciais;
d) Comunicar imediatamente qualquer impedimento para execução dos serviços.

§2º O CONTRATANTE compromete-se a:
a) Fornecer todas as informações necessárias para execução dos serviços;
b) Efetuar os pagamentos nos prazos acordados;
c) Disponibilizar recursos e acesso necessários;
d) Colaborar para o bom andamento dos trabalhos.

CLÁUSULA QUINTA – DA CONFIDENCIALIDADE

As partes comprometem-se a manter absoluto sigilo sobre todas as informações confidenciais às quais tiverem acesso durante a vigência deste contrato.

CLÁUSULA SEXTA – DA RESCISÃO

§1º Este contrato poderá ser rescindido:
a) Por acordo mútuo entre as partes;
b) Por inadimplemento de qualquer das cláusulas contratuais;
c) Por impossibilidade de cumprimento do objeto contratual.

§2º A rescisão por inadimplemento será precedida de notificação com prazo de 15 (quinze) dias para regularização.

§3º Em caso de rescisão, as partes farão jus aos valores proporcionais aos serviços já executados.

CLÁUSULA SÉTIMA – DAS DISPOSIÇÕES GERAIS

§1º Este contrato substitui todos os acordos anteriores entre as partes sobre o mesmo objeto.

§2º Qualquer alteração deste contrato deverá ser feita por escrito e assinada por ambas as partes.

§3º A tolerância quanto ao descumprimento de qualquer cláusula não constituirá novação ou renúncia ao direito.

CLÁUSULA OITAVA – DO FORO

Fica eleito o foro da comarca de [Cidade/Estado] para dirimir quaisquer questões oriundas do presente contrato, renunciando as partes a qualquer outro, por mais privilegiado que seja.

═══════════════════════════════════════════════════════════════════════════

E por estarem assim justos e contratados, as partes assinam o presente instrumento em duas vias de igual teor e forma, na presença das testemunhas abaixo identificadas.

Local: _________________, ${currentDate}


CONTRATANTE:                                    CONTRATADO:

_________________________________              _________________________________
Nome: ${contract.client_name}                   Nome: [Nome completo]
CPF: [___.___.___-__]                          CPF: [___.___.___-__]


TESTEMUNHAS:

_________________________________              _________________________________
Nome: [Nome completo]                           Nome: [Nome completo]
CPF: [___.___.___-__]                          CPF: [___.___.___-__]
RG: [__.___.___ SSP/__]                        RG: [__.___.___ SSP/__]


═══════════════════════════════════════════════════════════════════════════

Este contrato foi gerado pelo ContratPro em ${currentDate}
Para melhor visualização, importe este arquivo no Google Docs ou Microsoft Word
Recomendações de formatação:
- Fonte: Arial ou Calibri, tamanho 12
- Espaçamento: 1,5 entre linhas  
- Margens: 2,5 cm em todos os lados
- Alinhamento: Justificado`;
};
