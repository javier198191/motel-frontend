"use client";

import { useState, useEffect } from "react";
import { X, CreditCard, Banknote, Landmark, Loader2, AlertCircle } from "lucide-react";
import api from "@/lib/api";
import { toast } from "react-hot-toast";
import { API_URL } from "@/src/config/api";

type MetodoPago = "EFECTIVO" | "TARJETA" | "TRANSFERENCIA";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  habitacionId: number | null;
  estadiaId: number | null;
  numero: string | number;
  tipo: string;
  onConfirm: (estadiaId: number, montoEfectivo: number, montoTarjeta: number, montoTransferencia: number) => Promise<void>;
}

export function CheckoutModal({ isOpen, onClose, habitacionId, estadiaId, numero, tipo, onConfirm }: CheckoutModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [totalAPagar, setTotalAPagar] = useState<number>(0);
  
  type ModoCobro = 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA' | 'MIXTO' | null;
  const [modoCobro, setModoCobro] = useState<ModoCobro>(null);

  const [montoEfectivo, setEfectivo] = useState<number>(0);
  const [montoTarjeta, setTarjeta] = useState<number>(0);
  const [montoTransferencia, setTransferencia] = useState<number>(0);
  
  const [isLoadingPrev, setIsLoadingPrev] = useState(false);

  // Intentamos pre-calcular el total sumando los consumos y un aproximado del alquiler
  // Para tener un "Total a Pagar" inicial.
  useEffect(() => {
    if (isOpen && estadiaId && habitacionId) {
      setModoCobro(null);
      
      const calcularTotal = async () => {
        setIsLoadingPrev(true);
        try {
          const token = localStorage.getItem('motel_token');
          // Llamamos al backend para que nos dé el precio oficial con todo y horas extras
          const res = await fetch(`${API_URL}/estadia/${estadiaId}/pre-checkout`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          if (!res.ok) throw new Error('Error obteniendo liquidación');
          
          const data = await res.json();
          setTotalAPagar(data.granTotalReal);

        } catch (error) {
           console.error("Error pre-calculando", error);
        } finally {
          setIsLoadingPrev(false);
        }
      };

      calcularTotal();
    }
  }, [isOpen, estadiaId, habitacionId]);

  if (!isOpen || !habitacionId || !estadiaId) return null;

  const totalDeclarado = montoEfectivo + montoTarjeta + montoTransferencia;
  const diferencia = totalDeclarado - totalAPagar;
  const isMatch = diferencia === 0 && totalAPagar > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modoCobro) {
      toast.error("Seleccione un método de pago");
      return;
    }

    let sendEfectivo = 0, sendTarjeta = 0, sendTransferencia = 0;

    if (modoCobro === 'EFECTIVO') sendEfectivo = totalAPagar;
    else if (modoCobro === 'TARJETA') sendTarjeta = totalAPagar;
    else if (modoCobro === 'TRANSFERENCIA') sendTransferencia = totalAPagar;
    else if (modoCobro === 'MIXTO') {
       if (!isMatch) return;
       sendEfectivo = montoEfectivo;
       sendTarjeta = montoTarjeta;
       sendTransferencia = montoTransferencia;
    }

    try {
      setIsSubmitting(true);
      await onConfirm(estadiaId, sendEfectivo, sendTarjeta, sendTransferencia);
    } finally {
      setIsSubmitting(false);
      onClose();
    }
  };

  const handleAutofillEfectivo = () => { setEfectivo(totalAPagar); setTarjeta(0); setTransferencia(0); };
  const handleAutofillTarjeta = () => { setEfectivo(0); setTarjeta(totalAPagar); setTransferencia(0); };
  const handleAutofillTransferencia = () => { setEfectivo(0); setTarjeta(0); setTransferencia(totalAPagar); };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div 
        className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl transform transition-all animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
          <div>
            <h2 className="text-2xl font-black text-gray-900">Liquidar Estadía</h2>
            <p className="text-sm font-bold text-gray-500 mt-1">
              Habitación <span className="text-indigo-600">{numero}</span> • {tipo}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          
          <div className="bg-amber-50 mx-auto rounded-2xl p-4 mb-5 text-center shadow-inner relative overflow-hidden border-2 border-amber-200/50">
             <div className="absolute top-0 w-full h-1.5 bg-gradient-to-r from-amber-400 to-orange-500 left-0"></div>
             
             {isLoadingPrev ? (
                <div className="flex flex-col items-center justify-center py-6">
                   <Loader2 className="w-8 h-8 text-amber-500 animate-spin mb-2" />
                   <span className="text-sm font-medium text-amber-700">Calculando montos...</span>
                </div>
             ) : (
                <>
                  <p className="text-sm font-bold text-amber-700/80 uppercase tracking-widest mb-2">Total a Pagar</p>
                  <p className="text-5xl font-black text-amber-900 tracking-tighter drop-shadow-sm">
                     ${totalAPagar.toLocaleString()}
                  </p>
                  <p className="text-xs text-amber-600 font-medium mt-3 bg-amber-100/50 inline-block px-3 py-1 rounded-full">
                    Incluye alquiler y consumos de minibar registrados.
                  </p>
                </>
             )}
          </div>

          <div className="space-y-4 mb-6">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest pl-1">Modalidad de Pago</h3>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setModoCobro('EFECTIVO')}
                className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${modoCobro === 'EFECTIVO' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 hover:border-emerald-200 text-gray-500 hover:text-emerald-600 bg-white'}`}
              >
                <Banknote className="w-8 h-8" />
                <span className="font-bold text-sm">100% Efectivo</span>
              </button>
              
              <button
                type="button"
                onClick={() => setModoCobro('TARJETA')}
                className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${modoCobro === 'TARJETA' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-blue-200 text-gray-500 hover:text-blue-600 bg-white'}`}
              >
                <CreditCard className="w-8 h-8" />
                <span className="font-bold text-sm">100% Tarjeta</span>
              </button>
              
              <button
                type="button"
                onClick={() => setModoCobro('TRANSFERENCIA')}
                className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${modoCobro === 'TRANSFERENCIA' ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 hover:border-purple-200 text-gray-500 hover:text-purple-600 bg-white'}`}
              >
                <Landmark className="w-8 h-8" />
                <span className="font-bold text-sm">100% Transf.</span>
              </button>

              <button
                type="button"
                onClick={() => setModoCobro('MIXTO')}
                className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${modoCobro === 'MIXTO' ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-gray-200 hover:border-amber-200 text-gray-500 hover:text-amber-600 bg-white'}`}
              >
                <div className="flex -space-x-2">
                   <Banknote className="w-6 h-6 bg-white rounded-full" />
                   <CreditCard className="w-6 h-6 bg-white rounded-full relative z-10" />
                </div>
                <span className="font-bold text-sm">Cobro Mixto</span>
              </button>
            </div>
          </div>

          {modoCobro === 'MIXTO' && (
             <div className="space-y-4 mb-6 animate-in slide-in-from-top-2 fade-in duration-200">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <div className="col-span-1 md:col-span-2 relative">
                     <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                     <input
                        type="number"
                        min="0"
                        value={montoEfectivo || ''}
                        onChange={(e) => setEfectivo(Number(e.target.value) || 0)}
                        className="w-full pl-7 pr-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                        placeholder="Efectivo"
                     />
                  </div>
                  <div className="col-span-1 relative">
                     <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                     <input
                        type="number"
                        min="0"
                        value={montoTarjeta || ''}
                        onChange={(e) => setTarjeta(Number(e.target.value) || 0)}
                        className="w-full pl-7 pr-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                        placeholder="Tarjeta"
                     />
                  </div>
                  <div className="col-span-1 relative">
                     <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                     <input
                        type="number"
                        min="0"
                        value={montoTransferencia || ''}
                        onChange={(e) => setTransferencia(Number(e.target.value) || 0)}
                        className="w-full pl-7 pr-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 font-bold"
                        placeholder="Transf."
                     />
                  </div>
               </div>
               
               {/* Validation Banner (solo visible en mixto) */}
               <div className="flex flex-col items-center">
                  {!isMatch && (
                     <div className="flex items-center gap-2 text-sm font-bold text-red-500 bg-red-50 px-4 py-2 rounded-xl mb-2 w-full justify-center border border-red-100">
                       <AlertCircle className="w-4 h-4" />
                       { diferencia < 0 
                           ? `Faltan asignar $${Math.abs(diferencia).toLocaleString()} para cubrir el total.` 
                           : `Sobran $${Math.abs(diferencia).toLocaleString()}. Ajuste los montos.`
                       }
                     </div>
                  )}
                  <div className="text-gray-500 font-medium text-sm">
                     Suma: <span className={`font-black ${isMatch ? "text-emerald-600" : "text-gray-900"}`}>${totalDeclarado.toLocaleString()}</span> / ${totalAPagar.toLocaleString()}
                  </div>
               </div>
             </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || totalAPagar === 0 || !modoCobro || (modoCobro === 'MIXTO' && !isMatch)}
            className="w-full h-14 bg-gray-900 hover:bg-gray-800 text-white font-black rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-40 disabled:active:scale-100 shadow-xl disabled:cursor-not-allowed disabled:bg-gray-400 mt-4"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Validando y Generando...
              </>
            ) : (
              "Confirmar y Generar Recibo"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
