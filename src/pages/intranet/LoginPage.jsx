import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (!email.endsWith('@destinospp.com')) {
      setError('Acceso denegado: Use su correo corporativo');
      return;
    }
    // Simulación de login exitoso
    navigate('/intranet/dashboard');
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden font-sans">
        {/* Fondo de Paisaje Corporativo */}
        <div 
            className="absolute inset-0 z-0"
            style={{
                backgroundImage: 'url("/fondo-intranet.jpg")', // Imagen local en carpeta public
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
        </div>

        {/* Formulario Glassmorphism */}
        <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative z-10 w-full max-w-md p-10 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2.5rem] shadow-2xl"
        >
            <div className="text-center mb-10">
                <img src="/logo-destinos.png" alt="Destinos P&P" className="h-24 mx-auto mb-6 drop-shadow-2xl" />
                <h2 className="text-4xl font-bold text-white mb-2 tracking-tight">Bienvenido</h2>
                <p className="text-blue-100/80 text-lg">Intranet Corporativa</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-blue-100 text-sm font-semibold ml-1">Correo Corporativo</label>
                    <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-200 w-5 h-5 transition-colors group-focus-within:text-white" />
                        <input 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-blue-200/30 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:bg-white/10 transition-all"
                            placeholder="usuario@destinospp.com"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-blue-100 text-sm font-semibold ml-1">Contraseña</label>
                    <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-200 w-5 h-5 transition-colors group-focus-within:text-white" />
                        <input 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-blue-200/30 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:bg-white/10 transition-all"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                </div>

                {error && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-3 text-red-200 text-sm bg-red-500/20 p-4 rounded-xl border border-red-500/30 backdrop-blur-md"
                    >
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        {error}
                    </motion.div>
                )}

                <button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-blue-600 to-[#000080] hover:from-blue-500 hover:to-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg hover:shadow-[0_0_25px_rgba(59,130,246,0.6)] transform transition-all duration-300 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 mt-4"
                >
                    Entrar al Ecosistema <ArrowRight className="w-5 h-5" />
                </button>
            </form>

            <div className="mt-8 text-center">
                <a href="#" className="text-sm text-blue-200/70 hover:text-white transition-colors underline decoration-blue-200/30 underline-offset-4">¿Olvidaste tu contraseña?</a>
            </div>
        </motion.div>
    </div>
  );
};

export default LoginPage;