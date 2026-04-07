'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/src/config/api';
import { 
  History, 
  User, 
  Clock, 
  Info, 
  ShieldAlert, 
  Loader2, 
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Banknote,
  TrendingUp,
  Percent,
  Wallet
} from 'lucide-react';

interface LogAuditoria {
  id: number;
  usuario: string;
  accion: string;
  detalles: string;
  fecha: string;
  sedeId: number;
}

interface StatsDashboard {
  ventasHoy: number;
  ocupacion: number;
  cajaActual: number;
}

export default function AuditoriaPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [logs, setLogs] = useState<LogAuditoria[]>([]);
  const [stats, setStats] = useState<StatsDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Redirección si no es Admin
    if (user && user.rol !== 'ADMIN') {
      router.push('/recepcion');
    }
  }, [user, router]);

  const fetchStats = async () => {
    if (!token) return;
    try {
      const response = await fetch(`${API_URL}/dashboard/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const fetchLogs = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/auditoria`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('No se pudieron cargar los registros de auditoría');
      }

      const data = await response.json();
      setLogs(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && user?.rol === 'ADMIN') {
      fetchLogs();
      fetchStats();
    }
  }, [token, user]);



  const getActionStyles = (action: string) => {
    const act = action.toUpperCase();
    if (act.includes('CHECK_IN')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (act.includes('CHECK_OUT')) return 'bg-rose-50 text-rose-700 border-rose-200';
    if (act.includes('EGRESO')) return 'bg-orange-600 text-white border-orange-700 font-black';
    if (act.includes('COBRO') || act.includes('PAGO')) return 'bg-green-500 text-white border-green-600 font-bold';
    return 'bg-slate-50 text-slate-700 border-slate-200';
  };

  const getActionIcon = (action: string) => {
    const act = action.toUpperCase();
    if (act.includes('CHECK_IN')) return <CheckCircle2 className="w-3 h-3" />;
    if (act.includes('CHECK_OUT')) return <XCircle className="w-3 h-3" />;
    if (act.includes('COBRO') || act.includes('PAGO') || act.includes('EGRESO')) return <Banknote className="w-3 h-3" />;
    return <Info className="w-3 h-3" />;
  };

  const formatFecha = (fechaStr: string) => {
    const fecha = new Date(fechaStr);
    return new Intl.DateTimeFormat('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(fecha);
  };

  if (!user || user.rol !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-rose-100">
          <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8 text-rose-500" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-2">Acceso Denegado</h1>
          <p className="text-slate-500 font-medium mb-6">Esta sección es de uso exclusivo para administradores.</p>
          <button 
            onClick={() => router.push('/recepcion')}
            className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg"
          >
            Volver a Recepción
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <main className="max-w-3xl mx-auto px-4 pt-8">
        <div className="flex flex-col gap-1 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-200">
              <History className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Panel de Control</h1>
          </div>
          <p className="text-slate-500 font-bold ml-12">Resumen financiero y auditoría</p>
        </div>

        {/* Dashboard Financiero Rápido */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ventas Hoy</span>
              <span className="text-lg font-black text-slate-900">
                {stats ? `$${stats.ventasHoy.toLocaleString()}` : <div className="h-6 w-20 bg-slate-100 animate-pulse rounded" />}
              </span>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Percent className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ocupación</span>
              <span className="text-lg font-black text-slate-900">
                 {stats ? `${stats.ocupacion}%` : <div className="h-6 w-12 bg-slate-100 animate-pulse rounded" />}
              </span>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Wallet className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Caja Actual</span>
              <span className="text-lg font-black text-slate-900">
                {stats ? `$${stats.cajaActual.toLocaleString()}` : <div className="h-6 w-20 bg-slate-100 animate-pulse rounded" />}
              </span>
            </div>
          </div>
        </div>

        <div className="h-px bg-slate-200 w-full mb-8"></div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-500">
            <div className="relative">
              <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
              <div className="absolute inset-0 bg-indigo-600/10 rounded-full blur-xl animate-pulse"></div>
            </div>
            <p className="mt-4 text-indigo-600 font-black tracking-widest text-xs uppercase">Sincronizando registros...</p>
          </div>
        ) : error ? (
          <div className="bg-rose-50 border border-rose-200 p-6 rounded-2xl text-center">
            <Info className="w-8 h-8 text-rose-500 mx-auto mb-2" />
            <p className="text-rose-700 font-bold">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 text-rose-600 text-sm font-black underline underline-offset-4"
            >
              Reintentar
            </button>
          </div>
        ) : (
          <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
              <History className="w-4 h-4" /> Movimientos Recientes
            </h2>
            {logs.length === 0 ? (
              <div className="bg-white border-2 border-dashed border-slate-200 p-12 rounded-3xl text-center">
                <Search className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-400 font-bold">No se encontraron movimientos hoy</p>
              </div>
            ) : (
              logs.map((log) => (
                <div 
                  key={log.id} 
                  className="group bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md hover:border-indigo-100 transition-all active:scale-[0.98]"
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border transition-colors ${getActionStyles(log.accion)}`}>
                      {getActionIcon(log.accion)}
                      {log.accion}
                    </span>
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Clock className="w-3.5 h-3.5" />
                      <span className="text-[11px] font-bold">{formatFecha(log.fecha)}</span>
                    </div>
                  </div>

                  <p className="text-slate-800 font-black text-lg leading-tight mb-4 group-hover:text-indigo-900 transition-colors">
                    {log.detalles}
                  </p>

                  <div className="flex items-center gap-2 p-3 bg-slate-50/80 border border-slate-100 rounded-xl">
                    <div className="p-1.5 bg-white rounded-lg shadow-sm">
                      <User className="w-4 h-4 text-slate-400" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider leading-none mb-0.5">Responsable</span>
                      <span className="text-sm font-black text-slate-900">{log.usuario}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
            
            <p className="text-center text-slate-300 text-[10px] font-black uppercase tracking-[0.2em] py-8">
              &mdash; Fin del registro (Últimos 50) &mdash;
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
