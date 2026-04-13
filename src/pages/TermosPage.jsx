const Section = ({ title, children }) => (
  <div className="mb-10">
    <h2 className="font-heading text-2xl text-white tracking-wide mb-4 pb-2 border-b border-brand-border">{title}</h2>
    <div className="space-y-3 text-sm text-gray-400 leading-relaxed">{children}</div>
  </div>
);

export default function TermosPage() {
  return (
    <div className="animate-fade-in">
      {/* Header */}
      <section className="py-20 bg-brand-dark border-b border-brand-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-8 bg-brand-gold" />
            <span className="text-brand-gold text-xs font-bold uppercase tracking-widest">Legal</span>
            <div className="h-px w-8 bg-brand-gold" />
          </div>
          <h1 className="section-title text-4xl md:text-5xl mb-4">TERMOS DE USO</h1>
          <p className="text-gray-500 text-xs">Última atualização: abril de 2025</p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">

        <Section title="1. Aceitação dos Termos">
          <p>
            Ao acessar e utilizar o site da <span className="text-white font-medium">Clickraid™</span>, você concorda
            com estes Termos de Uso. Se não concordar com qualquer parte dos termos, por favor, não utilize nosso site.
          </p>
        </Section>

        <Section title="2. Sobre os Produtos">
          <p>
            Todos os produtos comercializados pela Clickraid™ são <span className="text-white">miniaturas decorativas e chaveiros colecionáveis</span>,
            fabricados em escala reduzida para fins de coleção e uso pessoal. Não se trata de armas de fogo, réplicas operacionais
            ou qualquer item sujeito a legislação de armas.
          </p>
          <p>
            Os produtos são destinados a maiores de 14 anos. A Clickraid™ não se responsabiliza pelo uso inadequado dos produtos.
          </p>
        </Section>

        <Section title="3. Pedidos e Pagamento">
          <p>
            Todos os pagamentos são realizados exclusivamente via <span className="text-white font-medium">PIX</span>.
            O pedido é confirmado somente após a comprovação do pagamento. Em casos de encomenda personalizada,
            a produção tem início após a confirmação do pagamento.
          </p>
          <p>
            Os preços exibidos no site estão em Reais (R$) e podem ser alterados sem aviso prévio.
            O valor vigente no momento da finalização do pedido é o que prevalece.
          </p>
        </Section>

        <Section title="4. Prazo de Produção e Entrega">
          <p>
            Para produtos em estoque, o despacho ocorre em até <span className="text-white">48 horas úteis</span> após
            a confirmação do pagamento.
          </p>
          <p>
            Para encomendas personalizadas, o prazo de produção é de <span className="text-white">4 dias úteis</span>,
            seguido pelo prazo de entrega da transportadora (estimado em 5 a 10 dias úteis, dependendo da região).
          </p>
          <p>
            Prazos podem ser afetados por condições externas, como greves, feriados ou situações climáticas fora do controle da Clickraid™.
          </p>
        </Section>

        <Section title="5. Encomendas Personalizadas">
          <p>
            Encomendas personalizadas são aceitas conforme disponibilidade. Uma vez confirmado o pagamento,
            o pedido entra em produção e não pode ser cancelado. Em caso de defeito de fabricação, a peça será
            substituída sem custo adicional.
          </p>
        </Section>

        <Section title="6. Propriedade Intelectual">
          <p>
            Todo o conteúdo do site — incluindo textos, imagens, logotipos, identidade visual e descrições de produtos —
            é de propriedade da Clickraid™ ou licenciado para uso pela empresa. É proibida a reprodução,
            distribuição ou uso comercial sem autorização prévia por escrito.
          </p>
        </Section>

        <Section title="7. Limitação de Responsabilidade">
          <p>
            A Clickraid™ não se responsabiliza por danos indiretos, perda de dados ou qualquer prejuízo decorrente
            do uso ou incapacidade de uso dos produtos ou do site, além dos limites permitidos pela legislação aplicável.
          </p>
        </Section>

        <Section title="8. Alterações nos Termos">
          <p>
            Reservamo-nos o direito de modificar estes termos a qualquer momento. As alterações entrarão em vigor
            assim que publicadas no site. O uso continuado do site após as alterações constitui aceitação dos novos termos.
          </p>
        </Section>

        <Section title="9. Lei Aplicável">
          <p>
            Estes termos são regidos pelas leis da República Federativa do Brasil. Fica eleito o foro da comarca
            da sede da empresa para dirimir quaisquer controvérsias.
          </p>
        </Section>

        <Section title="10. Contato">
          <p>
            Dúvidas sobre estes termos? Entre em contato pelo WhatsApp ou pela página de{' '}
            <a href="/encomendas" className="text-brand-gold hover:underline">Encomendas & Contato</a>.
          </p>
        </Section>

      </div>
    </div>
  );
}
