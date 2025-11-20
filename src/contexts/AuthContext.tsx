import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { deleteCookie, getCookie } from "cookies-next";
import { useRouter } from "next/router";
import { jwtDecode } from "jwt-decode";

export interface User {
  id: string;
  email: string;
}

//  Описуємо "форму" даних, які будуть у контексті
interface AuthContextType {
  user: User | null;
  logout: () => void; // logout
}

//  Створюємо контекст, вказуючи його тип. Початкове значення - null.
const AuthContext = createContext<AuthContextType | null>(null);

// Типізуємо props для AuthProvider
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  //  Типізуємо стан
  
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = getCookie("token");
    if (token) {
      try {
       const decodedToken: any = jwtDecode(token as string);
       setUser({ id: decodedToken.id, email: decodedToken.email });
      } catch (error) {
        console.error("Invalid token:", error);
        // Якщо токен недійсний, "розлогінюємо" користувача
        setUser(null);
        deleteCookie("token");
      }
    } else {
      setUser(null);
    }
  }, [router.asPath]); // Перевіряємо при кожній зміні маршруту

  const logout = () => {
    deleteCookie("token");
    setUser(null);
    router.push("/login"); //  перенаправляти на сторінку логіну
  };

  return (
    <AuthContext.Provider value={{ user, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

//  Оновлюємо хук, щоб він повертав правильний тип і обробляв помилку
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    // Ця помилка виникне, якщо  спробувати використати useAuth() поза <AuthProvider>
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
