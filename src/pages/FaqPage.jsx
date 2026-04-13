import { useState } from 'react';

const faqData = [
  {
    id: 'pedidos',
    label: 'Pedidos e Pagamentos',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
      </svg>
    ),
    items: [
      {
        q: 'Como faço para fazer um pedido?',
        a: 'Basta adicionar seus chaveiros favoritos ao carrinho e prosseguir para o pagamento. Você não precisa de uma conta, mas criar uma facilita o rastreamento dos pedidos.',
      },
      {
        q: 'Posso cancelar ou alterar meu pedido?',
        a: 'Sim, os pedidos podem ser cancelados em até 24 horas para reembolso integral. Caso precise atualizar seu endereço ou itens, entre em contato conosco imediatamente.',
      },
      {
        q: 'Quais métodos de pagamento vocês aceitam?',
        a: 'Apenas PIX para manter o valor, rápidez no frete e qualidade dos produtos.',
      },
      {
        q: 'O pagamento é seguro?',
        a: 'Com certeza. Todos os pagamentos são criptografados e processados por meio de provedores confiáveis.',
      },
      {
        q: 'E se meu pagamento falhar?',
        a: 'Por favor, tente novamente com outro método ou entre em contato com o suporte para obter ajuda.',
      },
    ],
  },
  {
    id: 'envio',
    label: 'Envio e entrega',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
      </svg>
    ),
    items: [
      {
        q: 'Para onde vocês enviam os produtos?',
        a: 'Temos orgulho em enviar para todo o mundo. Dos EUA e Canadá ao Reino Unido, Europa, Austrália, Japão e muitos outros países, entregamos para colecionadores em todo o planeta.',
      },
      {
        q: 'Quanto tempo demora o envio?',
        a: 'O prazo de entrega normal é de 7 a 15 dias úteis, dependendo da localização. Os prazos máximos de entrega estão listados em nossa Política de Envio.',
      },
      {
        q: 'Vocês oferecem rastreamento?',
        a: 'Sim, você receberá um link de rastreamento por e-mail assim que seu pedido for enviado.',
      },
      {
        q: 'Terei que pagar taxas alfandegárias?',
        a: 'Encomendas internacionais podem estar sujeitas a taxas ou impostos de importação locais. Essas taxas são de responsabilidade do cliente.\n\nPara clientes na União Europeia, cobrimos o IVA na importação, portanto, você não será cobrado o IVA novamente. No entanto, quaisquer taxas alfandegárias ou de manuseio adicionais (se aplicadas pelo seu país) permanecem sob a responsabilidade do comprador.',
      },
    ],
  },
  {
    id: 'devolucoes',
    label: 'Devoluções e reembolsos',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
      </svg>
    ),
    items: [
      {
        q: 'Qual é a sua política de devolução?',
        a: 'Aceitamos devoluções em até 30 dias após a entrega. Os itens devem estar sem uso, em sua condição original e com todas as embalagens intactas.',
      },
      {
        q: 'Quem paga pelo frete de devolução?',
        a: 'Se o produto estiver com defeito ou incorreto, nós cobrimos o custo. Se você simplesmente mudar de ideia, você arca com o frete de devolução.',
      },
      {
        q: 'Vocês aceitam trocas?',
        a: 'A maneira mais rápida é devolver o item e fazer um novo pedido.',
      },
    ],
  },
  {
    id: 'produto',
    label: 'Informações do produto',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
    ),
    items: [
      {
        q: 'Essas armas são reais?',
        a: 'Não — nossos chaveiros são réplicas em miniatura feitas para colecionadores e fãs. Eles não são funcionais e são completamente seguros.',
      },
      {
        q: 'De que materiais são feitos?',
        a: 'Utilizamos metais de alta qualidade, plásticos duráveis e acabamentos resistentes para garantir detalhes, peso e longevidade.',
      },
      {
        q: 'São seguros para transportar para todo o lado?',
        a: 'Embora sejam completamente seguros e não funcionais, a segurança do aeroporto ainda pode detectá-los. Recomendamos que os coloque na bagagem despachada ao viajar de avião. Não podemos garantir que serão permitidos na segurança — transportá-los é por sua conta e risco.',
      },
      {
        q: 'São boas opções para presente?',
        a: 'Sim! São populares entre colecionadores, jogadores e fãs de história militar.',
      },
    ],
  },
  {
    id: 'responsabilidade',
    label: 'Responsabilidade e Exceções',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
      </svg>
    ),
    items: [
      {
        q: 'O entregador marcou meu pedido como "entregue", mas eu não o recebi. O que devo fazer?',
        a: 'Assim que um pedido é marcado como entregue pela transportadora, a responsabilidade passa para o cliente. Por favor, verifique com seus vizinhos, funcionários do prédio ou agência dos Correios local. Se a encomenda for roubada ou extraviada após a entrega, não poderemos efetuar o reembolso.',
      },
      {
        q: 'O entregador tentou entregar, mas eu não estava em casa. De quem é a responsabilidade?',
        a: 'Se o estafeta não conseguir contactá-lo, poderá deixar a sua encomenda num ponto de recolha local ou reagendar a entrega. Neste caso, é da sua responsabilidade levantar a encomenda.',
      },
      {
        q: 'A entrega está atrasada pelos correios locais. Vocês fazem reembolso nesse caso?',
        a: 'Pequenos atrasos causados pela logística local estão fora do nosso controle. Garantimos reembolso ou substituição apenas se o seu pacote não chegar em até 30 dias após o envio e não houver tentativas de entrega bem-sucedidas.',
      },
      {
        q: 'Meu rastreamento não é atualizado há vários dias. Meu pedido foi extraviado?',
        a: 'O rastreamento pode ser interrompido em determinados pontos de verificação (especialmente durante o processamento alfandegário). Isso não significa que seu pedido foi perdido. Aguarde o prazo máximo de entrega completo antes de solicitar um reembolso.',
      },
      {
        q: 'O produto não é exatamente como eu imaginei (tamanho, peso, textura). Posso devolvê-lo?',
        a: 'Sim, mas isso é considerado uma "arrependimento da compra". Nesse caso, o frete de devolução é por conta do cliente. Nós só cobrimos os custos de devolução se o item estiver com defeito ou incorreto.',
      },
      {
        q: 'Digitei o endereço errado ao fazer meu pedido. Vocês podem corrigir?',
        a: 'Se você digitou o endereço de entrega errado, entre em contato conosco em até 24 horas após a realização do pedido. Alterações solicitadas dentro desse prazo são garantidas — atualizaremos o endereço antes do envio do seu pacote.\n\nSe já se passaram mais de 24 horas, ainda existe a possibilidade de o pedido não ter sido enviado. Entre em contato conosco o mais breve possível e faremos o possível para atualizar o endereço. No entanto, após o processamento ou envio do pacote, não podemos fazer alterações e não nos responsabilizamos por pedidos entregues em endereços incorretos.',
      },
    ],
  },
  {
    id: 'privacidade',
    label: 'Privacidade e suporte',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
      </svg>
    ),
    items: [
      {
        q: 'Meus dados pessoais estão seguros?',
        a: 'Sim. Usamos suas informações apenas para processar e enviar seu pedido. Os pagamentos são totalmente criptografados.',
      },
      {
        q: 'Com que rapidez você responde?',
        a: 'Normalmente respondemos em até 24 horas em dias úteis.',
      },
    ],
  },
];

