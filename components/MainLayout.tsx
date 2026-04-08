"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { usePathname } from "next/navigation";

export default function MainLayout({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const pathname = usePathname();

    // No mostrar navegación en login
    if (pathname === "/login" || pathname === "/") {
        return <>{children}</>;
    }

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            <Sidebar 
                isOpen={isSidebarOpen} 
                onClose={() => setIsSidebarOpen(false)} 
            />
            
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                <Header onOpenSidebar={() => setIsSidebarOpen(true)} />
                <main className="flex-1 overflow-y-auto w-full">
                    {children}
                </main>
            </div>
        </div>
    );
}
