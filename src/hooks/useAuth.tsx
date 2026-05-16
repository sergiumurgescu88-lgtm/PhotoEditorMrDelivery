import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { pb } from '@/lib/pocketbase';

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  profile_photo: string | null;
  credits: number;
  free_credits: number;
  purchased_credits: number;
  daily_usage: number;
  last_usage_date: string;
  account_tier: 'FREE' | 'PREMIUM';
  account_status: 'PENDING_VERIFICATION' | 'ACTIVE' | 'SUSPENDED';
  preferred_currency: string;
  is_email_verified: boolean;
  total_generations: number;
  last_login: string | null;
  created: string;
  updated: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
}

export interface AuthContextType {
  user: AuthUser | null;
  profile: Profile | null;
  isLoading: boolean;
  isAdmin: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const records = await pb.collection('profiles').getList(1, 1, {
        filter: `user_id = "${userId}"`,
      });
      if (records.items.length > 0) {
        setProfile(records.items[0] as unknown as Profile);
      } else {
        // Crează profil nou cu 50 credite gratuite
        const newProfile = await pb.collection('profiles').create({
          user_id: userId,
          credits: 50,
          free_credits: 50,
          purchased_credits: 0,
          daily_usage: 0,
          account_tier: 'FREE',
          account_status: 'ACTIVE',
          total_generations: 0,
          preferred_currency: 'USD',
          is_email_verified: true,
        });
        setProfile(newProfile as unknown as Profile);
      }
    } catch (e) {
      console.error('fetchProfile error:', e);
    }
  }, []);

  const syncUser = useCallback(() => {
    const model = pb.authStore.model;
    if (pb.authStore.isValid && model) {
      setUser({
        id: model.id,
        email: model.email,
        name: model.name,
        avatarUrl: model.avatarUrl,
      });
      fetchProfile(model.id).finally(() => setIsLoading(false));
    } else {
      setUser(null);
      setProfile(null);
      setIsLoading(false);
    }
  }, [fetchProfile]);

  useEffect(() => {
    syncUser();
    const unsub = pb.authStore.onChange(() => syncUser());
    return () => unsub();
  }, [syncUser]);

  const signInWithGoogle = async () => {
    const res = await fetch('/pb/api/collections/users/auth-methods');
    const data = await res.json();
    const providers: any[] = data.authProviders ?? [];
    const googleProvider = providers.find((p: any) => p.name === 'google');
    if (!googleProvider) throw new Error('Google OAuth nu e configurat in PocketBase');

    localStorage.setItem('pb_google_verifier', googleProvider.codeVerifier);
    localStorage.setItem('pb_google_state', googleProvider.state);

    const redirectUrl = window.location.origin + '/pb-callback';
    window.location.href = googleProvider.authUrl + encodeURIComponent(redirectUrl);
  };

  const signOut = async () => {
    pb.authStore.clear();
    setUser(null);
    setProfile(null);
  };

  const refreshProfile = useCallback(async () => {
    if (user?.id) await fetchProfile(user.id);
  }, [user?.id, fetchProfile]);

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!profile?.id) return;
    const updated = await pb.collection('profiles').update(profile.id, updates);
    setProfile(updated as unknown as Profile);
  };

  const isAdmin = false;

  return (
    <AuthContext.Provider value={{
      user, profile, isLoading, isAdmin,
      signInWithGoogle, signOut, refreshProfile, updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