function AccordionItem({ q, a, isOpen, onToggle }) {
  return (
    <div className="border-b border-brand-border last:border-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-5 text-left gap-4 group"
      >
        <span className={`text-sm font-medium transition-colors ${isOpen ? 'text-brand-gold' : 'text-white group-hover:text-brand-gold'}`}>
          {q}
        </span>
        <span className={`flex-shrink-0 w-6 h-6 flex items-center justify-center border transition-all ${
          isOpen
            ? 'border-brand-gold text-brand-gold rotate-45'
            : 'border-brand-border text-gray-500 group-hover:border-brand-gold group-hover:text-brand-gold'
        }`}>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4"/>
          </svg>
        </span>
      </button>

      {isOpen && (
        <div className="pb-5 animate-fade-in">
          {a.split('\n\n').map((para, i) => (
            <p key={i} className={`text-sm text-gray-400 leading-relaxed ${i > 0 ? 'mt-3' : ''}`}>
              {para}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

export default function FaqPage() {
  const [activeCategory, setActiveCategory] = useState('pedidos');
  const [openIndex, setOpenIndex] = useState(0);

  const currentCategory = faqData.find(c => c.id === activeCategory);

  const handleCategoryChange = (id) => {
    setActiveCategory(id);
    setOpenIndex(0);
  };

  return (
    <div className="animate-fade-in">

      {/* Hero */}
      <section className="bg-brand-dark border-b border-brand-border py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-8 bg-brand-gold" />
            <span className="text-brand-gold text-xs font-bold uppercase tracking-widest">Ajuda</span>
            <div className="h-px w-8 bg-brand-gold" />
          </div>
          <h1 className="section-title text-5xl md:text-6xl mb-4">PERGUNTAS FREQUENTES</h1>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            Encontre respostas para as dúvidas mais comuns sobre pedidos, envio, devoluções e nossos produtos.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">

        {/* Category tabs — scroll horizontal no mobile */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 mb-10">
          {faqData.map(cat => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider whitespace-nowrap flex-shrink-0 transition-all border ${
                activeCategory === cat.id
                  ? 'bg-brand-gold text-brand-black border-brand-gold'
                  : 'bg-brand-card text-gray-400 border-brand-border hover:border-brand-gold/40 hover:text-white'
              }`}
            >
              <span className={activeCategory === cat.id ? 'text-brand-black' : 'text-gray-500'}>
                {cat.icon}
              </span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Accordion */}
        <div className="bg-brand-card border border-brand-border px-6">
          {currentCategory?.items.map((item, i) => (
            <AccordionItem
              key={i}
              q={item.q}
              a={item.a}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </div>

        {/* Contato */}
        <div className="mt-12 p-6 bg-brand-card border border-brand-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-white font-medium text-sm">Não encontrou o que procurava?</p>
            <p className="text-gray-500 text-xs mt-1">Nossa equipe responde em até 24h em dias úteis.</p>
          </div>
          <a
            href="mailto:contato@clickraid.com.br"
            className="btn-primary text-xs py-2.5 px-6 whitespace-nowrap"
          >
            Falar com o Suporte
          </a>
        </div>

      </div>
    </div>
  );
}
