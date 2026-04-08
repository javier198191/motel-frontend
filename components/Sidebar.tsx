"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Hotel, Wallet, Package, FileText, Lock, X, LayoutDashboard, ChevronLeft, Menu } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    isCollapsed: boolean;
    onToggleCollapse: () => void;
}

export default function Sidebar({ isOpen, onClose, isCollapsed, onToggleCollapse }: SidebarProps) {
    const pathname = usePathname();
    const { user: usuarioActual } = useAuth();

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
            icon: <LayoutDashboard className="w-5 h-5" />,
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

    const allowedLinks = usuarioActual ? links.filter(link => link.roles.includes(usuarioActual.rol)) : [];

    // Sidebar classes
    const sidebarClasses = `
        fixed inset-y-0 left-0 z-50 bg-slate-900 text-slate-300 transform transition-all duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        ${isCollapsed ? "md:w-20" : "md:w-64"}
        md:relative md:translate-x-0 border-r border-slate-800 flex flex-col w-64
    `;

    return (
        <>
            {/* Overlay for mobile */}
            {isOpen && (
                <div 
                    className="fixed inset-0 z-40 bg-black/50 md:hidden"
                    onClick={onClose}
                ></div>
            )}

            <aside className={sidebarClasses}>
                <div className={`h-16 flex items-center border-b border-slate-800 transition-all duration-300 ${isCollapsed ? "justify-center px-0" : "justify-between px-6"}`}>
                    {!isCollapsed && <span className="text-xl font-black text-white tracking-tight truncate">MotelAdmin</span>}
                    
                    <button 
                        onClick={onClose} 
                        className="md:hidden p-1 hover:bg-slate-800 rounded-lg"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    <button 
                        onClick={onToggleCollapse}
                        className="hidden md:flex p-1.5 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-white transition-colors"
                    >
                        {isCollapsed ? <Menu className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1 no-scrollbar">
                    {allowedLinks.map((link) => {
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => { if (window.innerWidth < 768) onClose(); }}
                                className={`
                                    flex items-center gap-3 rounded-xl text-sm font-bold transition-all duration-300
                                    ${isCollapsed ? "justify-center px-0 py-3" : "px-4 py-3"}
                                    ${isActive 
                                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" 
                                        : "hover:bg-slate-800 hover:text-white"
                                    }
                                `}
                                title={isCollapsed ? link.label : ""}
                            >
                                <span className={`transition-all duration-300 ${isActive ? "text-white" : "text-slate-500"}`}>
                                    {link.icon}
                                </span>
                                {!isCollapsed && <span className="truncate">{link.label}</span>}
                            </Link>
                        );
                    })}
                </nav>

                <div className={`p-4 border-t border-slate-800 transition-all duration-300 ${isCollapsed ? "opacity-0" : "opacity-100"}`}>
                    <div className="bg-slate-800/50 rounded-2xl p-4 whitespace-nowrap overflow-hidden">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Sistema</p>
                        <p className="text-xs font-bold text-slate-300">v2.0 Stable</p>
                    </div>
                </div>
            </aside>
        </>
    );
}
