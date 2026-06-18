import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";
import { useRouter } from "expo-router";
import React, {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";

type AuthMode = "loggedIn" | "guest" | null;

interface AuthContextValue {
  mode: AuthMode;
  session: Session | null;
  isLoggedIn: boolean;
  isGuest: boolean;
  loading: boolean;
  setGuest: () => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  mode: null,
  session: null,
  isLoggedIn: false,
  isGuest: false,
  loading: true,
  setGuest: () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<AuthMode>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSession(session);
        setMode("loggedIn");
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "INITIAL_SESSION") return;
      if (session) {
        setSession(session);
        setMode("loggedIn");
      } else if (event === "SIGNED_OUT") {
        setSession(null);
        setMode(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const setGuest = () => setMode("guest");
  const signOut = async () => {
    await supabase.auth.signOut();
    router.replace("/LogInPage");
  };
  return (
    <AuthContext.Provider
      value={{
        mode,
        session,
        isLoggedIn: mode === "loggedIn",
        isGuest: mode === "guest",
        loading,
        setGuest,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
