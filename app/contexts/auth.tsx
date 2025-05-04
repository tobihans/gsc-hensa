import { onAuthStateChanged, type User } from "firebase/auth";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { auth } from "~/firebase.config";

export type AuthUser = Pick<
  User,
  | "uid"
  | "email"
  | "emailVerified"
  | "isAnonymous"
  | "displayName"
  | "metadata"
  | "phoneNumber"
  | "photoURL"
>;

export interface AuthContextType {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user: AuthUser | null) => {
      setUser(
        user
          ? {
            uid: user.uid,
            email: user.email,
            emailVerified: user.emailVerified,
            isAnonymous: user.isAnonymous,
            displayName: user.displayName,
            metadata: user.metadata,
            phoneNumber: user.phoneNumber,
            photoURL: user.photoURL,
          }
          : null
      );
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("Missing context. Wrap your component in AuthProvider.");
  }

  return context;
};
