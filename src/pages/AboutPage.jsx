import { Link } from 'react-router-dom';

export default function AboutPage() {
  return (
    <div className="animate-fade-in">

      {/* HERO */}
      <section className="relative py-28 bg-brand-dark border-b border-brand-border overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img src="https://images.unsplash.com/photo-1578926288207-a90a5366e116?w=1600&q=80" alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-dark via-brand-dark/80 to-transparent" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-8 bg-brand-gold" />
            <span className="text-brand-gold text-xs font-bold uppercase tracking-widest">Nossa História</span>
            <div className="h-px w-8 bg-brand-gold" />
          </div>
          <h1 className="section-title text-5xl md:text-7xl mb-4">SOBRE A CLICKRAID</h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-sm leading-relaxed">
            Criando homenagens em miniatura a armas icônicas — para colecionadores, entusiastas e quem aprecia autenticidade.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20 space-y-20">

        {/* QUEM SOMOS */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px w-8 bg-brand-gold" />
            <span className="text-brand-gold text-xs font-bold uppercase tracking-widest">Quem Somos</span>
          </div>
          <h2 className="section-title text-3xl md:text-4xl mb-6">PAIXÃO PELO DETALHE</h2>
          <div className="space-y-4 text-gray-400 text-sm leading-relaxed">
            <p>
              Somos uma equipe de entusiastas que projetam e fabricam chaveiros em miniatura de armas de alta qualidade para
              colecionadores, jogadores, aficionados por história militar e qualquer pessoa que aprecie armas de fogo icônicas.
              Nossos modelos combinam artesanato detalhado com funcionalidade, tornando-os mais do que simples acessórios —
              mas verdadeiras homenagens a designs lendários.
            </p>
            <p>
              Cada produto é concebido para servir como uma recordação única, um tema de conversa ou um presente para aqueles
              que valorizam a autenticidade e a precisão.
            </p>
          </div>
        </div>

        {/* NÚMEROS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            ['2.500+', 'Clientes'],
            ['50+', 'Modelos'],
            ['4.8★', 'Avaliação'],
            ['4 dias', 'Produção'],
          ].map(([num, label]) => (
            <div key={label} className="bg-brand-card border border-brand-border p-6 text-center hover:border-brand-gold/30 transition-all">
              <div className="font-heading text-3xl text-brand-gold mb-2">{num}</div>
              <div className="text-xs text-gray-500 uppercase tracking-widest">{label}</div>
            </div>
          ))}
        </div>

        {/* ONDE TUDO COMEÇOU */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px w-8 bg-brand-gold" />
            <span className="text-brand-gold text-xs font-bold uppercase tracking-widest">Nossa Origem</span>
          </div>
          <h2 className="section-title text-3xl md:text-4xl mb-6">ONDE TUDO COMEÇOU</h2>
          <div className="space-y-4 text-gray-400 text-sm leading-relaxed">
            <p>
              A origem da nossa marca está enraizada na obsessão — pela mecânica, pela estética e pelo legado de armas icônicas.
              Nosso fundador, colecionador e entusiasta da mecânica, queria algo que não existia: réplicas em miniatura de armas
              que parecessem e tivessem a mesma sensação de autenticidade, mas que também pudessem ser usadas no dia a dia.
            </p>
            <p>
              Tudo começou com ideias esboçadas à mão, modelos 3D personalizados e inúmeras tentativas. Quando o primeiro
              protótipo ganhou vida, não parecia um brinquedo — parecia uma homenagem. Aquele momento definiu nossa direção.
            </p>
            <p>
              Hoje, continuamos sendo uma equipe unida — tão unida quanto uma família — colaborando com parceiros de produção
              especializados para dar vida aos nossos designs em uma escala maior, mantendo total controle criativo e atenção
              aos detalhes. Nossos chaveiros continuam a alcançar entusiastas em todo o mundo.
            </p>
          </div>
        </div>

        {/* COMO NOS DESTACAMOS */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px w-8 bg-brand-gold" />
            <span className="text-brand-gold text-xs font-bold uppercase tracking-widest">Diferenciais</span>
          </div>
          <h2 className="section-title text-3xl md:text-4xl mb-6">COMO NOS DESTACAMOS</h2>
          <p className="text-gray-400 text-sm leading-relaxed mb-8">
            Não somos apenas uma loja — somos uma oficina de ideias que ganham vida pelas mãos de uma equipe de designers,
            engenheiros e entusiastas. Nossos valores são simples:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                icon: '★',
                title: 'Qualidade',
                text: 'Cada chaveiro é meticulosamente projetado com materiais de qualidade, com atenção à forma e à função.',
              },
              {
                icon: '◆',
                title: 'Fidelidade',
                text: 'Nossos modelos são baseados em armas de fogo reais, históricas ou modernas, capturando sua essência em escala miniatura.',
              },
              {
                icon: '♦',
                title: 'Paixão',
                text: 'Construímos para os fãs — porque nós somos fãs.',
              },
            ].map(({ icon, title, text }) => (
              <div key={title} className="bg-brand-card border border-brand-border p-8 text-center hover:border-brand-gold/30 transition-all">
                <div className="text-brand-gold text-3xl mb-4">{icon}</div>
                <h3 className="font-heading text-2xl text-white tracking-wide mb-3">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
          <p className="text-gray-500 text-sm leading-relaxed mt-8 text-center max-w-2xl mx-auto">
            Com envios para todo o Brasil e uma base de fãs global cada vez maior, temos orgulho de oferecer algo verdadeiramente
            único — uma forma em miniatura de transportar poder de fogo lendário.
          </p>
        </div>

        {/* CTA */}
        <div className="text-center pt-4 border-t border-brand-border">
          <p className="text-gray-500 text-sm mb-6">Pronto para fazer parte da nossa coleção?</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/produtos" className="btn-primary">Ver Nossa Coleção</Link>
            <Link to="/encomendas" className="btn-outline">Fazer uma Encomenda</Link>
          </div>
        </div>

      </div>
    </div>
  );
}
