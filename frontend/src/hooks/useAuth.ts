import { create } from 'zustand';
import { api } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

interface User {
  _id: string;
  nome: string;
  email: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, senha: string) => Promise<void>;
  register: (nome: string, email: string, senha: string) => Promise<void>;
  logout: () => void;
  initializeAuth: () => void;
}

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: false,
  isAuthenticated: false,

  login: async (email: string, senha: string) => {
    set({ isLoading: true });
    try {
      const response = await api.login(email, senha);
      const token = response.token;
      
      localStorage.setItem('token', token);
      
      // Decode token to get user info (simple JWT decode)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const user = { _id: payload.id, nome: '', email };
      
      set({ 
        user, 
        token, 
        isAuthenticated: true, 
        isLoading: false 
      });
      
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo de volta.",
      });
    } catch (error) {
      set({ isLoading: false });
      toast({
        title: "Erro no login",
        description: error instanceof Error ? error.message : "Falha na autenticação",
        variant: "destructive",
      });
      throw error;
    }
  },

  register: async (nome: string, email: string, senha: string) => {
    set({ isLoading: true });
    try {
      const response = await api.register(nome, email, senha);
      
      set({ isLoading: false });
      
      toast({
        title: "Conta criada com sucesso!",
        description: "Agora você pode fazer login.",
      });
    } catch (error) {
      set({ isLoading: false });
      toast({
        title: "Erro no registro",
        description: error instanceof Error ? error.message : "Falha ao criar conta",
        variant: "destructive",
      });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ 
      user: null, 
      token: null, 
      isAuthenticated: false 
    });
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso.",
    });
  },

  initializeAuth: () => {
    // Não fazer auto-login, apenas limpar tokens expirados
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Date.now() / 1000;
        
        if (payload.exp <= currentTime) {
          localStorage.removeItem('token');
        }
      } catch (error) {
        localStorage.removeItem('token');
      }
    }
  },
}));