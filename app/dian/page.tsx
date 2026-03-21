"use client";

import { useEffect, useState } from "react";
import { 
    FileText, 
    Send, 
    CheckCircle2, 
    Clock, 
    ExternalLink, 
    Loader2, 
    Search,
    Filter,
    ArrowUpRight,
    AlertCircle,
    Wallet
} from "lucide-react";
import api from "@/lib/api";
import { formatColombiaDate } from "@/lib/formatters";
import { toast } from "react-hot-toast";

interface FacturaRecord {
    id: number;
    fechaInicio: string;
    montoTarjeta: number;
    montoTransferencia: number;
    montoEfectivo: number;
    total: number;
    estadoDian: 'PENDIENTE' | 'EMITIDA'; // Usar campo real del backend
    cufeDian?: string;
}

export default function DianInboxPage() {
    const [facturas, setFacturas] = useState<FacturaRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [emitirLoadingId, setEmitirLoadingId] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    // Cargar datos reales del backend
    const fetchFacturas = async () => {
        try {
            setIsLoading(true);
            const res = await api.get('/estadia/dian/pendientes');
            // Asegurarnos de que recibimos un array
            setFacturas(Array.isArray(res.data) ? res.data : []);
        } catch (error: any) {
            console.error("Error fetching DIAN data:", error);
            toast.error("No se pudo conectar con el servidor para obtener las facturas.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchFacturas();
    }, []);

    const handleEmitir = async (id: number) => {
        setEmitirLoadingId(id);
        const loadingToast = toast.loading("Conectando con servidores de la DIAN...");
        
        // Simulación de latencia de red de la DIAN (2 segundos) solicitado por el usuario
        setTimeout(async () => {
            try {
                const res = await api.patch(`/estadia/dian/${id}/emitir`);
                
                // Actualizar visualmente la fila con la respuesta real
                setFacturas(prev => prev.map(f => 
                    f.id === id 
                        ? { ...f, estadoDian: 'EMITIDA', cufeDian: res.data.cufeDian } 
                        : f
                ));
                
                toast.success("Factura electrónica emitida y firmada con éxito.", { id: loadingToast });
            } catch (error: any) {
                console.error("Error emitting invoice:", error);
                const errorMsg = error.response?.data?.message || "Error en el proceso de emisión electrónica.";
                toast.error(errorMsg, { id: loadingToast });
            } finally {
                setEmitirLoadingId(null);
            }
        }, 2000);
    };

    const getMetodoPago = (f: FacturaRecord) => {
        const metodos = [];
        if (f.montoTarjeta > 0) metodos.push("Tarjeta");
        if (f.montoTransferencia > 0) metodos.push("Transferencia");
        if (f.montoEfectivo > 0) metodos.push("Efectivo");
        return metodos.join(" / ");
    };

    const filteredFacturas = facturas.filter(f => {
        const search = searchTerm.toLowerCase();
        const id = f.id?.toString() || "";
        const estado = f.estadoDian?.toLowerCase() || "";
        const metodoPago = getMetodoPago(f).toLowerCase();
        
        return (
            id.includes(search) || 
            estado.includes(search) ||
            metodoPago.includes(search)
        );
    });

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 blur-3xl opacity-50"></div>
                <div className="z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-indigo-600 rounded-xl text-white">
                            <Send className="w-5 h-5" />
                        </div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Bandeja de Emisión DIAN</h1>
                    </div>
                    <p className="text-gray-500 font-medium font-sans">Gestión de facturación electrónica en tiempo real.</p>
                </div>

                <div className="flex items-center gap-3 z-10">
                    <div className="bg-orange-50 text-orange-700 px-4 py-2 rounded-2xl border border-orange-100 flex items-center gap-2 font-bold text-sm">
                        <Clock className="w-4 h-4" />
                        {facturas.filter(f => f.estadoDian === 'PENDIENTE').length} Pendientes
                    </div>
                    <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-2xl border border-emerald-100 flex items-center gap-2 font-bold text-sm">
                        <CheckCircle2 className="w-4 h-4" />
                        {facturas.filter(f => f.estadoDian === 'EMITIDA').length} Emitidas
                    </div>
                </div>
            </div>

            {/* Filters bar */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input 
                        type="text" 
                        placeholder="Buscar por ID de estadía..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm font-medium text-gray-900"
                    />
                </div>
                <button 
                    onClick={fetchFacturas}
                    className="flex items-center gap-2 px-6 py-3.5 bg-white border border-gray-200 rounded-2xl text-gray-600 font-bold hover:bg-gray-50 transition-colors shadow-sm"
                >
                    <Loader2 className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    Refrescar
                </button>
            </div>

            {/* Content section */}
            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-indigo-500/5 border border-gray-100 overflow-hidden min-h-[400px]">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-32 space-y-4">
                        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
                        <p className="text-gray-400 font-bold animate-pulse uppercase tracking-[0.2em] text-xs">Consultando base de datos...</p>
                    </div>
                ) : filteredFacturas.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 text-center px-4">
                        <div className="bg-gray-50 p-6 rounded-full mb-6">
                            <AlertCircle className="w-12 h-12 text-gray-300" />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 mb-2">Sin registros pendientes</h3>
                        <p className="text-gray-500 font-medium max-w-xs">No se encontraron estadías que requieran emisión electrónica en este momento.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100 font-sans">
                                    <th className="px-8 py-5 text-sm font-bold text-gray-400 uppercase tracking-wider">ID</th>
                                    <th className="px-8 py-5 text-sm font-bold text-gray-400 uppercase tracking-wider">Fecha Entrada</th>
                                    <th className="px-8 py-5 text-sm font-bold text-gray-400 uppercase tracking-wider">Método</th>
                                    <th className="px-8 py-5 text-sm font-bold text-gray-400 uppercase tracking-wider">Total</th>
                                    <th className="px-8 py-5 text-sm font-bold text-gray-400 uppercase tracking-wider">Estado</th>
                                    <th className="px-8 py-5 text-sm font-bold text-gray-400 uppercase tracking-wider text-right">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredFacturas.map((factura) => (
                                    <tr key={factura.id} className="hover:bg-indigo-50/30 transition-colors group">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-2">
                                                <span className="font-black text-gray-900">#{factura.id}</span>
                                                <ArrowUpRight className="w-3.5 h-3.5 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-gray-600 font-medium whitespace-nowrap">
                                            {formatColombiaDate(factura.fechaInicio)}
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-gray-700 font-bold">{getMetodoPago(factura)}</span>
                                                <div className="flex gap-2 text-[10px] text-gray-400 font-mono mt-0.5">
                                                    {factura.montoTarjeta > 0 && <span>T: ${factura.montoTarjeta.toLocaleString()}</span>}
                                                    {factura.montoTransferencia > 0 && <span>Tr: ${factura.montoTransferencia.toLocaleString()}</span>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="text-lg font-black text-indigo-900">
                                                ${factura.total.toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5">
                                            {factura.estadoDian === 'EMITIDA' ? (
                                                <div className="flex flex-col">
                                                    <span className="inline-flex items-center gap-1.5 text-emerald-600 font-bold">
                                                        <CheckCircle2 className="w-4 h-4" />
                                                        Emitida
                                                    </span>
                                                    <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md mt-1 border border-emerald-100 max-w-fit" title={factura.cufeDian}>
                                                        CUFE: {factura.cufeDian?.substring(0, 10)}...
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 text-orange-500 font-bold bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
                                                    <Clock className="w-4 h-4 animate-pulse text-orange-400" />
                                                    Pendiente
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            {factura.estadoDian === 'PENDIENTE' ? (
                                                <button 
                                                    onClick={() => handleEmitir(factura.id)}
                                                    disabled={emitirLoadingId === factura.id}
                                                    className={`
                                                        inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all shadow-lg
                                                        ${emitirLoadingId === factura.id 
                                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                                            : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-500/30 hover:-translate-y-0.5 active:translate-y-0'
                                                        }
                                                    `}
                                                >
                                                    {emitirLoadingId === factura.id ? (
                                                        <>
                                                            <Loader2 className="w-4 h-4 animate-spin font-black" />
                                                            Cargando...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Send className="w-4 h-4" />
                                                            Emitir DIAN
                                                        </>
                                                    )}
                                                </button>
                                            ) : (
                                                <button className="p-3 bg-gray-50 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all" title="Ver Comprobante">
                                                    <ExternalLink className="w-5 h-5" />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            
            <div className="flex items-center justify-between text-gray-400 text-sm font-medium px-4">
                <p>Mostrando {filteredFacturas.length} registros</p>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <span>Conexión con DIAN: Estable</span>
                </div>
            </div>
        </div>
    );
}
