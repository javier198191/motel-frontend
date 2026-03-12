"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, Banknote, Lock, LogOut, Loader2, ArrowDownToLine } from "lucide-react";

interface CajaData {
    id: number;
    saldoInicial: number;
    totalIngresos: number;
    totalEgresos: number;
    turno: string;
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
        if (baseInicial === "") return alert("Ingrese la base inicial");
        try {
            setIsOpening(true);
            const token = localStorage.getItem("motel_token");
            if (!token) return alert("No está autenticado");

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
                alert(errorMessage);
            }
        } catch (error) {
            console.error(error);
            alert("Error de conexión");
        } finally {
            setIsOpening(false);
        }
    };

    const handleRegistrarEgreso = async (e: React.FormEvent) => {
        e.preventDefault();
        if (montoEgreso === "" || conceptoEgreso.trim() === "") return alert("Revisar campos");
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
                alert(errorMessage);
            }
        } catch (error) {
            console.error(error);
            alert("Error de conexión");
        } finally {
            setIsRegisteringEgreso(false);
        }
    };

    const handleCerrarTurno = async () => {
        if (!confirm("¿Seguro que deseas cerrar el turno actual?")) return;
        try {
            setIsClosing(true);
            const token = localStorage.getItem("motel_token");
            const res = await fetch("http://localhost:3000/caja/cerrar", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { "Authorization": `Bearer ${token}` } : {})
                },
                body: JSON.stringify({ id: caja?.id }),
            });
            if (res.ok) {
                await fetchCaja();
            } else {
                let errorMessage = "Error al cerrar caja";
                try {
                    const errorData = await res.json();
                    errorMessage = errorData.message || errorMessage;
                } catch (e) { }
                alert(errorMessage);
            }
        } catch (error) {
            console.error(error);
            alert("Error de conexión");
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

    // Vista de Caja Abierta
    const saldoActual = (caja.saldoInicial || 0) + (caja.totalIngresos || 0) - (caja.totalEgresos || 0);

    return (
        <>
            <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-teal-500">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-teal-100 rounded-full text-teal-600">
                            <Banknote className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">Caja Abierta</h2>
                            <p className="text-sm text-gray-500">Turno: <span className="font-semibold text-teal-700">{caja.turno}</span></p>
                        </div>
                    </div>
                    <button
                        onClick={handleCerrarTurno}
                        disabled={isClosing}
                        className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-70"
                    >
                        {isClosing ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
                        {isClosing ? 'Cerrando...' : 'Cerrar Turno'}
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                        <p className="text-sm text-gray-500 mb-1">Saldo Inicial</p>
                        <p className="text-2xl font-bold text-gray-800">${caja.saldoInicial?.toFixed(2) || '0.00'}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                        <p className="text-sm text-green-600 mb-1">Ingresos</p>
                        <p className="text-2xl font-bold text-green-700">${caja.totalIngresos?.toFixed(2) || '0.00'}</p>
                    </div>
                    <div className="bg-red-50 rounded-lg p-4 border border-red-100">
                        <p className="text-sm text-red-600 mb-1">Egresos</p>
                        <p className="text-2xl font-bold text-red-700">${caja.totalEgresos?.toFixed(2) || '0.00'}</p>
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

                <div className="flex justify-end border-t border-gray-100 pt-5">
                    <button
                        onClick={() => setIsEgresoModalOpen(true)}
                        className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-colors"
                    >
                        <ArrowDownToLine className="w-4 h-4" />
                        Registrar Egreso
                    </button>
                </div>
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
        </>
    );
}
