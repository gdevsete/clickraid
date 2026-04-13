const Section = ({ title, children }) => (
  <div className="mb-10">
    <h2 className="font-heading text-2xl text-white tracking-wide mb-4 pb-2 border-b border-brand-border">{title}</h2>
    <div className="space-y-3 text-sm text-gray-400 leading-relaxed">{children}</div>
  </div>
);

const StepCard = ({ num, title, text }) => (
  <div className="flex gap-4 bg-brand-card border border-brand-border p-5">
    <div className="font-heading text-4xl text-brand-gold/30 leading-none flex-shrink-0">{num}</div>
    <div>
      <p className="text-sm font-bold text-white uppercase tracking-wide mb-1">{title}</p>
      <p className="text-xs text-gray-500 leading-relaxed">{text}</p>
    </div>
  </div>
);

export default function TrocasPage() {
  return (
    <div className="animate-fade-in">
      {/* Header */}
      <section className="py-20 bg-brand-dark border-b border-brand-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-8 bg-brand-gold" />
            <span className="text-brand-gold text-xs font-bold uppercase tracking-widest">Pós-venda</span>
            <div className="h-px w-8 bg-brand-gold" />
          </div>
          <h1 className="section-title text-4xl md:text-5xl mb-4">TROCAS E DEVOLUÇÕES</h1>
          <p className="text-gray-400 max-w-xl mx-auto text-sm leading-relaxed">
            Sua satisfação é nossa prioridade. Confira abaixo nossa política completa de trocas e devoluções.
          </p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">

        {/* Prazo destaque */}
        <div className="bg-brand-gold/10 border border-brand-gold/40 p-6 mb-12 flex items-center gap-4">
          <div className="text-brand-gold flex-shrink-0">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div>
            <p className="text-white font-bold text-sm uppercase tracking-wider">Garantia de 30 Dias</p>
            <p className="text-gray-400 text-xs mt-0.5">
              Você tem até 30 dias corridos após o recebimento para solicitar troca ou devolução por defeito de fabricação.
            </p>
          </div>
        </div>

        <Section title="Quando você pode solicitar troca ou devolução">
          <p>Aceitamos solicitações de troca ou devolução nos seguintes casos:</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Produto com <span className="text-white">defeito de fabricação</span></li>
            <li>Produto recebido diferente do pedido (modelo ou cor incorretos)</li>
            <li>Produto danificado durante o transporte</li>
            <li>Produto não entregue no prazo (com confirmação de extravio pela transportadora)</li>
          </ul>
        </Section>

        <Section title="Quando NÃO aceitamos troca ou devolução">
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Produtos com sinais de uso, mau uso ou dano causado pelo cliente</li>
            <li>Solicitações feitas após 30 dias do recebimento</li>
            <li>Encomendas personalizadas confirmadas e pagas (exceto em caso de defeito de fabricação)</li>
            <li>Produtos sem embalagem original ou sem nota de compra</li>
          </ul>
        </Section>

        <Section title="Como solicitar">
          <div className="space-y-3 mt-2">
            <StepCard
              num="01"
              title="Entre em Contato"
              text="Envie uma mensagem pelo WhatsApp ou pelo formulário de encomendas com o número do seu pedido, descrição do problema e foto do produto."
            />
            <StepCard
              num="02"
              title="Avaliação"
              text="Nossa equipe analisará sua solicitação em até 2 dias úteis e informará o procedimento aprovado."
            />
            <StepCard
              num="03"
              title="Envio do Produto"
              text="Se aprovado, você receberá as instruções para envio do produto. Em casos de defeito, o frete de retorno é por nossa conta."
            />
            <StepCard
              num="04"
              title="Resolução"
              text="Após recebermos e verificarmos o produto, realizaremos a troca pelo mesmo modelo (ou crédito, se indisponível) em até 5 dias úteis."
            />
          </div>
        </Section>

        <Section title="Reembolso">
          <p>
            Em casos de devolução com reembolso aprovado, o valor é devolvido integralmente via PIX
            em até <span className="text-white">5 dias úteis</span> após a aprovação da devolução.
          </p>
          <p>
            O frete original não é reembolsável, exceto nos casos em que o erro foi nosso
            (produto errado enviado ou produto com defeito de fabricação).
          </p>
        </Section>

        <Section title="Prazo de envio para devolução">
          <p>
            Após a aprovação da sua solicitação, você tem até <span className="text-white">7 dias corridos</span> para
            postar o produto no correio ou transportadora indicada. Solicitações aprovadas mas não enviadas neste
            prazo serão canceladas.
          </p>
        </Section>

        <Section title="Contato">
          <p>
            Para iniciar uma solicitação de troca ou tirar dúvidas, entre em contato pelo WhatsApp
            ou acesse nossa página de{' '}
            <a href="/encomendas" className="text-brand-gold hover:underline">Encomendas & Contato</a>.
            Nosso suporte funciona de segunda a sexta, das 9h às 18h.
          </p>
        </Section>

      </div>
    </div>
  );
}
