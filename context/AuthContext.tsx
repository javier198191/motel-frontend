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
}

// Interfaz del Contexto
interface AuthContextType {
    user: AuthUser | null;
    token: string | null;
    isLoading: boolean;
    loginAction: (token: string) => void;
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
        if (storedToken) {
            try {
                // Decodifica el token en memoria sin hacer peticiones extra
                const decoded = jwtDecode<AuthUser>(storedToken);
                setToken(storedToken);
                setUser(decoded);
            } catch (error) {
                console.error("Error restaurando sesión. Token inválido.");
                localStorage.removeItem("motel_token");
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
    const loginAction = (newToken: string) => {
        try {
            const decoded = jwtDecode<AuthUser>(newToken);
            localStorage.setItem("motel_token", newToken);
            setToken(newToken);
            setUser(decoded);
        } catch (error) {
            console.error("No se pudo decodificar el token brindado", error);
        }
    };

    // Función centralizada para desloguear
    const logoutAction = () => {
        localStorage.removeItem("motel_token");
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
