"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, User, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { jwtDecode } from "jwt-decode";
import { API_URL } from "@/src/config/api";

export default function LoginPage() {
    const [nombre, setNombre] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const { loginAction } = useAuth();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Intentando conectar a:", process.env.NEXT_PUBLIC_API_URL);

        setLoading(true);
        setError(null);

        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ nombre, password }),
            });

            if (!res.ok) {
                throw new Error("Credenciales inválidas o error en el servidor.");
            }

            const data = await res.json();
            console.log("Login - Respuesta completa del backend:", data);

            if (data.access_token) {
                // Actualiza estado global y localStorage
                loginAction(data.access_token, data.sedeId);
                
                // Decodifica para decidir la redirección
                const decoded: any = jwtDecode(data.access_token);
                
                if (decoded.rol === 'ADMIN') {
                    router.push("/admin/productos");
                } else {
                    router.push("/recepcion");
                }
            } else {
                throw new Error("El servidor no devolvió un token válido.");
            }
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Error inesperado al intentar iniciar sesión."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                <div className="px-8 pt-10 pb-8 bg-blue-600 text-white text-center">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 border border-white/30">
                        <KeyRound className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight">Iniciar Sesión</h1>
                    <p className="text-blue-100 mt-2 font-medium">Acceso al sistema de gestión</p>
                </div>

                <div className="p-8">
                    <form onSubmit={handleLogin} className="space-y-6">
                        {error && (
                            <div className="flex items-center gap-3 bg-red-50 text-red-700 p-4 rounded-xl border border-red-100 text-sm font-medium">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <p>{error}</p>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Usuario
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    required
                                    value={nombre}
                                    onChange={(e) => setNombre(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 text-gray-900 transition-colors shadow-sm"
                                    placeholder="Ingrese su nombre de usuario"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Contraseña
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <KeyRound className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 text-gray-900 transition-colors shadow-sm"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
                                    Conectando...
                                </>
                            ) : (
                                "Ingresar al Sistema"
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
