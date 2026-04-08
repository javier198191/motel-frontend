"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Hotel, Wallet, Package, LogOut, UserCircle, Lock, FileText } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
    const pathname = usePathname();
    const { user: usuarioActual, logoutAction } = useAuth();

    // No mostrar navbar en login
    if (pathname === "/login" || pathname === "/") return null;

    const links = [
        {
            href: "/recepcion",
            label: "Recepción",
            icon: <Hotel className="w-5 h-5" />,
            roles: ['ADMIN', 'RECEPCION']
        },
        {
            href: "/caja",
            label: "Control de Caja",
            icon: <Wallet className="w-5 h-5" />,
            roles: ['ADMIN', 'RECEPCION']
        },
        {
            href: "/dian",
            label: "Facturación DIAN",
            icon: <FileText className="w-5 h-5" />,
            roles: ['ADMIN', 'RECEPCION']
        },
        {
            href: "/admin/auditoria",
            label: "Auditoría",
            icon: <FileText className="w-5 h-5" />,
            roles: ['ADMIN']
        },
        {
            href: "/admin/habitaciones",
            label: "Habitaciones",
            icon: <Lock className="w-5 h-5" />,
            roles: ['ADMIN']
        },
        {
            href: "/admin/productos",
            label: "Inventario",
            icon: <Package className="w-5 h-5" />,
            roles: ['ADMIN']
        }
    ];

    // Lógica para filtrar los links que el usuario SÍ puede ver
    // Si usuarioActual es null (ej. renderizando en servidor o token no cargado), mostramos vacío por defecto
    const allowedLinks = usuarioActual ? links.filter(link => link.roles.includes(usuarioActual.rol)) : [];

    const handleLogout = () => {
        logoutAction();
    };

    return (
        <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-auto py-2 md:h-16 gap-4">
                    <div className="flex flex-col md:flex-row w-full items-start md:items-center gap-2 md:gap-6 overflow-hidden">
                        <div className="flex-shrink-0 flex items-center px-4 md:px-0">
                            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                MotelAdmin
                            </span>
                        </div>

                        <div className="flex overflow-x-auto no-scrollbar whitespace-nowrap items-center gap-2 px-4 pb-2 md:pb-0 w-full snap-x">
                            {allowedLinks.map((link) => {
                                const isActive = pathname === link.href;
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all snap-start ${isActive
                                                ? "bg-slate-800 text-white shadow-sm pointer-events-none"
                                                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                                            }`}
                                    >
                                        <span className={`${isActive ? "text-blue-400" : "text-gray-400 group-hover:text-gray-600"}`}>
                                            {link.icon}
                                        </span>
                                        {link.label}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right side: Secondary Links, User Profile & Logout */}
                    <div className="flex items-center gap-4">
                        {/* Admin Links Integrated in main scrollable div above */}


                        <div className="w-px h-8 bg-gray-200 hidden sm:block"></div>

                        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-100 min-w-[120px] justify-end">
                            {usuarioActual ? (
                                <>
                                    <UserCircle className="w-5 h-5 text-gray-400" />
                                    <div className="flex flex-col text-right">
                                        <span className="text-xs font-bold text-gray-900 leading-none">{usuarioActual.nombre}</span>
                                        <span className="text-[10px] font-bold text-blue-600 tracking-wider mt-0.5">{usuarioActual.rol}</span>
                                    </div>
                                </>
                            ) : (
                                <div className="animate-pulse flex space-x-2 w-full justify-end">
                                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                                </div>
                            )}
                        </div>

                        <button 
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all hover:scale-105 active:scale-95 hover:shadow-sm"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="hidden sm:inline">Cerrar Sesión</span>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
