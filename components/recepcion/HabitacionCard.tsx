import { BedDouble, CheckCircle, Clock, AlertCircle, CalendarClock, CircleDollarSign, Key, ShoppingBag, Printer, Brush, Loader2 } from 'lucide-react';

export interface Habitacion {
  id: number;
  numero: number;
  estado: 'LIBRE' | 'OCUPADA' | 'LIMPIEZA';
  tipoHabitacion: {
    nombre: string;
    precioHora: number;
  };
  estadias?: { id: number }[];
}

interface HabitacionCardProps {
  hab: Habitacion;
  processingId: number | null;
  onCheckinClick: (id: number) => void;
  onMinibarClick: (hab: Habitacion) => void;
  onCheckoutClick: (hab: Habitacion) => void;
  onLimpiezaClick: (id: number) => void;
}

export function HabitacionCard({
  hab,
  processingId,
  onCheckinClick,
  onMinibarClick,
  onCheckoutClick,
  onLimpiezaClick,
}: HabitacionCardProps) {

  const getCardStyles = (estado: Habitacion['estado']) => {
    switch (estado) {
      case 'LIBRE':
        return 'border-t-4 border-emerald-500 bg-white shadow-md hover:shadow-2xl hover:bg-emerald-50/30 transition-all duration-300';
      case 'OCUPADA':
        return 'border-t-4 border-rose-500 bg-rose-50/20 shadow-md hover:shadow-2xl transition-all duration-300';
      case 'LIMPIEZA':
        return 'border-t-4 border-amber-500 bg-amber-50/20 shadow-md hover:shadow-2xl transition-all duration-300';
      default:
        return 'border-gray-200 bg-white shadow-lg';
    }
  };

  const getStatusIcon = (estado: Habitacion['estado']) => {
    switch (estado) {
      case 'LIBRE':
        return <CheckCircle className="w-8 h-8 text-emerald-500" />;
      case 'OCUPADA':
        return <BedDouble className="w-8 h-8 text-rose-500" />;
      case 'LIMPIEZA':
        return <Clock className="w-8 h-8 text-amber-500" />;
      default:
        return <AlertCircle className="w-8 h-8 text-gray-400" />;
    }
  };

  const getStatusTextColor = (estado: Habitacion['estado']) => {
    switch (estado) {
      case 'LIBRE':
        return 'text-emerald-700';
      case 'OCUPADA':
        return 'text-rose-700';
      case 'LIMPIEZA':
        return 'text-amber-700';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div
      className={`flex flex-col rounded-2xl p-6 backdrop-blur-sm transform hover:-translate-y-1 hover:z-10 ${getCardStyles(
        hab.estado
      )}`}
    >
      {/* Cabecera de la Tarjeta */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Habitación</span>
          <h2 className="text-4xl font-black text-gray-900 mt-1">{hab.numero}</h2>
        </div>
        <div className="bg-white/90 p-3 rounded-2xl shadow-sm border border-gray-100 backdrop-blur-md">
          {getStatusIcon(hab.estado)}
        </div>
      </div>

      <div className="mt-2 mb-6">
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold bg-white/80 shadow-sm backdrop-blur-md border border-white/50 ${getStatusTextColor(hab.estado)}`}>
          <span className="relative flex h-2.5 w-2.5">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${hab.estado === 'LIBRE' ? 'bg-emerald-400' : hab.estado === 'OCUPADA' ? 'bg-rose-400' : 'bg-amber-400'}`}></span>
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${hab.estado === 'LIBRE' ? 'bg-emerald-500' : hab.estado === 'OCUPADA' ? 'bg-rose-500' : 'bg-amber-500'}`}></span>
          </span>
          {hab.estado}
        </div>
      </div>

      {/* Detalles de la habitación */}
      <div className="mt-auto space-y-4 pt-5 border-t border-gray-100/80">
        <div className="flex items-center gap-3 text-gray-600">
          <div className="p-2 bg-gray-50 rounded-xl">
             <CalendarClock className="w-5 h-5 text-indigo-500" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Categoría</span>
            <span className="text-sm font-black text-gray-800">{hab.tipoHabitacion.nombre}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-gray-600">
          <div className="p-2 bg-gray-50 rounded-xl">
             <CircleDollarSign className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tarifa Base</span>
            <span className="text-sm font-black text-gray-800">${hab.tipoHabitacion.precioHora.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Acciones Condicionales por Estado */}
      <div className="mt-6">
        {hab.estado === 'LIBRE' && (
          <button
            onClick={() => onCheckinClick(hab.id)}
            className="w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold py-3.5 px-4 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 transform active:scale-95"
          >
            <Key className="w-5 h-5" />
            Check-in Rápido
          </button>
        )}

        {hab.estado === 'OCUPADA' && (
          <div className="flex flex-col gap-3">
            <button
              onClick={() => onMinibarClick(hab)}
              className="w-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 transform active:scale-95"
            >
              <ShoppingBag className="w-5 h-5" />
              Cargar Minibar
            </button>
            <button
              onClick={() => onCheckoutClick(hab)}
              className="w-full bg-white border-2 border-rose-500 text-rose-600 hover:bg-rose-50 active:bg-rose-100 font-bold py-3 px-4 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 transform active:scale-95"
            >
              <Printer className="w-5 h-5" />
              Cerrar e Imprimir
            </button>
          </div>
        )}

        {hab.estado === 'LIMPIEZA' && (
          <button
            onClick={() => onLimpiezaClick(hab.id)}
            disabled={processingId === hab.id}
            className="w-full bg-amber-500 hover:bg-amber-600 active:bg-amber-700 disabled:bg-amber-300 text-white font-bold py-3.5 px-4 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 transform active:scale-95"
          >
            {processingId === hab.id ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <Brush className="w-5 h-5" />
                Habilitar Habitación
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
