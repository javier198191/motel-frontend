"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { formatColombiaDate } from "@/lib/formatters";
import toast, { Toaster } from "react-hot-toast";
import { Loader2, DollarSign, CreditCard, Landmark, CheckCircle, AlertCircle, Clock, Wallet } from "lucide-react";

interface CajaActiva {
  id: number;
  saldoInicial: number;
  totalIngresos: number;
  totalEgresos: number;
  turno: string;
  fechaApertura: string;
  estado: string;
}

export default function RecepcionCajaPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [caja, setCaja] = useState<CajaActiva | null>(null);
  const [loadingCaja, setLoadingCaja] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states - Declaración de cierre
  const [efectivoDeclarado, setEfectivoDeclarado] = useState<number | "">("");
  const [tarjetaDeclarado, setTarjetaDeclarado] = useState<number | "">("");
  const [transferenciaDeclarada, setTransferenciaDeclarada] = useState<number | "">("");

  // Form states - Apertura
  const [baseInicial, setBaseInicial] = useState<number | "">("");

  // Result state after closing
  const [resultadoCierre, setResultadoCierre] = useState<any>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!user || user.rol !== "RECEPCION" && user.rol !== "ADMIN") {
        router.push("/recepcion");
        return;
      }
      fetchCajaActiva();
    }
  }, [user, authLoading, router]);

  const fetchCajaActiva = async () => {
    try {
      setLoadingCaja(true);
      const res = await api.get("/caja/activa");
      // Si devuelve contenido
      if (res.data) {
        setCaja(res.data);
      } else {
        setCaja(null);
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        // No hay caja activa
        setCaja(null);
      } else {
        toast.error("Error al consultar el estado de la caja.");
        console.error("fetchCajaActiva err:", error);
      }
    } finally {
      setLoadingCaja(false);
    }
  };

  const handleAbrirCaja = async (e: React.FormEvent) => {
    e.preventDefault();
    if (baseInicial === "" || baseInicial < 0) {
      toast.error("Por favor, ingrese un monto inicial válido.");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
         baseInicial: Number(baseInicial)
      };
      await api.post("/caja/abrir", payload);
      toast.success("Turno abierto exitosamente.");
      setBaseInicial("");
      fetchCajaActiva();
    } catch (error: any) {
      const msg = error.response?.data?.message || "Error al abrir la caja.";
      toast.error(typeof msg === 'string' ? msg : msg[0]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCerrarCaja = async (e: React.FormEvent) => {
    e.preventDefault();
    if (efectivoDeclarado === "" || tarjetaDeclarado === "" || transferenciaDeclarada === "") {
       toast.error("Debe declarar envíos en todas las formas de pago (use 0 si no hay dinero).");
       return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
         declaradoEfectivo: Number(efectivoDeclarado),
         declaradoTarjeta: Number(tarjetaDeclarado),
         declaradoTransferencia: Number(transferenciaDeclarada),
      };
      
      const res = await api.post(`/caja/cerrar/${caja?.id}`, payload);
      setResultadoCierre(res.data);
      toast.success("Turno cerrado con éxito.");
      setCaja(null); // La caja ya está cerrada
    } catch (error: any) {
      const msg = error.response?.data?.message || "Error al cerrar la caja.";
      toast.error(typeof msg === 'string' ? msg : msg[0]);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || loadingCaja) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
        <p className="text-gray-500 font-bold animate-pulse text-lg">Cargando estado...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10 font-sans text-gray-900">
      <Toaster position="top-right" />
      <div className="max-w-4xl mx-auto space-y-8">
        
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight flex items-center gap-4">
              <Wallet className="w-9 h-9 text-indigo-600" />
              Gestión de Caja General
            </h1>
            <p className="text-gray-500 font-medium mt-2 text-lg">
              Recepción: Apertura, declaración y cierre de turno.
            </p>
          </div>
          <div className="flex flex-col gap-1 items-end">
             <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Cajero Actual</span>
             <span className="text-lg font-black text-gray-800 bg-gray-100 px-4 py-1.5 rounded-lg">{user?.nombre || "Cargando..."}</span>
          </div>
        </header>

        {/* Modal-like card for Results after close */}
        {resultadoCierre && !caja && (
            <div className="bg-white rounded-3xl p-8 border border-emerald-100 shadow-xl relative overflow-hidden">
               <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500"></div>
               <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-emerald-100 rounded-full text-emerald-600">
                     <CheckCircle className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-gray-900">Cierre Exitoso</h2>
                    <p className="text-gray-500">Reporte del sistema generado el {formatColombiaDate(resultadoCierre.caja.fechaCierre)}</p>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-2xl mb-6">
                  <div>
                     <span className="block text-sm font-bold text-gray-400 uppercase mb-1">Diferencia en caja</span>
                     <span className={`text-4xl font-black ${(resultadoCierre.resumen.totalDescuadre ?? 0) < 0 ? 'text-rose-600' : (resultadoCierre.resumen.totalDescuadre ?? 0) > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>
                        ${(resultadoCierre.resumen.totalDescuadre ?? 0).toFixed(2)}
                     </span>
                     <div className="mt-2 text-md font-bold">
                        {(resultadoCierre.resumen.totalDescuadre ?? 0) < 0 && <span className="text-rose-600">⚠️ Faltante</span>}
                        {(resultadoCierre.resumen.totalDescuadre ?? 0) > 0 && <span className="text-amber-500">⚠️ Sobrante</span>}
                        {(resultadoCierre.resumen.totalDescuadre ?? 0) === 0 && <span className="text-emerald-600">✅ Cuadre perfecto</span>}
                     </div>
                  </div>
                  <div className="space-y-3 font-semibold text-gray-600">
                     <div className="flex justify-between border-b pb-2"><span className="text-gray-400">Total Esperado Sistema:</span> <span>${(resultadoCierre.resumen.efectivo.calculado + resultadoCierre.resumen.tarjeta.calculado + resultadoCierre.resumen.transferencia.calculado).toFixed(2)}</span></div>
                     <div className="flex justify-between border-b pb-2"><span className="text-gray-400">Total Declarado Físico:</span> <span>${(resultadoCierre.resumen.efectivo.declarado + resultadoCierre.resumen.tarjeta.declarado + resultadoCierre.resumen.transferencia.declarado).toFixed(2)}</span></div>
                     <div className="flex justify-between border-b pb-2"><span className="text-gray-400">Base Retirada:</span> <span>${(resultadoCierre.caja.baseInicial ?? 0).toFixed(2)}</span></div>
                  </div>
               </div>

               <button onClick={() => setResultadoCierre(null)} className="bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 px-8 rounded-xl transition-colors">Entendido e imprimir ticket (Pronto)</button>
            </div>
        )}

        {/* CERRADO - FORM APERTURA */}
        {!caja && !resultadoCierre && (
           <div className="bg-white rounded-3xl p-8 md:p-12 border border-gray-100 shadow-sm max-w-xl mx-auto flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                 <Wallet className="w-12 h-12 text-gray-400" />
              </div>
              <h2 className="text-3xl font-black text-gray-900 mb-2">La Caja está Cerrada</h2>
              <p className="text-gray-500 mb-8 max-w-sm">No puedes procesar ventas, minibares ni cerrar habitaciones hasta que inicies tu turno abriendo caja.</p>

              <form onSubmit={handleAbrirCaja} className="w-full space-y-6">
                 <div className="text-left space-y-2">
                    <label className="text-sm font-bold text-gray-700 uppercase tracking-widest pl-2">Ingresar Base Inicial de Monedas / Billetes</label>
                    <div className="relative">
                       <div className="absolute inset-y-0 left-0 flex items-center pl-5 pointer-events-none">
                          <DollarSign className="w-6 h-6 text-gray-400" />
                       </div>
                       <input 
                         type="number" 
                         min="0"
                         step="1000"
                         required
                         value={baseInicial}
                         onChange={(e) => setBaseInicial(e.target.value === "" ? "" : Number(e.target.value))}
                         className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-indigo-500 rounded-2xl text-2xl font-black text-gray-900 outline-none transition-all"
                         placeholder="0"
                       />
                    </div>
                 </div>

                 <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-black py-4 px-6 rounded-2xl shadow-xl hover:shadow-indigo-500/30 transition-all flex justify-center items-center gap-2 text-lg transform active:scale-95 disabled:opacity-75 disabled:active:scale-100"
                 >
                    {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Wallet className="w-6 h-6" />}
                    {isSubmitting ? "Abriendo Turno..." : "Abrir Turno"}
                 </button>
              </form>
           </div>
        )}

        {/* ABIERTA - FORM CIERRE */}
        {caja && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Informacion lateral state */}
            <div className="lg:col-span-1 space-y-6">
                <div className="bg-indigo-50/50 border border-indigo-100 rounded-3xl p-6">
                   <div className="flex items-center gap-3 mb-6">
                       <span className="relative flex h-4 w-4">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-4 w-4 bg-indigo-500"></span>
                       </span>
                       <h3 className="text-xl font-black text-indigo-900">Caja Activa</h3>
                   </div>
                   <div className="space-y-4">
                      <div className="flex items-start gap-4 p-4 bg-white rounded-2xl shadow-sm border border-indigo-50">
                         <Clock className="w-6 h-6 text-indigo-400 mt-1" />
                         <div>
                            <span className="block text-xs font-bold uppercase text-indigo-400 tracking-wider">Hora Apertura</span>
                            <span className="block text-lg font-black text-gray-900">{formatColombiaDate(caja.fechaApertura)}</span>
                         </div>
                      </div>
                      <div className="flex items-start gap-4 p-4 bg-white rounded-2xl shadow-sm border border-indigo-50">
                         <DollarSign className="w-6 h-6 text-indigo-400 mt-1" />
                         <div>
                            <span className="block text-xs font-bold uppercase text-indigo-400 tracking-wider">Base Inicial Vueltos</span>
                            <span className="block text-lg font-black text-gray-900">${caja.saldoInicial.toFixed(2)}</span>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                   <h3 className="font-black text-gray-900 mb-2 flex items-center gap-2"><AlertCircle className="w-5 h-5 text-gray-400"/> Instrucciones</h3>
                   <p className="text-gray-500 text-sm leading-relaxed">Antes de cerrar la caja, por favor cuenta todo el dinero físico que hay en el cajón de efectivo, la sumatoria de vouchers del datáfono (Tarjetas) y las transferencias confirmadas (Nequi/Cuentas). Repórtalos en los campos a la derecha.</p>
                </div>
            </div>

            {/* Formulario de Cierre de Caja */}
            <div className="lg:col-span-2">
                <form onSubmit={handleCerrarCaja} className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl space-y-8">
                   <h2 className="text-2xl font-black text-gray-900 border-b pb-4">Declaración de Fondos</h2>

                   <div className="space-y-6">
                      <div className="space-y-2">
                         <label className="text-sm font-bold text-gray-700 uppercase tracking-widest pl-2">Total Billetes / Monedas de Ventas</label>
                         <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-5 pointer-events-none">
                               <DollarSign className="w-5 h-5 text-emerald-500" />
                            </div>
                            <input type="number" min="0" required value={efectivoDeclarado} onChange={(e) => setEfectivoDeclarado(e.target.value === "" ? "" : Number(e.target.value))} className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-indigo-500 rounded-2xl text-xl font-bold outline-none transition-all placeholder:font-medium placeholder:text-gray-400" placeholder="Efectivo en gaveta (no incluye base)..." />
                         </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 uppercase tracking-widest pl-2">Monto Datáfono</label>
                            <div className="relative">
                               <div className="absolute inset-y-0 left-0 flex items-center pl-5 pointer-events-none">
                                  <CreditCard className="w-5 h-5 text-blue-500" />
                               </div>
                               <input type="number" min="0" required value={tarjetaDeclarado} onChange={(e) => setTarjetaDeclarado(e.target.value === "" ? "" : Number(e.target.value))} className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-indigo-500 rounded-2xl text-xl font-bold outline-none transition-all" placeholder="Total voucher..." />
                            </div>
                         </div>
                         <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 uppercase tracking-widest pl-2">Monto Nequi / App</label>
                            <div className="relative">
                               <div className="absolute inset-y-0 left-0 flex items-center pl-5 pointer-events-none">
                                  <Landmark className="w-5 h-5 text-purple-500" />
                               </div>
                               <input type="number" min="0" required value={transferenciaDeclarada} onChange={(e) => setTransferenciaDeclarada(e.target.value === "" ? "" : Number(e.target.value))} className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-indigo-500 rounded-2xl text-xl font-bold outline-none transition-all" placeholder="Total móvil..." />
                            </div>
                         </div>
                      </div>
                   </div>

                   <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-black py-5 px-6 rounded-2xl shadow-xl hover:shadow-rose-500/30 transition-all flex justify-center items-center gap-3 text-lg transform active:scale-95 disabled:opacity-75 tracking-wide"
                   >
                      {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <AlertCircle className="w-6 h-6" />}
                      {isSubmitting ? "Calculando Cuadre de Caja..." : "Generar Cierre Definitivo"}
                   </button>
                </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
