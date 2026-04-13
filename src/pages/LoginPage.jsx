import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export default function LoginPage() {
  const { user, signIn, updatePassword } = useAuth();
  const navigate = useNavigate();

  // Detect if user arrived via invite link (has access_token hash)
  const [isSetPassword, setIsSetPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Supabase puts #access_token=... in the URL after invite link click
    if (window.location.hash.includes('access_token')) {
      setIsSetPassword(true);
    }
  }, []);

  // If already logged in, redirect
  useEffect(() => {
    if (user && !isSetPassword) navigate('/minha-conta');
  }, [user, isSetPassword, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await signIn(email, password);
    if (error) setError('E-mail ou senha incorretos.');
    else navigate('/minha-conta');
    setLoading(false);
  };

  const handleSetPassword = async (e) => {
    e.preventDefault();
    if (password.length < 8) { setError('A senha deve ter pelo menos 8 caracteres.'); return; }
    if (password !== confirm) { setError('As senhas não coincidem.'); return; }
    setLoading(true);
    setError('');
    const { error } = await updatePassword(password);
    if (error) {
      setError('Não foi possível definir a senha. Tente novamente.');
    } else {
      setSuccess('Senha criada com sucesso! Redirecionando...');
      setTimeout(() => navigate('/minha-conta'), 2000);
    }
    setLoading(false);
  };

  const handleForgotPassword = async () => {
    if (!email) { setError('Digite seu e-mail para recuperar a senha.'); return; }
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://www.clickraidofc.com.br/login',
    });
    if (error) setError('Erro ao enviar e-mail de recuperação.');
    else setSuccess('E-mail de recuperação enviado! Verifique sua caixa de entrada.');
    setLoading(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 animate-fade-in">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="font-brand text-3xl text-brand-gold tracking-widest">CLICKRAID</Link>
          <p className="text-gray-500 text-sm mt-2">
            {isSetPassword ? 'Crie sua senha para acessar sua conta' : 'Acesse sua conta'}
          </p>
        </div>

        <div className="bg-brand-card border border-brand-border p-8">

          {/* Set password mode (came from invite email) */}
          {isSetPassword ? (
            <>
              <h2 className="font-heading text-2xl text-white mb-6">CRIAR SENHA</h2>
              <p className="text-sm text-gray-400 mb-6">
                Bem-vindo à Clickraid! Escolha uma senha para acessar seus pedidos e acompanhar suas compras.
              </p>
              {success ? (
                <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm p-4 text-center">
                  {success}
                </div>
              ) : (
                <form onSubmit={handleSetPassword} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                      Nova Senha <span className="text-brand-gold">*</span>
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mínimo 8 caracteres"
                      required
                      className="w-full bg-brand-dark border border-brand-border px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand-gold transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                      Confirmar Senha <span className="text-brand-gold">*</span>
                    </label>
                    <input
                      type="password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="Repita a senha"
                      required
                      className="w-full bg-brand-dark border border-brand-border px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand-gold transition-colors"
                    />
                  </div>
                  {error && <p className="text-xs text-brand-red">{error}</p>}
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full py-4 flex items-center justify-center gap-2"
                  >
                    {loading
                      ? <><div className="w-4 h-4 border-2 border-brand-black border-t-transparent rounded-full animate-spin" /> Salvando...</>
                      : 'Criar Senha e Entrar'}
                  </button>
                </form>
              )}
            </>
          ) : (
            /* Normal login mode */
            <>
              <h2 className="font-heading text-2xl text-white mb-6">ENTRAR</h2>
              {success ? (
                <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm p-4 text-center mb-4">
                  {success}
                </div>
              ) : null}
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                    E-mail <span className="text-brand-gold">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    required
                    className="w-full bg-brand-dark border border-brand-border px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand-gold transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                    Senha <span className="text-brand-gold">*</span>
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Sua senha"
                    required
                    className="w-full bg-brand-dark border border-brand-border px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand-gold transition-colors"
                  />
                </div>
                {error && <p className="text-xs text-brand-red">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-4 flex items-center justify-center gap-2"
                >
                  {loading
                    ? <><div className="w-4 h-4 border-2 border-brand-black border-t-transparent rounded-full animate-spin" /> Entrando...</>
                    : 'Entrar'}
                </button>
              </form>

              <button
                onClick={handleForgotPassword}
                disabled={loading}
                className="w-full mt-4 text-xs text-gray-500 hover:text-brand-gold transition-colors text-center"
              >
                Esqueci minha senha
              </button>
            </>
          )}
        </div>

        <p className="text-center text-xs text-gray-600 mt-6">
          Sua conta é criada automaticamente após a confirmação do pagamento.
        </p>
      </div>
    </div>
  );
}
