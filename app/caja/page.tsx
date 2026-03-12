"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, Banknote, Lock, LogOut, Loader2, ArrowDownToLine, Wallet } from "lucide-react";
import PanelCaja from "@/components/PanelCaja";

export default function CajaPage() {
    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-10 font-sans text-gray-900">
            <div className="max-w-4xl mx-auto space-y-8">
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
                            <Wallet className="w-10 h-10 text-blue-600" />
                            Gestión de Caja
                        </h1>
                        <p className="text-gray-500 font-medium mt-2 text-lg">
                            Administración centralizada del flujo de efectivo y turnos operativos
                        </p>
                    </div>
                </header>

                <main>
                    <PanelCaja />
                </main>
            </div>
        </div>
    );
}
