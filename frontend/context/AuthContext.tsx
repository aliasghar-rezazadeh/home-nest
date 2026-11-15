
// "use client";

// import {
//     createContext,
//     useCallback,
//     useContext,
//     useEffect,
//     useState,
//     type ReactNode,
// } from "react";

// import {
//     getAccessToken,
//     getCurrentUser,
//     logout as logoutService,
//     type AuthUser,
// } from "@/api/services/auth.service";

// interface AuthContextType {
//     user: AuthUser | null;
//     isAuthenticated: boolean;
//     isLoading: boolean;
//     refreshUser: () => Promise<void>;
//     logout: () => void;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export function AuthProvider({ children }: { children: ReactNode }) {
//     const [user, setUser] = useState<AuthUser | null>(null);
//     const [isLoading, setIsLoading] = useState(true);

//     const refreshUser = useCallback(async () => {
//         const token = getAccessToken();

//         if (!token) {
//             setUser(null);
//             setIsLoading(false);
//             return;
//         }

//         try {
//             setIsLoading(true);

//             const userData = await getCurrentUser();
//             setUser(userData);
//         } catch (error) {
//             console.error("Authentication error:", error);

//             logoutService();
//             setUser(null);
//         } finally {
//             setIsLoading(false);
//         }
//     }, []);

//     const logout = () => {
//         logoutService();
//         setUser(null);
//     };

//     useEffect(() => {
//         refreshUser();
//     }, [refreshUser]);

//     return (
//         <AuthContext.Provider
//             value={{
//                 user,
//                 isAuthenticated: !!user,
//                 isLoading,
//                 refreshUser,
//                 logout,
//             }}
//         >
//             {children}
//         </AuthContext.Provider>
//     );
// }

// export function useAuth() {
//     const context = useContext(AuthContext);

//     if (!context) {
//         throw new Error("useAuth must be used inside AuthProvider");
//     }

//     return context;
// }




"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";

import {
    getAccessToken,
    getCurrentUser,
    logout as logoutService,
    type AuthUser,
} from "@/api/services/auth.service";

interface AuthContextType {
    user: AuthUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    refreshUser: () => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const refreshUser = useCallback(async () => {
        const token = getAccessToken();

        if (!token) {
            setUser(null);
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);

            const userData = await getCurrentUser();
            setUser(userData);
        } catch (error) {
            console.error("Authentication error:", error);

            logoutService();
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const logout = () => {
        logoutService();
        setUser(null);
    };

    useEffect(() => {
        refreshUser();
    }, [refreshUser]);

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                refreshUser,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used inside AuthProvider");
    }

    return context;
}
