"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BedDouble, AlertCircle, Loader2 } from 'lucide-react';
import ModalMinibar from '@/components/ModalMinibar';

import { HabitacionCard, Habitacion } from '@/components/recepcion/HabitacionCard';
import { CheckinModal } from '@/components/recepcion/CheckinModal';
import { useAuth } from '@/context/AuthContext';

export default function RecepcionDashboard() {
  const [habitaciones, setHabitaciones] = useState<Habitacion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);
  
  // Modals state
  const [isCheckinModalOpen, setIsCheckinModalOpen] = useState(false);
  const [selectedHabitacionId, setSelectedHabitacionId] = useState<number | null>(null);
  const [selectedMinibarHabitacion, setSelectedMinibarHabitacion] = useState<{ id: number; numero: number; estadiaId: number } | null>(null);
  
  const [isSubmittingCheckin, setIsSubmittingCheckin] = useState(false);
  
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [isForbidden, setIsForbidden] = useState(false);

  // Authentication & Role Check
  useEffect(() => {
    if (!authLoading) {
      if (!user || (user.rol !== 'RECEPCION' && user.rol !== 'ADMIN')) {
         setIsForbidden(true);
      } else {
         fetchHabitaciones();
      }
    }
  }, [user, authLoading]);

  const fetchHabitaciones = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('motel_token');
      if (!token) {
        router.push('/login');
        return;
      }

      const res = await fetch('http://localhost:3000/habitaciones', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (res.status === 401) {
        localStorage.removeItem('motel_token');
        router.push('/login');
        return;
      }

      if (!res.ok) {
        throw new Error('Error al cargar las habitaciones del servidor.');
      }
      const data = await res.json();
      setHabitaciones(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido al conectar con la API.');
    } finally {
      if (localStorage.getItem('motel_token')) {
        setLoading(false);
      }
    }
  };



  const handleMarcarLimpia = async (id: number) => {
    try {
      setProcessingId(id);

      const token = localStorage.getItem('motel_token');
      if (!token) {
        router.push('/login');
        return;
      }

      const res = await fetch(`http://localhost:3000/habitaciones/${id}/limpiar`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (res.status === 401) {
        localStorage.removeItem('motel_token');
        router.push('/login');
        return;
      }

      if (!res.ok) {
        throw new Error('No se pudo actualizar el estado de la habitación.');
      }

      // Actualizamos el estado localmente de manera optimista
      setHabitaciones((prevHabitaciones) =>
        prevHabitaciones.map((hab) =>
          hab.id === id ? { ...hab, estado: 'LIBRE' } : hab
        )
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error inesperado al marcar la habitación como limpia.');
    } finally {
      setProcessingId(null);
    }
  };

  const cerrarEImprimir = async (habitacion: Habitacion) => {
    try {
      const estadiaId = habitacion.estadias?.[0]?.id;
      if (!estadiaId) {
        throw new Error('No se encontró una estadía activa para esta habitación.');
      }

      const token = localStorage.getItem('motel_token');
      if (!token) {
        throw new Error('No autorizado. Por favor inicie sesión.');
      }

      // 1. Finalizar estadía
      const patchRes = await fetch(`http://localhost:3000/estadia/${estadiaId}/finalizar`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!patchRes.ok) {
        let errorMessage = 'Error al finalizar la estadía';
        try {
          const errorData = await patchRes.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // Si no hay body JSON, se usa el mensaje por defecto
        }
        throw new Error(errorMessage);
      }

      // 2. Imprimir recibo
      const res = await fetch(`http://localhost:3000/facturacion/recibo/${habitacion.id}`);
      if (!res.ok) throw new Error('Error al generar el recibo');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      setTimeout(() => window.URL.revokeObjectURL(url), 60000);

      // 3. Recargar dashboard
      fetchHabitaciones();
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : 'Hubo un error al cerrar e imprimir el recibo.');
    }
  };

  const handleCheckin = async (tipoServicio: 'POR_HORAS' | 'AMANECIDA') => {
    if (!selectedHabitacionId) return;

    try {
      setIsSubmittingCheckin(true);
      const token = localStorage.getItem('motel_token');
      if (!token) {
        throw new Error('No autorizado. Por favor inicie sesión.');
      }

      // Decodificar el JWT para obtener el ID del usuario (sub)
      let usuarioId;
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        usuarioId = payload.sub;
      } catch (e) {
        throw new Error('Token inválido. Vuelva a iniciar sesión.');
      }

      if (!usuarioId) {
        throw new Error('No se pudo identificar al usuario de la sesión.');
      }

      const res = await fetch('http://localhost:3000/estadia', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          habitacionId: selectedHabitacionId,
          usuarioId,
          tipoServicio
        })
      });

      if (!res.ok) {
        let errorMessage = 'Error al registrar el check-in.';
        try {
          const errorData = await res.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) { }
        throw new Error(errorMessage);
      }

      // Éxito
      setIsCheckinModalOpen(false);
      setSelectedHabitacionId(null);
      alert('¡Check-in realizado con éxito!');
      fetchHabitaciones(); // Recargar datos
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al realizar el check-in.');
    } finally {
      setIsSubmittingCheckin(false);
    }
  };

  const openCheckinModal = (id: number) => {
    setSelectedHabitacionId(id);
    setIsCheckinModalOpen(true);
  };

  const openMinibarModal = (hab: Habitacion) => {
    const estadiaId = hab.estadias?.[0]?.id;
    if (!estadiaId) {
      alert("No hay una estadía activa para abrir el minibar en esta habitación.");
      return;
    }
    setSelectedMinibarHabitacion({ id: hab.id, numero: hab.numero, estadiaId });
  };

  if (authLoading || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mb-4" />
        <p className="text-lg text-gray-600 font-bold animate-pulse">Cargando Tablero de Recepción...</p>
      </div>
    );
  }

  if (isForbidden) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center font-sans p-6">
        <div className="bg-white p-10 max-w-lg w-full rounded-3xl shadow-xl border border-red-100 flex flex-col items-center text-center">
          <AlertCircle className="w-20 h-20 text-red-500 mb-6" />
          <h1 className="text-3xl font-black text-gray-900 mb-2">Acceso Restringido</h1>
          <p className="text-gray-500 font-bold mb-8">Esta área es exclusiva para el personal de Recepción o Administración.</p>
          <button onClick={() => router.push('/login')} className="w-full bg-gray-900 hover:bg-gray-800 text-white font-black py-4 px-6 rounded-2xl shadow-xl transform active:scale-95 transition-all">Ir al Inicio de Sesión</button>
        </div>
      </div>
    );
  }

  if (error !== null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
        <div className="bg-red-50 border-2 border-red-200 text-red-800 px-8 py-8 rounded-2xl flex flex-col items-center shadow-sm max-w-md w-full text-center">
          <AlertCircle className="w-14 h-14 mb-4 text-red-500" />
          <h2 className="text-xl font-bold mb-2">Error de conexión</h2>
          <p className="text-red-600/80 mb-6">{error}</p>
          <button
            onClick={fetchHabitaciones}
            className="w-full py-3 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-xl transition-all font-semibold shadow-sm hover:shadow-md"
          >
            Volver a intentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10 font-sans text-gray-900">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
              Recepción Dashboard
            </h1>
            <p className="text-gray-500 font-medium mt-2 text-lg">
              Monitoreo y control de habitaciones en tiempo real
            </p>
          </div>

          {/* Leyenda visual */}
          <div className="flex flex-wrap items-center gap-4 text-sm font-semibold text-gray-700 bg-gray-50 py-3 px-6 rounded-xl border border-gray-200">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-green-500 shadow-sm ring-2 ring-white ring-offset-1"></span> Libre
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-red-500 shadow-sm ring-2 ring-white ring-offset-1"></span> Ocupada
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-yellow-500 shadow-sm ring-2 ring-white ring-offset-1"></span> Limpieza
            </div>
          </div>
        </header>

        {/* Empty State / Grid de habitaciones */}
        {habitaciones.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-gray-200 shadow-sm">
            <BedDouble className="w-20 h-20 text-gray-300 mb-6" />
            <h3 className="text-2xl font-bold text-gray-800 mb-3">No hay habitaciones disponibles</h3>
            <p className="text-gray-500 text-center max-w-md text-lg">
              Aún no se ha registrado ninguna habitación en el sistema. Por favor configure las habitaciones desde el panel de administrador.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {habitaciones.map((hab) => (
              <HabitacionCard
                key={hab.id}
                hab={hab}
                processingId={processingId}
                onCheckinClick={openCheckinModal}
                onMinibarClick={openMinibarModal}
                onCheckoutClick={cerrarEImprimir}
                onLimpiezaClick={handleMarcarLimpia}
              />
            ))}
          </div>
        )}
      </div>

      <CheckinModal
        isOpen={isCheckinModalOpen}
        onClose={() => setIsCheckinModalOpen(false)}
        onSubmit={handleCheckin}
        isSubmitting={isSubmittingCheckin}
      />

      {/* Modal de Minibar */}
      {selectedMinibarHabitacion && (
        <ModalMinibar
          estadiaId={selectedMinibarHabitacion.estadiaId}
          habitacionNumero={selectedMinibarHabitacion.numero}
          onClose={() => setSelectedMinibarHabitacion(null)}
          onSuccess={() => {
            setSelectedMinibarHabitacion(null);
            fetchHabitaciones();
          }}
        />
      )}
    </div>
  );
}
