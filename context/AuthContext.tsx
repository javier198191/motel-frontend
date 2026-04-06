"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import api from "@/lib/api"; // Opcional por si en un futuro necesitas el API aquí

// Interfaz del Usuario extraída del JWT
export interface AuthUser {
    sub: number;       // ID del usuario
    nombre: string;    // Nombre
    rol: string;       // Rol (Ej: ADMIN, RECEPCION)
    sedeId: string | number; // ID de la sede
}

// Interfaz del Contexto
interface AuthContextType {
    user: AuthUser | null;
    token: string | null;
    isLoading: boolean;
    loginAction: (token: string, explicitSedeId?: string | number) => void;
    logoutAction: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    // Restaurar sesión al recargar la página
    useEffect(() => {
        const storedToken = localStorage.getItem("motel_token");
        const storedSedeId = localStorage.getItem("motel_sede_id");
        if (storedToken) {
            try {
                // Decodifica el token en memoria sin hacer peticiones extra
                const decoded = jwtDecode<AuthUser>(storedToken);
                
                // Si había un sedeId guardado manualmente, lo inyectamos al usuario
                if (storedSedeId) {
                    decoded.sedeId = isNaN(Number(storedSedeId)) ? storedSedeId : Number(storedSedeId);
                }

                setToken(storedToken);
                setUser(decoded);
            } catch (error) {
                console.error("Error restaurando sesión. Token inválido.");
                localStorage.removeItem("motel_token");
                localStorage.removeItem("motel_sede_id");
                setToken(null);
                setUser(null);
            }
        }
        setIsLoading(false);
    }, []);

    // Proteger rutas directamente en el AuthContext
    // Si isLoading es false, y el usuario no está, y no está en login, redirige (Opcional)
    // useEffect(() => {
    //    if (!isLoading && !user && pathname !== "/login" && pathname !== "/") {
    //       router.push("/login");
    //    }
    // }, [user, isLoading, pathname, router]);

    // Función que se llamará en LoginPage al recibir el token exitoso
    const loginAction = (newToken: string, explicitSedeId?: string | number) => {
        try {
            const decoded = jwtDecode<AuthUser>(newToken);
            localStorage.setItem("motel_token", newToken);
            
            // Si el sedeId viene fuera del token o queremos guardarlo explícitamente
            const finalSedeId = explicitSedeId ?? decoded.sedeId;
            if (finalSedeId) {
                localStorage.setItem("motel_sede_id", finalSedeId.toString());
                decoded.sedeId = finalSedeId;
            }

            setToken(newToken);
            setUser(decoded);
        } catch (error) {
            console.error("No se pudo decodificar el token brindado", error);
        }
    };

    // Función centralizada para desloguear
    const logoutAction = () => {
        localStorage.removeItem("motel_token");
        localStorage.removeItem("motel_sede_id");
        setToken(null);
        setUser(null);
        router.push("/login");
    };

    return (
        <AuthContext.Provider value={{ user, token, isLoading, loginAction, logoutAction }}>
            {children}
        </AuthContext.Provider>
    );
}

// Hook personalizado para consumir la autenticación
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth debe ser usado dentro de un AuthProvider");
    }
    return context;
}
