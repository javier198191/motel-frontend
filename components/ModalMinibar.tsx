"use client";

import { useState, useEffect, useMemo } from "react";
import { X, Loader2, ShoppingCart, AlertCircle, Package, Search, Plus, Minus, Trash2, Receipt } from "lucide-react";
import { toast } from "react-hot-toast";
import { API_URL } from "@/src/config/api";

interface Producto {
    id: number;
    nombre: string;
    precio: number;
    stock: number;
}

interface CartItem {
    producto: Producto;
    cantidad: number;
}

interface ModalMinibarProps {
    estadiaId: number;
    habitacionNumero: number;
    onClose: () => void;
    onSuccess: () => void; // Para recargar datos si es necesario
}

export default function ModalMinibar({ estadiaId, habitacionNumero, onClose, onSuccess }: ModalMinibarProps) {
    const [productos, setProductos] = useState<Producto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Estado del Buscador y Carrito
    const [searchTerm, setSearchTerm] = useState("");
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isCheckingOut, setIsCheckingOut] = useState(false);

    useEffect(() => {
        const fetchProductos = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const token = localStorage.getItem("motel_token");
                const res = await fetch(`${API_URL}/producto/activos?t=${Date.now()}`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                    cache: "no-store",
                });

                if (!res.ok) {
                    let errorMsg = "Error al cargar los productos";
                    try {
                        const data = await res.json();
                        errorMsg = data.message || errorMsg;
                    } catch (e) { }
                    throw new Error(errorMsg);
                }

                const data: Producto[] = await res.json();
                setProductos(data);
            } catch (err: any) {
                setError(err.message || "Error de conexión");
            } finally {
                setIsLoading(false);
            }
        };

        fetchProductos();
    }, []);

    // Filtrar productos por búsqueda
    const filteredProductos = useMemo(() => {
        if (!searchTerm.trim()) return productos;
        return productos.filter(p => p.nombre.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [productos, searchTerm]);

    // Calcular Totales del Carrito
    const cartTotal = useMemo(() => {
        return cart.reduce((total, item) => total + (item.producto.precio * item.cantidad), 0);
    }, [cart]);

    const totalItems = useMemo(() => {
        return cart.reduce((total, item) => total + item.cantidad, 0);
    }, [cart]);

    // Funciones del Carrito
    const addToCart = (producto: Producto) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.producto.id === producto.id);
            if (existingItem) {
                if (existingItem.cantidad >= producto.stock) {
                    toast.error(`No puedes agregar más. El stock máximo de ${producto.nombre} es ${producto.stock}.`);
                    return prevCart;
                }
                return prevCart.map(item =>
                    item.producto.id === producto.id
                        ? { ...item, cantidad: item.cantidad + 1 }
                        : item
                );
            }
            return [...prevCart, { producto, cantidad: 1 }];
        });
    };

    const updateQuantity = (productoId: number, delta: number) => {
        setCart(prevCart => {
            return prevCart.map(item => {
                if (item.producto.id === productoId) {
                    const newQuantity = item.cantidad + delta;
                    if (newQuantity < 1) return item; // Cannot have less than 1 if in cart
                    if (newQuantity > item.producto.stock) {
                        toast.error(`Stock máximo alcanzado para ${item.producto.nombre}.`);
                        return item;
                    }
                    return { ...item, cantidad: newQuantity };
                }
                return item;
            });
        });
    };

    const removeFromCart = (productoId: number) => {
        setCart(prevCart => prevCart.filter(item => item.producto.id !== productoId));
    };

    // Checkout al Backend
    const handleCheckout = async () => {
        if (cart.length === 0) return;

        try {
            setIsCheckingOut(true);
            const token = localStorage.getItem("motel_token");
            const headers = {
                "Content-Type": "application/json",
                ...(token ? { "Authorization": `Bearer ${token}` } : {}),
            };

            // Crear un array de Promesas para POST de todos los consumos en paralelo
            const checkoutPromises = cart.map(item => {
                return fetch(`${API_URL}/consumo`, {
                    method: "POST",
                    headers,
                    body: JSON.stringify({
                        estadiaId,
                        productoId: item.producto.id,
                        cantidad: item.cantidad
                    }),
                });
            });

            // Esperar a que todos terminen
            const responses = await Promise.all(checkoutPromises);

            // Revisar si hubo algún error en alguno de los requests
            const errors = responses.filter(r => !r.ok);
            if (errors.length > 0) {
                // Leer el body del primer error para info
                let alertMsg = "Error al despachar algunos productos al servidor.";
                try {
                    const errorData = await errors[0].json();
                    alertMsg = errorData.message || alertMsg;
                } catch (e) { }
                toast.error(alertMsg);
                return; // Detenemos aquí si hubo errores
            }

            // Exito Total
            toast.success(`Se registraron con éxito ${totalItems} consumos a la habitación ${habitacionNumero}.`);
            setCart([]);
            if (onSuccess) onSuccess();

        } catch (error) {
            console.error(error);
            toast.error("Error crítico de red durante el checkout.");
        } finally {
            setIsCheckingOut(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/70 backdrop-blur-sm transition-opacity">
            <div className="bg-gray-100 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col transform transition-all overflow-hidden animate-in fade-in zoom-in duration-200">

                {/* Header Modal */}
                <div className="bg-white px-6 py-4 flex justify-between items-center border-b border-gray-200 shadow-sm z-10 shrink-0">
                    <div>
                        <h3 className="text-2xl font-extrabold text-gray-900 flex items-center gap-3">
                            <ShoppingCart className="w-7 h-7 text-indigo-600" />
                            Minibar POS
                        </h3>
                        <p className="text-sm font-medium text-gray-500 mt-1">
                            Habitación <span className="text-indigo-600 font-bold text-base">{habitacionNumero}</span>
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-2.5 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white shadow-sm border border-gray-200"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* 2-Column POS Layout */}
                <div className="flex flex-1 overflow-hidden flex-col lg:flex-row">

                    {/* LEFT COLUMN: CATALOG */}
                    <div className="flex-1 flex flex-col bg-gray-50 lg:border-r border-gray-200 overflow-hidden">

                        {/* Search Bar */}
                        <div className="p-4 bg-white border-b border-gray-100 shrink-0">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar productos por nombre..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium text-gray-800 outline-none transition-all shadow-sm"
                                />
                            </div>
                        </div>

                        {/* Catalog List */}
                        <div className="flex-1 overflow-y-auto p-4 content-start">
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center py-20">
                                    <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mb-4" />
                                    <p className="text-gray-500 font-medium">Cargando catálogo...</p>
                                </div>
                            ) : error ? (
                                <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-xl shadow-sm my-4">
                                    <div className="flex items-center gap-3 mb-2">
                                        <AlertCircle className="w-6 h-6 text-red-500" />
                                        <h4 className="text-lg font-bold text-red-800">Error</h4>
                                    </div>
                                    <p className="text-red-600 ml-9">{error}</p>
                                </div>
                            ) : productos.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                                    <Package className="w-16 h-16 mb-4 opacity-50" />
                                    <p className="text-lg font-medium">No hay productos activos en inventario</p>
                                </div>
                            ) : filteredProductos.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-gray-400 text-center">
                                    <Search className="w-12 h-12 mb-4 opacity-30" />
                                    <p className="text-lg font-medium">No hay resultados para "{searchTerm}"</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 auto-rows-max">
                                    {filteredProductos.map((producto) => {
                                        const cartItem = cart.find(i => i.producto.id === producto.id);
                                        const inCartQty = cartItem ? cartItem.cantidad : 0;
                                        const availableStock = producto.stock - inCartQty;
                                        const isOutOfStock = availableStock <= 0;

                                        return (
                                            <div
                                                key={producto.id}
                                                onClick={() => !isOutOfStock && addToCart(producto)}
                                                className={`relative overflow-hidden flex flex-col p-4 bg-white border rounded-xl transition-all duration-200 
                                                    ${isOutOfStock
                                                        ? 'border-gray-200 opacity-60 grayscale cursor-not-allowed'
                                                        : 'border-gray-200 hover:border-indigo-400 hover:shadow-md cursor-pointer active:scale-95'
                                                    }`}
                                            >
                                                {/* In Cart Badge */}
                                                {inCartQty > 0 && (
                                                    <div className="absolute top-0 right-0 bg-indigo-600 text-white text-xs font-black px-2 py-1 rounded-bl-lg shadow-sm">
                                                        {inCartQty} en carrito
                                                    </div>
                                                )}

                                                <div className="flex-1">
                                                    <h5 className="font-bold text-gray-900 text-base leading-tight pr-8">{producto.nombre}</h5>
                                                    <p className="text-indigo-600 font-black text-lg mt-2">${producto.precio.toFixed(2)}</p>
                                                </div>

                                                <div className="mt-3 flex items-center justify-between">
                                                    <span className={`text-[10px] uppercase tracking-widest font-extrabold px-2 py-1 rounded-md ${isOutOfStock ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                                        Stock: {availableStock}
                                                    </span>
                                                    {!isOutOfStock && (
                                                        <div className="bg-gray-100 p-1.5 rounded-full text-gray-600 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                                                            <Plus className="w-4 h-4" />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT COLUMN: SHOPPING CART */}
                    <div className="w-full lg:w-96 flex flex-col bg-white shrink-0 z-20 shadow-[-10px_0_15px_-5px_rgba(0,0,0,0.05)]">

                        {/* Cart Header */}
                        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 shrink-0">
                            <h4 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                                Consumos
                                {totalItems > 0 && (
                                    <span className="bg-indigo-100 text-indigo-700 text-xs py-0.5 px-2 rounded-full">
                                        {totalItems} items
                                    </span>
                                )}
                            </h4>
                            {cart.length > 0 && (
                                <button
                                    onClick={() => setCart([])}
                                    className="text-xs font-bold text-red-500 hover:text-red-700 uppercase tracking-wider"
                                >
                                    Vaciar
                                </button>
                            )}
                        </div>

                        {/* Cart Items */}
                        <div className="flex-1 overflow-y-auto p-2 bg-gray-50/20">
                            {cart.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-gray-400 h-full">
                                    <Receipt className="w-16 h-16 mb-4 opacity-20" />
                                    <p className="text-gray-500 font-medium">El carrito está vacío</p>
                                    <p className="text-sm text-gray-400 mt-1">Selecciona productos de la izquierda</p>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    {cart.map((item) => (
                                        <div key={item.producto.id} className="flex flex-col bg-white border border-gray-100 p-3 rounded-xl shadow-sm">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="font-bold text-gray-800 text-sm">{item.producto.nombre}</span>
                                                <span className="font-black text-gray-900">${(item.producto.precio * item.cantidad).toFixed(2)}</span>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-medium text-gray-500">${item.producto.precio.toFixed(2)} c/u</span>

                                                <div className="flex items-center gap-3">
                                                    <div className="flex items-center bg-gray-100 rounded-lg p-0.5 border border-gray-200 shadow-inner">
                                                        <button
                                                            onClick={() => updateQuantity(item.producto.id, -1)}
                                                            className="p-1 hover:bg-white rounded-md transition-colors text-gray-600 hover:text-gray-900 shadow-sm"
                                                        >
                                                            <Minus className="w-4 h-4" />
                                                        </button>
                                                        <span className="w-8 text-center font-bold text-sm select-none">
                                                            {item.cantidad}
                                                        </span>
                                                        <button
                                                            onClick={() => updateQuantity(item.producto.id, 1)}
                                                            className="p-1 hover:bg-white rounded-md transition-colors text-gray-600 hover:text-gray-900 shadow-sm"
                                                        >
                                                            <Plus className="w-4 h-4" />
                                                        </button>
                                                    </div>

                                                    <button
                                                        onClick={() => removeFromCart(item.producto.id)}
                                                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Checkout Footer */}
                        <div className="p-5 bg-white border-t border-gray-200 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)] shrink-0">
                            <div className="flex justify-between items-end mb-4">
                                <span className="text-gray-500 font-bold uppercase tracking-wider text-xs">Total Parcial</span>
                                <span className="text-3xl font-black text-gray-900 tracking-tight leading-none">${cartTotal.toFixed(2)}</span>
                            </div>

                            <button
                                onClick={handleCheckout}
                                disabled={cart.length === 0 || isCheckingOut}
                                className="w-full bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-bold py-4 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 transform disabled:opacity-50 disabled:active:scale-100 disabled:cursor-not-allowed hover:-translate-y-0.5 active:scale-95"
                            >
                                {isCheckingOut ? (
                                    <>
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                        <span>Procesando consumos...</span>
                                    </>
                                ) : (
                                    <>
                                        <Receipt className="w-6 h-6" />
                                        <span className="text-lg">Confirmar Consumos</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
