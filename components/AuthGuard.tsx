"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

// Rutas a las que se puede acceder sin token (o que redirigen si ya estás logueado)
const publicRoutes = ["/login", "/"];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const { token, isLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (isLoading) return;

        const isPublicRoute = publicRoutes.includes(pathname);

        if (!token && !isPublicRoute) {
            // No hay token y trata de acceder a una ruta privada -> Mandamos al login
            router.replace("/login");
        } else if (token && isPublicRoute) {
            // Ya hay token y trata de acceder al login o a la raíz -> Mandamos al panel principal
            router.replace("/recepcion");
        }
    }, [token, isLoading, pathname, router]);

    // 1. Estado de carga inicial
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
            </div>
        );
    }

    const isPublicRoute = publicRoutes.includes(pathname);

    // 2. Bloquear renderizado si vamos a redirigir por no tener token
    if (!token && !isPublicRoute) {
        return null;
    }

    // 3. Bloquear renderizado si vamos a redirigir por ya estar logueado y estar en /login
    if (token && isPublicRoute) {
        return null;
    }

    // 4. Renderizamos el contenido finalmente si todo es válido
    return <>{children}</>;
}
