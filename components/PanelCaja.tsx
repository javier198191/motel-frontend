"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, Banknote, Lock, LogOut, Loader2, ArrowDownToLine } from "lucide-react";
import { toast } from "react-hot-toast";

interface CajaData {
    id: number;
    saldoInicial: number;
    totalIngresos: number;
    totalEgresos: number;
    ingresosEfectivo?: number;
    ingresosTarjeta?: number;
    ingresosTransferencia?: number;
    turno: string;
    fechaApertura: string;
}

export default function PanelCaja() {
    const [caja, setCaja] = useState<CajaData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Form states Caja Cerrada
    const [baseInicial, setBaseInicial] = useState<number | "">("");
    const [turno, setTurno] = useState<string>("DIURNO");
    const [isOpening, setIsOpening] = useState(false);

    // Modal states Egreso
    const [isEgresoModalOpen, setIsEgresoModalOpen] = useState(false);
    const [conceptoEgreso, setConceptoEgreso] = useState("");
    const [montoEgreso, setMontoEgreso] = useState<number | "">("");
    const [isRegisteringEgreso, setIsRegisteringEgreso] = useState(false);

    // Cerrar Turno
    const [isClosing, setIsClosing] = useState(false);
    const [efectivoDeclarado, setEfectivoDeclarado] = useState<number | "">("");
    const [tarjetaDeclarado, setTarjetaDeclarado] = useState<number | "">("");
    const [transferenciaDeclarado, setTransferenciaDeclarado] = useState<number | "">("");
    const [resultadoCierre, setResultadoCierre] = useState<any>(null);
    const [isCloseConfirmOpen, setIsCloseConfirmOpen] = useState(false);

    const fetchCaja = async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem("motel_token");
            const res = await fetch(`http://localhost:3000/caja/abierta?t=${Date.now()}`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
                cache: 'no-store'
            });
            if (!res.ok) {
                if (res.status === 404) {
                    setCaja(null);
                } else {
                    console.error("Error fetching caja", res.status);
                }
            } else {
                const text = await res.text();
                if (!text) {
                    setCaja(null);
                } else {
                    const data = JSON.parse(text);
                    setCaja(!data || Object.keys(data).length === 0 ? null : data);
                    if (data && Object.keys(data).length > 0) {
                        setEfectivoDeclarado(data.ingresosEfectivo || 0);
                        setTarjetaDeclarado(data.ingresosTarjeta || 0);
                        setTransferenciaDeclarado(data.ingresosTransferencia || 0);
                    }
                }
            }
        } catch (error) {
            console.error("Error de conexión", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCaja();
    }, []);

    const handleAbrirCaja = async (e: React.FormEvent) => {
        e.preventDefault();
        if (baseInicial === "") {
            toast.error("Ingrese la base inicial");
            return;
        }
        try {
            setIsOpening(true);
            const token = localStorage.getItem("motel_token");
            if (!token) {
            toast.error("No está autenticado");
            return;
        }

            const res = await fetch("http://localhost:3000/caja/abrir", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    usuarioId: 1,
                    saldoInicial: Number(baseInicial),
                    turno
                }),
            });
            if (res.ok) {
                setBaseInicial("");
                setTurno("DIURNO");
                await fetchCaja();
            } else {
                let errorMessage = "Error al abrir la caja";
                try {
                    const errorData = await res.json();
                    errorMessage = errorData.message || errorMessage;
                } catch (e) { }
                toast.error(errorMessage);
            }
        } catch (error) {
            console.error(error);
            toast.error("Error de conexión");
        } finally {
            setIsOpening(false);
        }
    };

    const handleRegistrarEgreso = async (e: React.FormEvent) => {
        e.preventDefault();
        if (montoEgreso === "" || conceptoEgreso.trim() === "") {
            toast.error("Revisar campos");
            return;
        }
        try {
            setIsRegisteringEgreso(true);
            const token = localStorage.getItem("motel_token");
            const res = await fetch("http://localhost:3000/caja/egreso", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { "Authorization": `Bearer ${token}` } : {})
                },
                body: JSON.stringify({
                    concepto: conceptoEgreso,
                    monto: Number(montoEgreso),
                    cajaId: caja?.id
                }),
            });
            if (res.ok) {
                setIsEgresoModalOpen(false);
                setConceptoEgreso("");
                setMontoEgreso("");
                await fetchCaja();
            } else {
                let errorMessage = "Error al registrar egreso";
                try {
                    const errorData = await res.json();
                    errorMessage = errorData.message || errorMessage;
                } catch (e) { }
                toast.error(errorMessage);
            }
        } catch (error) {
            console.error(error);
            toast.error("Error de conexión");
        } finally {
            setIsRegisteringEgreso(false);
        }
    };

    const handleCerrarTurno = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        
        if (efectivoDeclarado === "" || tarjetaDeclarado === "" || transferenciaDeclarado === "") {
            toast.error("Debe declarar valores en todas las formas de pago (use 0 si no hay dinero).");
            return;
        }

        if (!isCloseConfirmOpen) {
            setIsCloseConfirmOpen(true);
            return;
        }

        setIsCloseConfirmOpen(false);
        try {
            setIsClosing(true);
            const token = localStorage.getItem("motel_token");
            const res = await fetch(`http://localhost:3000/caja/cerrar`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { "Authorization": `Bearer ${token}` } : {})
                },
                body: JSON.stringify({ 
                    declaradoEfectivo: Number(efectivoDeclarado),
                    declaradoTarjeta: Number(tarjetaDeclarado),
                    declaradoTransferencia: Number(transferenciaDeclarado),
                }),
            });
            if (res.ok) {
                const data = await res.json();
                setResultadoCierre(data);
                setCaja(null);
            } else {
                let errorMessage = "Error al cerrar caja";
                try {
                    const errorData = await res.json();
                    errorMessage = errorData.message || errorMessage;
                } catch (e) { }
                toast.error(errorMessage);
            }
        } catch (error) {
            console.error(error);
            toast.error("Error de conexión");
        } finally {
            setIsClosing(false);
        }
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center justify-center min-h-[200px]">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                <p className="mt-4 text-gray-500">Cargando estado de caja...</p>
            </div>
        );
    }

    // Vista de Caja Cerrada
    if (!caja) {
        return (
            <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-orange-500">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-orange-100 rounded-full text-orange-600">
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Caja Cerrada</h2>
                        <p className="text-sm text-gray-500">No hay turno activo actualmente</p>
                    </div>
                </div>
                <form onSubmit={handleAbrirCaja} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Base Inicial ($)</label>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            required
                            value={baseInicial}
                            onChange={(e) => setBaseInicial(e.target.value === "" ? "" : Number(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                            placeholder="0.00"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Turno</label>
                        <select
                            value={turno}
                            onChange={(e) => setTurno(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                        >
                            <option value="DIURNO">DÍA (DIURNO)</option>
                            <option value="NOCTURNO">NOCHE (NOCTURNO)</option>
                        </select>
                    </div>
                    <button
                        type="submit"
                        disabled={isOpening}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-70"
                    >
                        {isOpening ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lock className="w-5 h-5" />}
                        {isOpening ? 'Abriendo Caja...' : 'Abrir Caja'}
                    </button>
                </form>
            </div>
        );
    }

    // View of success after closing (Cierre Exitoso modal)
    if (resultadoCierre && !caja) {
        return (
            <div className="bg-white rounded-xl shadow-md p-8 border-t-4 border-emerald-500">
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-emerald-100 rounded-full text-emerald-600">
                        <LogOut className="w-8 h-8" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-gray-900">Cierre Exitoso</h2>
                        <p className="text-gray-500">Turno finalizado correctamente.</p>
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
                        <div className="flex justify-between border-b pb-2"><span className="text-gray-400">Total Esperado Sistema:</span> <span>${(Number(resultadoCierre.resumen.efectivo.calculado) + Number(resultadoCierre.resumen.tarjeta.calculado) + Number(resultadoCierre.resumen.transferencia.calculado)).toFixed(2)}</span></div>
                        <div className="flex justify-between border-b pb-2"><span className="text-gray-400">Total Declarado Físico:</span> <span>${(Number(resultadoCierre.resumen.efectivo.declarado) + Number(resultadoCierre.resumen.tarjeta.declarado) + Number(resultadoCierre.resumen.transferencia.declarado)).toFixed(2)}</span></div>
                        <div className="flex justify-between border-b pb-2"><span className="text-gray-400">Base Retirada:</span> <span>${Number(resultadoCierre.caja.baseInicial ?? 0).toFixed(2)}</span></div>
                    </div>
                </div>
                
                <button onClick={() => setResultadoCierre(null)} className="bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 px-8 rounded-xl transition-colors">Volver a Empezar</button>
            </div>
        );
    }

    // Vista de Caja Abierta
    const saldoActual = (caja.saldoInicial || 0) + (caja.totalIngresos || 0) - (caja.totalEgresos || 0);

    return (
        <>
            <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-teal-500">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-teal-100 rounded-full text-teal-600">
                        <Banknote className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Caja Abierta</h2>
                        <p className="text-sm text-gray-500">Turno: <span className="font-semibold text-teal-700">{caja.turno}</span></p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                        <p className="text-sm text-gray-500 mb-1">Saldo Inicial</p>
                        <p className="text-2xl font-bold text-gray-800">${caja.saldoInicial?.toFixed(2) || '0.00'}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                        <p className="text-sm text-green-600 mb-1">Ingresos Totales</p>
                        <p className="text-2xl font-bold text-green-700">${caja.totalIngresos?.toFixed(2) || '0.00'}</p>
                    </div>
                    <div className="bg-red-50 rounded-lg p-4 border border-red-100">
                        <p className="text-sm text-red-600 mb-1">Egresos</p>
                        <p className="text-2xl font-bold text-red-700">${caja.totalEgresos?.toFixed(2) || '0.00'}</p>
                    </div>
                </div>

                {/* Desglose por método de pago */}
                <div className="mb-6">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Desglose por método de cobro</p>
                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex flex-col items-center gap-1">
                            <span className="text-lg">💵</span>
                            <p className="text-xs font-bold text-emerald-700 uppercase">Efectivo</p>
                            <p className="text-xl font-black text-emerald-800">${(caja.ingresosEfectivo || 0).toFixed(2)}</p>
                        </div>
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex flex-col items-center gap-1">
                            <span className="text-lg">💳</span>
                            <p className="text-xs font-bold text-blue-700 uppercase">Datáfono</p>
                            <p className="text-xl font-black text-blue-800">${(caja.ingresosTarjeta || 0).toFixed(2)}</p>
                        </div>
                        <div className="bg-purple-50 border border-purple-100 rounded-xl p-3 flex flex-col items-center gap-1">
                            <span className="text-lg">📲</span>
                            <p className="text-xs font-bold text-purple-700 uppercase">Nequi</p>
                            <p className="text-xl font-black text-purple-800">${(caja.ingresosTransferencia || 0).toFixed(2)}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-6 shadow-lg mb-6 flex flex-col md:flex-row items-center justify-between text-white">
                    <div>
                        <h3 className="text-gray-300 font-medium text-lg">Saldo Actual en Caja</h3>
                        <p className="text-sm text-gray-400 mt-1">Efectivo total disponible ahora</p>
                    </div>
                    <div className="text-4xl md:text-5xl font-black text-green-400 tracking-tight mt-4 md:mt-0">
                        ${saldoActual.toFixed(2)}
                    </div>
                </div>

                <div className="flex justify-between border-t border-gray-100 pt-5">
                    <button
                        onClick={() => setIsEgresoModalOpen(true)}
                        className="bg-gray-100 hover:bg-gray-200 text-teal-700 px-5 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-colors"
                    >
                        <ArrowDownToLine className="w-4 h-4" />
                        Registrar Egreso Rápido
                    </button>
                </div>

                {/* Formulario de Cierre Integrado */}
                <form onSubmit={handleCerrarTurno} className="border-t border-gray-100 mt-8 pt-8">
                    <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2"><LogOut className="w-5 h-5" /> Declaración de Cierre de Turno</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Efectivo Declarado ($) *</label>
                            <input
                                type="number"
                                min="0"
                                required
                                value={efectivoDeclarado}
                                onChange={(e) => setEfectivoDeclarado(e.target.value === "" ? "" : Number(e.target.value))}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all font-bold text-lg"
                                placeholder="0"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tarjeta (Datáfono) Declarado ($) *</label>
                            <input
                                type="number"
                                min="0"
                                required
                                value={tarjetaDeclarado}
                                onChange={(e) => setTarjetaDeclarado(e.target.value === "" ? "" : Number(e.target.value))}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all font-bold text-lg"
                                placeholder="0"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Transferencia Declarado ($) *</label>
                            <input
                                type="number"
                                min="0"
                                required
                                value={transferenciaDeclarado}
                                onChange={(e) => setTransferenciaDeclarado(e.target.value === "" ? "" : Number(e.target.value))}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all font-bold text-lg"
                                placeholder="0"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isClosing}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-70 shadow-lg hover:shadow-red-500/30"
                    >
                        {isClosing ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogOut className="w-5 h-5" />}
                        {isClosing ? 'Generando Cierre...' : 'Realizar Cierre Definitivo de Turno'}
                    </button>
                </form>
            </div>

            {/* Modal Egreso */}
            {isEgresoModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Registrar Egreso</h3>
                        <form onSubmit={handleRegistrarEgreso} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Concepto</label>
                                <input
                                    type="text"
                                    required
                                    value={conceptoEgreso}
                                    onChange={(e) => setConceptoEgreso(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                                    placeholder="Ej. Compra de agua"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Monto ($)</label>
                                <input
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    required
                                    value={montoEgreso}
                                    onChange={(e) => setMontoEgreso(e.target.value === "" ? "" : Number(e.target.value))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="flex items-center justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsEgresoModalOpen(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isRegisteringEgreso}
                                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-medium disabled:opacity-70"
                                >
                                    {isRegisteringEgreso && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Registrar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Modal Confirmación Cierre */}
            {isCloseConfirmOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm border border-gray-100 transform transition-all animate-in zoom-in-95 duration-200">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6">
                                <LogOut className="w-8 h-8 text-red-500" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 mb-2">Finalizar Turno</h3>
                            <p className="text-gray-500 font-medium mb-8">
                                ¿Estás seguro de que deseas realizar el cierre definitivo? Asegúrate de haber contado bien el dinero físico.
                            </p>
                            <div className="flex flex-col w-full gap-3">
                                <button
                                    onClick={() => handleCerrarTurno()}
                                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-red-500/20 transition-all active:scale-95"
                                >
                                    Sí, cerrar turno ahora
                                </button>
                                <button
                                    onClick={() => setIsCloseConfirmOpen(false)}
                                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold py-4 rounded-xl transition-all"
                                >
                                    No, volver a revisar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
