import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, FileText, CreditCard, BarChart3, ShieldCheck, Settings, LogOut, Map } from 'lucide-react';

const SidebarItem = ({ icon: Icon, label, path, active }) => (
  <Link to={path}>
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all mb-2 relative group ${
      active ? 'bg-blue-600/20 text-blue-400' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
    }`}>
      <Icon className={`w-5 h-5 ${active ? 'text-blue-400' : 'text-slate-500 group-hover:text-white'}`} />
      <span className="font-medium text-sm">{label}</span>
      {active && <motion.div layoutId="active-pill" className="absolute left-0 w-1 h-6 bg-blue-500 rounded-r-full top-1/2 -translate-y-1/2" />}
    </div>
  </Link>
);

const IntranetLayout = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname.startsWith(path);

  const getModuleTitle = () => {
    const path = location.pathname;
    
    // Módulo Administración (Prioridad alta)
    if (path.includes('admin') || path.includes('settings')) return 'Módulo: Administración';
    
    // Módulo Contabilidad
    if (path.includes('finance') || path.includes('contabilidad')) return 'Módulo: Contabilidad';
    
    // Módulo Logística
    if (path.includes('logistics')) return 'Módulo: Logística y Operaciones';

    // Módulo Corporativo
    if (path.includes('sales') || path.includes('corporativo')) return 'Módulo: Corporativo';
    
    // Módulo Vacacional (Por defecto para quotes/vacacional)
    if (path.includes('quotes') || path.includes('vacacional')) return 'Módulo: Vacacional';
    
    return 'Panel Principal';
  };

  // Verificar si estamos en el módulo de administración
  const isAdminModule = location.pathname.includes('admin') || location.pathname.includes('settings');

  return (
    <div className="flex h-screen bg-[#0f172a] overflow-hidden font-sans text-slate-300 relative">
      {/* Background 4K */}
      <div className="absolute inset-0 z-0">
        <img 
            src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&auto=format&fit=crop&w=2021&q=80" 
            alt="Travel Background" 
            className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a]/90 via-[#0f172a]/80 to-[#1e293b]/90 backdrop-blur-[2px]"></div>
      </div>

      <aside className="w-64 bg-[#1e293b]/40 backdrop-blur-xl border-r border-slate-700/30 flex flex-col hidden md:flex relative z-10">
        <div className="p-6">
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">D</div>
                Destinos P&P
            </h2>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-8 overflow-y-auto">
          <div>
            <p className="px-4 text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Principal</p>
            <SidebarItem icon={LayoutDashboard} label="Dashboard" path="/intranet/dashboard" active={location.pathname === '/intranet/dashboard'} />
            <SidebarItem icon={FileText} label="Cotización" path="/intranet/quotes" active={isActive('/intranet/quotes')} />
            <SidebarItem icon={BarChart3} label="Ventas" path="/intranet/sales" active={isActive('/intranet/sales')} />
            <SidebarItem icon={CreditCard} label="Finanzas" path="/intranet/finance" active={isActive('/intranet/finance')} />
            <SidebarItem icon={Map} label="Logística" path="/intranet/logistics" active={isActive('/intranet/logistics')} />
          </div>
          
          {/* Solo mostrar Gerencia si estamos en el módulo de Administración */}
          {isAdminModule && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                <p className="px-4 text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Gerencia</p>
                <SidebarItem icon={ShieldCheck} label="Administración" path="/intranet/admin" active={isActive('/intranet/admin')} />
                <SidebarItem icon={Settings} label="Configuración" path="/intranet/settings" active={isActive('/intranet/settings')} />
            </motion.div>
          )}
        </nav>

        <div className="p-4 border-t border-slate-700/50">
          <Link to="/">
            <button className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all text-sm font-medium">
              <LogOut className="w-4 h-4" /> Cerrar Sesión
            </button>
          </Link>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto relative z-10 p-4 md:p-8">
        {/* Dynamic Header */}
        <header className="mb-8 pb-4 border-b border-slate-700/30 flex justify-between items-center">
            <h2 className="text-xl font-bold text-white tracking-wide drop-shadow-lg">{getModuleTitle()}</h2>
            <div className="text-xs text-slate-500 font-mono bg-slate-900/50 px-2 py-1 rounded border border-slate-700/50">v2.0.0 Pro</div>
        </header>

        <Outlet />
      </main>
    </div>
  );
};

export default IntranetLayout;