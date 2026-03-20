"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Hotel, Plus, Search, Loader2, AlertCircle, CheckCircle2, 
  Settings2, Home, X, Edit
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "react-hot-toast";

import { TiposTable, TipoHabitacion } from "@/components/admin/habitaciones/TiposTable";
import { TipoModal } from "@/components/admin/habitaciones/TipoModal";
import { HabitacionesTable, Habitacion } from "@/components/admin/habitaciones/HabitacionesTable";
import { HabitacionModal } from "@/components/admin/habitaciones/HabitacionModal";
import { useAuth } from "@/context/AuthContext";

type Tab = 'TIPOS' | 'HABITACIONES';

export default function AdminHabitacionesPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('TIPOS');
  
  // States - Tipos
  const [tipos, setTipos] = useState<TipoHabitacion[]>([]);
  const [isTiposLoading, setIsTiposLoading] = useState(false);
  const [isTiposModalOpen, setIsTiposModalOpen] = useState(false);
  const [tipoSearchTerm, setTipoSearchTerm] = useState("");
  const [editingTipo, setEditingTipo] = useState<TipoHabitacion | null>(null);

  // States - Habitaciones
  const [habitaciones, setHabitaciones] = useState<Habitacion[]>([]);
  const [isHabitacionesLoading, setIsHabitacionesLoading] = useState(false);
  const [isHabitacionesModalOpen, setIsHabitacionesModalOpen] = useState(false);
  const [habitacionSearchTerm, setHabitacionSearchTerm] = useState("");
  const [editingHabitacion, setEditingHabitacion] = useState<Habitacion | null>(null);

  // Global UI States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isForbidden, setIsForbidden] = useState(false);
  const [errorHeader, setErrorHeader] = useState<string | null>(null);

  // FETCH DATA
  const fetchTipos = async () => {
    try {
      setIsTiposLoading(true);
      setErrorHeader(null);
      const res = await api.get('/tipo-habitaciones');
      setTipos(res.data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        router.push("/login"); return;
      }
      if (err.response?.status === 403) {
        setIsForbidden(true); return;
      }
      setErrorHeader("Error al cargar Tipos de Habitación");
    } finally {
      setIsTiposLoading(false);
    }
  };

  const fetchHabitaciones = async () => {
    try {
      setIsHabitacionesLoading(true);
      setErrorHeader(null);
      const res = await api.get('/habitaciones');
      setHabitaciones(res.data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        router.push("/login"); return;
      }
      if (err.response?.status === 403) {
        setIsForbidden(true); return;
      }
      setErrorHeader("Error al cargar Habitaciones Físicas");
    } finally {
      setIsHabitacionesLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!user || user.rol !== 'ADMIN') {
        setIsForbidden(true);
      } else {
        fetchTipos();
        fetchHabitaciones();
      }
    }
  }, [user, authLoading]);

  // FILTERS
  const filteredTipos = tipos.filter(t => t.nombre.toLowerCase().includes(tipoSearchTerm.toLowerCase()));
  const filteredHabitaciones = habitaciones.filter(h => h.numero.toString().includes(habitacionSearchTerm));

  // SUBMIT HANDLERS
  const handleCreateTipoSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const payload = {
        nombre: formData.get("nombre") as string,
        precioHora: Number(formData.get("precioHora")),
        precioAmanecida: Number(formData.get("precioAmanecida")),
        precioHoraExtra: Number(formData.get("precioHoraExtra")),
        horasIncluidas: Number(formData.get("horasIncluidas")),
        tieneMinibar: formData.get("tieneMinibar") === "on",
        tieneParqueadero: formData.get("tieneParqueadero") === "on",
    };

    try {
      setIsSubmitting(true);
      if (editingTipo) {
         await api.patch('/tipo-habitaciones/' + editingTipo.id, payload);
         toast.success("Categoría actualizada");
      } else {
         await api.post('/tipo-habitaciones', payload);
         toast.success("Categoría creada con éxito");
      }
      setIsTiposModalOpen(false);
      setEditingTipo(null);
      fetchTipos();
    } catch (error: any) {
      const msg = error.response?.data?.message || "Error al crear el Tipo de Habitación";
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateHabitacionSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const payload = {
        numero: Number(formData.get("numero")),
        estado: formData.get("estado") as string,
        tipoHabitacionId: Number(formData.get("tipoHabitacionId")),
    };

    try {
      setIsSubmitting(true);
      if (editingHabitacion) {
          await api.patch('/habitaciones/' + editingHabitacion.id, payload);
          toast.success(`Habitación ${payload.numero} actualizada`);
      } else {
          await api.post('/habitaciones', payload);
          toast.success(`Habitación ${payload.numero} añadida`);
      }
      setIsHabitacionesModalOpen(false);
      setEditingHabitacion(null);
      fetchHabitaciones();
    } catch (error: any) {
      const msg = error.response?.data?.message || "Error al añadir la Habitación";
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // FORBIDDEN & LOADING UI
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (isForbidden) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center font-sans p-6">
        <div className="bg-white p-10 max-w-lg w-full rounded-2xl shadow-lg border border-red-100 flex flex-col items-center text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mb-6" />
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Acceso Denegado</h1>
          <p className="text-gray-500 font-medium mb-6">Solo el Administrador Principal puede acceder a la Configuración de Habitaciones.</p>
          <button onClick={() => router.push('/recepcion')} className="bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 px-6 rounded-xl">Volver a Recepción</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10 font-sans text-gray-900">
      
      <div className="max-w-7xl mx-auto space-y-6">
        
        <header className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            <Hotel className="w-8 h-8 text-indigo-600" /> Conf. de Habitaciones
          </h1>
          <p className="text-gray-500 font-medium mt-2">Administra las características, precios y capacidad física del Motel.</p>
        </header>

        {errorHeader && (
          <div className="bg-red-50 text-red-700 px-6 py-4 rounded-xl border border-red-200 flex items-center gap-3 font-medium">
             <AlertCircle className="w-6 h-6" /> {errorHeader}
          </div>
        )}

        {/* TABS CONTAINER */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex border-b border-gray-200">
                <button 
                  onClick={() => setActiveTab('TIPOS')}
                  className={`flex-1 py-4 px-6 text-sm sm:text-base font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'TIPOS' ? 'bg-indigo-50/50 text-indigo-700 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'}`}
                >
                    <Settings2 className="w-5 h-5" /> Categorías / Tipos
                </button>
                <button 
                  onClick={() => setActiveTab('HABITACIONES')}
                  className={`flex-1 py-4 px-6 text-sm sm:text-base font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'HABITACIONES' ? 'bg-indigo-50/50 text-indigo-700 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'}`}
                >
                    <Home className="w-5 h-5" /> Físicas Numeradas
                </button>
            </div>

            {/* TAB CONTENT: TIPOS */}
            {activeTab === 'TIPOS' && (
                <div className="animate-in fade-in duration-300">
                    <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50">
                        <div className="relative w-full sm:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar categoría..."
                                value={tipoSearchTerm}
                                onChange={(e) => setTipoSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 font-medium outline-none"
                            />
                        </div>
                        <button onClick={() => setIsTiposModalOpen(true)} className="bg-indigo-600 w-full sm:w-auto hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm">
                            <Plus className="w-5 h-5" /> Nueva Categoría
                        </button>
                    </div>

                    {isTiposLoading ? (
                        <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-indigo-600" /></div>
                    ) : filteredTipos.length === 0 ? (
                        <div className="text-center py-20 text-gray-400 font-medium">No se encontraron categorías.</div>
                    ) : (
                        <TiposTable 
                            tipos={filteredTipos} 
                            onEdit={(t) => {
                                setEditingTipo(t);
                                setIsTiposModalOpen(true);
                            }}
                        />
                    )}
                </div>
            )}

            {/* TAB CONTENT: HABITACIONES */}
            {activeTab === 'HABITACIONES' && (
                <div className="animate-in fade-in duration-300">
                    <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50">
                        <div className="relative w-full sm:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar por número..."
                                value={habitacionSearchTerm}
                                onChange={(e) => setHabitacionSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 font-medium outline-none"
                            />
                        </div>
                        <button onClick={() => setIsHabitacionesModalOpen(true)} disabled={tipos.length === 0} title={tipos.length === 0 ? "Crea una categoría primero" : ""} className="bg-indigo-600 w-full disabled:bg-indigo-300 sm:w-auto hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm">
                            <Plus className="w-5 h-5" /> Registrar Número
                        </button>
                    </div>

                    {isHabitacionesLoading ? (
                        <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-indigo-600" /></div>
                    ) : filteredHabitaciones.length === 0 ? (
                        <div className="text-center py-20 text-gray-400 font-medium">No se encontraron habitaciones físicas registradas.</div>
                    ) : (
                        <HabitacionesTable
                             habitaciones={filteredHabitaciones}
                             onEdit={(h) => {
                                 setEditingHabitacion(h);
                                 setIsHabitacionesModalOpen(true);
                             }}
                        />
                    )}
                </div>
            )}
        </div>
      </div>

      <TipoModal 
         isOpen={isTiposModalOpen} 
         onClose={() => { setIsTiposModalOpen(false); setEditingTipo(null); }} 
         onSubmit={handleCreateTipoSubmit} 
         editingTipo={editingTipo} 
         isSubmitting={isSubmitting} 
      />

      <HabitacionModal 
         isOpen={isHabitacionesModalOpen} 
         onClose={() => { setIsHabitacionesModalOpen(false); setEditingHabitacion(null); }} 
         onSubmit={handleCreateHabitacionSubmit} 
         editingHabitacion={editingHabitacion} 
         tipos={tipos} 
         isSubmitting={isSubmitting} 
      />

    </div>
  );
}
