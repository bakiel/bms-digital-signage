import React, { createContext, useState, useEffect, useContext } from 'react';
    import { Session, User } from '@supabase/supabase-js';
    import { supabase } from '../utils/supabaseClient'; // Corrected path

    type AuthContextType = {
      session: Session | null;
      user: User | null;
      signIn: (email: string, password: string) => Promise<{
        error: any | null;
        data: any | null; // Keep data type flexible for potential session/user object
      }>;
      signOut: () => Promise<void>;
      loading: boolean;
    };

    const AuthContext = createContext<AuthContextType | undefined>(undefined);

    export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
      const [session, setSession] = useState<Session | null>(null);
      const [user, setUser] = useState<User | null>(null);
      const [loading, setLoading] = useState(true);

      useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
        }).catch(error => {
          console.error("Error getting session:", error);
          setLoading(false);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
          }
        );

        // Cleanup subscription on unmount
        return () => {
          subscription?.unsubscribe(); // Add null check for safety
        };
      }, []);

      const signIn = async (email: string, password: string) => {
        // signInWithPassword returns { data: { session, user }, error }
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        return { data, error }; // Return the whole object
      };

      const signOut = async () => {
        await supabase.auth.signOut();
        // Session/user state will be updated by onAuthStateChange listener
      };

      const value = {
        session,
        user,
        signIn,
        signOut,
        loading,
      };

      // Render children only when not loading initially
      return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
    };

    export const useAuth = () => {
      const context = useContext(AuthContext);
      if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
      }
      return context;
    };