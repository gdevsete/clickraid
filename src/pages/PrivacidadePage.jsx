const Section = ({ title, children }) => (
  <div className="mb-10">
    <h2 className="font-heading text-2xl text-white tracking-wide mb-4 pb-2 border-b border-brand-border">{title}</h2>
    <div className="space-y-3 text-sm text-gray-400 leading-relaxed">{children}</div>
  </div>
);

export default function PrivacidadePage() {
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
          <h1 className="section-title text-4xl md:text-5xl mb-4">POLÍTICA DE PRIVACIDADE</h1>
          <p className="text-gray-500 text-xs">Última atualização: abril de 2025</p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">

        <Section title="1. Quem Somos">
          <p>
            A <span className="text-white font-medium">Clickraid™</span> é uma empresa especializada em miniaturas chaveiro de armas de fogo.
            Esta política de privacidade descreve como coletamos, usamos e protegemos suas informações pessoais ao utilizar nosso site.
          </p>
        </Section>

        <Section title="2. Dados que Coletamos">
          <p>Ao realizar uma compra ou solicitar uma encomenda, podemos coletar:</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Nome completo</li>
            <li>Endereço de e-mail</li>
            <li>Número de telefone / WhatsApp</li>
            <li>Endereço de entrega (CEP, rua, número, bairro, cidade, estado)</li>
            <li>Dados do pedido (produtos, quantidades, valores)</li>
          </ul>
          <p className="mt-2">
            Não coletamos dados de cartão de crédito. Todos os pagamentos são realizados via PIX, de forma segura e direta.
          </p>
        </Section>

        <Section title="3. Como Usamos seus Dados">
          <p>Utilizamos suas informações para:</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Processar e entregar seus pedidos</li>
            <li>Entrar em contato sobre o status do pedido ou encomenda</li>
            <li>Responder dúvidas e solicitações de suporte</li>
            <li>Melhorar nossos produtos e serviços</li>
            <li>Enviar comunicações sobre promoções (somente com seu consentimento)</li>
          </ul>
        </Section>

        <Section title="4. Compartilhamento de Dados">
          <p>
            Seus dados <span className="text-white">não são vendidos</span> a terceiros. Podemos compartilhá-los apenas com:
          </p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Transportadoras e serviços de logística para entrega do pedido</li>
            <li>Prestadores de serviço essenciais para operação do site (hospedagem, e-mail)</li>
            <li>Autoridades legais, quando exigido por lei</li>
          </ul>
        </Section>

        <Section title="5. Cookies">
          <p>
            Nosso site pode utilizar cookies para melhorar sua experiência de navegação, como manter itens no carrinho
            e lembrar preferências. Você pode desativar os cookies nas configurações do seu navegador,
            mas isso pode afetar algumas funcionalidades do site.
          </p>
        </Section>

        <Section title="6. Segurança">
          <p>
            Utilizamos medidas técnicas e organizacionais adequadas para proteger seus dados contra acesso não autorizado,
            alteração, divulgação ou destruição. Nosso site opera com protocolo HTTPS (SSL).
          </p>
        </Section>

        <Section title="7. Seus Direitos (LGPD)">
          <p>Em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), você tem direito a:</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Confirmar a existência de tratamento dos seus dados</li>
            <li>Acessar seus dados pessoais</li>
            <li>Corrigir dados incompletos ou incorretos</li>
            <li>Solicitar a exclusão dos seus dados</li>
            <li>Revogar o consentimento a qualquer momento</li>
          </ul>
          <p className="mt-2">
            Para exercer qualquer um desses direitos, entre em contato conosco pelo e-mail ou WhatsApp disponíveis na página de contato.
          </p>
        </Section>

        <Section title="8. Retenção de Dados">
          <p>
            Mantemos seus dados pelo tempo necessário para cumprir as finalidades descritas nesta política,
            ou conforme exigido por obrigações legais e fiscais.
          </p>
        </Section>

        <Section title="9. Alterações nesta Política">
          <p>
            Podemos atualizar esta política periodicamente. Quando fizermos alterações significativas,
            notificaremos através do nosso site. Recomendamos que você revise esta página regularmente.
          </p>
        </Section>

        <Section title="10. Contato">
          <p>
            Dúvidas sobre esta política? Entre em contato conosco pelo WhatsApp ou pelo formulário na página de{' '}
            <a href="/encomendas" className="text-brand-gold hover:underline">Encomendas & Contato</a>.
          </p>
        </Section>

      </div>
    </div>
  );
}
