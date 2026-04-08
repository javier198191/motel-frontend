"use client";

import { Menu, LogOut, UserCircle, MapPin } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface HeaderProps {
    onOpenSidebar: () => void;
}

export default function Header({ onOpenSidebar }: HeaderProps) {
    const { user: usuarioActual, logoutAction } = useAuth();

    return (
        <header className="h-16 bg-white border-b border-gray-200 sticky top-0 z-30 flex items-center justify-between px-4 md:px-8 shadow-sm">
            <div className="flex items-center gap-4">
                <button 
                    onClick={onOpenSidebar}
                    className="p-2 hover:bg-gray-100 rounded-lg md:hidden"
                >
                    <Menu className="w-6 h-6 text-gray-600" />
                </button>
                
                <div className="hidden md:flex items-center gap-2 text-slate-500">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm font-bold uppercase tracking-widest text-indigo-600">Sede Principal</span>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-100">
                    {usuarioActual ? (
                        <>
                            <div className="flex flex-col text-right hidden sm:flex">
                                <span className="text-xs font-black text-slate-900 leading-none">{usuarioActual.nombre}</span>
                                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-tighter mt-0.5">{usuarioActual.rol}</span>
                            </div>
                            <UserCircle className="w-8 h-8 text-slate-400 border-2 border-white rounded-full shadow-sm" />
                        </>
                    ) : (
                        <div className="w-8 h-8 bg-slate-200 animate-pulse rounded-full" />
                    )}
                </div>

                <div className="w-px h-8 bg-gray-200"></div>

                <button 
                    onClick={() => logoutAction()}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                    title="Cerrar Sesión"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="hidden sm:inline">Salir</span>
                </button>
            </div>
        </header>
    );
}
