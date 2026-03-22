"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Package, Plus, Edit2, Archive, ArchiveRestore, 
  Loader2, AlertCircle, Search, PackagePlus, CheckCircle2, 
  X, ShieldAlert
} from "lucide-react";
import { toast } from "react-hot-toast";
import { API_URL } from "@/src/config/api";

interface Producto {
  id: number;
  nombre: string;
  precio: number;
  stock: number;
  activo: boolean;
}

export default function AdminProductosPage() {
  const router = useRouter();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isForbidden, setIsForbidden] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Estados para modales
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  const [editingProducto, setEditingProducto] = useState<Producto | null>(null);
  
  const [stockProducto, setStockProducto] = useState<Producto | null>(null);

  // Estados de carga de formularios
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchProductos = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const token = localStorage.getItem("motel_token");
      
      if (!token) {
         router.push("/login");
         return;
      }

      const res = await fetch(`${API_URL}/producto?t=${Date.now()}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });

      if (!res.ok) {
        if (res.status === 401) {
            router.push("/login");
            return;
        }
        if (res.status === 403) {
            setIsForbidden(true);
            setIsLoading(false);
            return;
        }
        throw new Error("Error al cargar el inventario");
      }

      const data = await res.json();
      setProductos(data);
    } catch (err: any) {
      setError(err.message || "Error de conexión");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProductos();
  }, [router]);

  // Manejadores de Formularios
  const handleCreateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const nombre = formData.get("nombre") as string;
    const precio = Number(formData.get("precio"));
    const stock = Number(formData.get("stock"));

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("motel_token");
      const res = await fetch(`${API_URL}/producto`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ nombre, precio, stock }),
      });

      if (!res.ok) {
        let msg = "Error al crear producto";
        try { const errData = await res.json(); msg = errData.message || msg; } catch (e) {}
        throw new Error(msg);
      }

      toast.success("Producto creado con éxito");
      setIsCreateModalOpen(false);
      fetchProductos();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingProducto) return;

    const formData = new FormData(e.currentTarget);
    const nombre = formData.get("nombre") as string;
    const precio = Number(formData.get("precio"));
    const activo = formData.get("activo") === "on";

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("motel_token");
      const res = await fetch(`${API_URL}/producto/${editingProducto.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ nombre, precio, activo }),
      });

      if (!res.ok) {
        let msg = "Error al actualizar producto";
        try { const errData = await res.json(); msg = errData.message || msg; } catch (e) {}
        throw new Error(msg);
      }

      toast.success("Producto actualizado con éxito");
      setEditingProducto(null);
      fetchProductos();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStockSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!stockProducto) return;

    const formData = new FormData(e.currentTarget);
    const cantidad = Number(formData.get("cantidad"));

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("motel_token");
      const res = await fetch(`${API_URL}/producto/${stockProducto.id}/stock`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ cantidad }),
      });

      if (!res.ok) {
        let msg = "Error al ingresar stock";
        try { const errData = await res.json(); msg = errData.message || msg; } catch (e) {}
        throw new Error(msg);
      }

      toast.success(`${cantidad} unidades agregadas a ${stockProducto.nombre}`);
      setStockProducto(null);
      fetchProductos();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProductos = productos.filter(p => 
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isForbidden) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 md:p-10 flex items-center justify-center font-sans">
        <div className="bg-white p-10 max-w-lg w-full rounded-2xl shadow-lg border border-red-100 flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
            <ShieldAlert className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Acceso Denegado</h1>
          <p className="text-gray-500 font-medium mb-6">
            Solo el personal administrador tiene autorización para gestionar el inventario del minibar.
          </p>
          <button 
             onClick={() => router.push('/recepcion')}
             className="bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 px-6 rounded-xl transition-all"
          >
             Volver a Recepción
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
            <h1 className="text-3xl md:text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
              <Package className="w-8 h-8 text-indigo-600" />
              Gestión de Inventario
            </h1>
            <p className="text-gray-500 font-medium mt-2">
              Administra el catálogo y stock de productos del Minibar
            </p>
          </div>

          <button
             onClick={() => setIsCreateModalOpen(true)}
             className="bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold py-3 px-6 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
          >
             <Plus className="w-5 h-5" />
             Nuevo Producto
          </button>
        </header>

        {/* Filters and Table Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden text-sm md:text-base">
           
           <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50">
             <div className="relative w-full sm:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Buscar producto por nombre..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium text-gray-800 outline-none transition-all shadow-sm"
                />
             </div>
             <p className="text-gray-500 font-medium whitespace-nowrap">
                {filteredProductos.length} productos en total
             </p>
           </div>

           {isLoading ? (
             <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mb-4" />
                <p className="text-gray-500 font-medium">Cargando inventario...</p>
             </div>
           ) : error ? (
             <div className="p-10 flex justify-center">
                 <div className="bg-red-50 text-red-700 px-6 py-4 rounded-xl border border-red-200 flex items-center gap-3">
                     <AlertCircle className="w-6 h-6" /> {error}
                 </div>
             </div>
           ) : filteredProductos.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-24 text-gray-400">
                <Package className="w-16 h-16 mb-4 opacity-30" />
                <p className="text-xl font-medium text-gray-800">No se encontraron productos</p>
                <p className="mt-1">Intenta ajustando tu búsqueda o creando uno nuevo.</p>
             </div>
           ) : (
             <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                   <thead>
                      <tr className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wider border-b border-gray-100">
                         <th className="px-6 py-4 font-bold">ID</th>
                         <th className="px-6 py-4 font-bold">Nombre del Producto</th>
                         <th className="px-6 py-4 font-bold text-center">Precio</th>
                         <th className="px-6 py-4 font-bold text-center">Stock Actual</th>
                         <th className="px-6 py-4 font-bold text-center">Estado</th>
                         <th className="px-6 py-4 font-bold text-right">Acciones</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-50">
                      {filteredProductos.map((producto) => (
                         <tr key={producto.id} className={`hover:bg-gray-50/50 transition-colors ${!producto.activo ? 'opacity-70 bg-gray-50/80 saturate-50' : ''}`}>
                            <td className="px-6 py-4 text-gray-500 font-mono text-xs">#{producto.id}</td>
                            <td className="px-6 py-4 font-bold text-gray-900">{producto.nombre}</td>
                            <td className="px-6 py-4 text-center font-black text-indigo-600">${producto.precio.toFixed(2)}</td>
                            <td className="px-6 py-4 text-center">
                               <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold ${producto.stock > 10 ? 'bg-green-100 text-green-700' : producto.stock > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                 {producto.stock} uds
                               </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                               {producto.activo ? (
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                                     <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> Activo
                                  </span>
                               ) : (
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gray-200 text-gray-600">
                                     <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span> Inactivo
                                  </span>
                               )}
                            </td>
                            <td className="px-6 py-4 text-right">
                               <div className="flex items-center justify-end gap-2">
                                  <button
                                     onClick={() => setStockProducto(producto)}
                                     title="Ingresar Mercancía"
                                     className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                  >
                                     <PackagePlus className="w-5 h-5" />
                                  </button>
                                  <button
                                     onClick={() => setEditingProducto(producto)}
                                     title="Editar Producto"
                                     className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  >
                                     <Edit2 className="w-5 h-5" />
                                  </button>
                               </div>
                            </td>
                         </tr>
                      ))}
                   </tbody>
                </table>
             </div>
           )}
        </div>
      </div>

      {/* --- MODALES --- */}

      {/* Modal: Crear Producto */}
      {isCreateModalOpen && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm transition-opacity">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md animate-in zoom-in-95 duration-200 overflow-hidden">
               <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                     <Plus className="w-5 h-5 text-indigo-600" /> Nuevo Producto
                  </h3>
                  <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-400 hover:bg-gray-200 p-2 rounded-full">
                     <X className="w-5 h-5" />
                  </button>
               </div>
               <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Nombre</label>
                    <input name="nombre" type="text" required className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" placeholder="Ej. Cerveza Corona" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Precio Unitario</label>
                      <input name="precio" type="number" min="0" step="0.01" required className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" placeholder="0.00" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Stock Inicial</label>
                      <input name="stock" type="number" min="0" required className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" placeholder="0" />
                    </div>
                  </div>
                  <div className="pt-4 border-t border-gray-100 mt-6 flex justify-end gap-3">
                     <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-5 py-2.5 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-all">Cancelar</button>
                     <button type="submit" disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-6 py-2.5 rounded-xl font-bold shadow-sm transition-all flex items-center gap-2">
                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Crear Producto'}
                     </button>
                  </div>
               </form>
            </div>
         </div>
      )}

      {/* Modal: Editar Producto */}
      {editingProducto && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm transition-opacity">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md animate-in zoom-in-95 duration-200 overflow-hidden">
               <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                     <Edit2 className="w-5 h-5 text-blue-600" /> Editar Producto
                  </h3>
                  <button onClick={() => setEditingProducto(null)} className="text-gray-400 hover:bg-gray-200 p-2 rounded-full">
                     <X className="w-5 h-5" />
                  </button>
               </div>
               <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Nombre</label>
                    <input name="nombre" defaultValue={editingProducto.nombre} type="text" required className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Precio Unitario</label>
                    <input name="precio" defaultValue={editingProducto.precio} type="number" min="0" step="0.01" required className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                  </div>
                  <div className="flex items-center gap-3 pt-2 bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <input name="activo" type="checkbox" id="activoToggle" defaultChecked={editingProducto.activo} className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer" />
                    <label htmlFor="activoToggle" className="text-sm font-bold text-gray-800 cursor-pointer flex-1">
                       Producto Activo (Visible en Minibar)
                    </label>
                  </div>
                  <div className="pt-4 border-t border-gray-100 mt-6 flex justify-end gap-3">
                     <button type="button" onClick={() => setEditingProducto(null)} className="px-5 py-2.5 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-all">Cancelar</button>
                     <button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2.5 rounded-xl font-bold shadow-sm transition-all flex items-center gap-2">
                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Guardar Cambios'}
                     </button>
                  </div>
               </form>
            </div>
         </div>
      )}

      {/* Modal: Ingreso de Mercancía (Stock) */}
      {stockProducto && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm transition-opacity">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm animate-in zoom-in-95 duration-200 overflow-hidden">
               <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                     <PackagePlus className="w-5 h-5 text-indigo-600" /> Ingresar Stock
                  </h3>
                  <button onClick={() => setStockProducto(null)} className="text-gray-400 hover:bg-gray-200 p-2 rounded-full">
                     <X className="w-5 h-5" />
                  </button>
               </div>
               <form onSubmit={handleStockSubmit} className="p-6 space-y-4">
                  <div className="bg-indigo-50 text-indigo-800 p-4 rounded-xl border border-indigo-100 text-sm font-medium text-center">
                     ¿Cuántas unidades de <span className="font-bold text-indigo-900 uppercase">{stockProducto.nombre}</span> acaban de ingresar?
                  </div>
                  <div className="flex justify-center">
                    <input name="cantidad" type="number" min="1" required className="w-32 text-center text-3xl font-black border-b-2 border-indigo-200 focus:border-indigo-600 py-2 outline-none" placeholder="0" />
                  </div>
                  <div className="pt-4 border-t border-gray-100 mt-6 flex justify-end gap-3">
                     <button type="button" onClick={() => setStockProducto(null)} className="w-full px-5 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-all">Cancelar</button>
                     <button type="submit" disabled={isSubmitting} className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-6 py-3 rounded-xl font-bold shadow-sm transition-all flex items-center justify-center gap-2">
                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Añadir Stock'}
                     </button>
                  </div>
               </form>
            </div>
         </div>
      )}

    </div>
  );
}
