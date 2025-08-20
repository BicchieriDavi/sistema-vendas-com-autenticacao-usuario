// Configuração da URL da API
const API_BASE_URL = 'http://localhost:3000';

interface ApiError {
  message: string;
}

interface ApiResponse<T = any> {
  message: string;
  data?: T;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Network error');
    }
  }

  // Auth endpoints
  async login(email: string, senha: string) {
    return this.request<{ message: string; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, senha }),
    });
  }

  async register(nome: string, email: string, senha: string) {
    return this.request<{ message: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ nome, email, senha }),
    });
  }

  // Products endpoints
  async getProducts() {
    return this.request<{ message: string; produtos: any[] }>('/products');
  }

  async getProduct(id: string) {
    return this.request<{ message: string; produto: any }>(`/products/${id}`);
  }

  async createProduct(nome: string, preco: number, qtdEstoque: number) {
    return this.request<{ message: string; newProduct: any }>('/products', {
      method: 'POST',
      body: JSON.stringify({ nome, preco, qtdEstoque }),
    });
  }

  async updateProduct(id: string, data: { nome?: string; preco?: number; qtdEstoque?: number }) {
    return this.request<{ message: string; produtoAtualizado: any }>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteProduct(id: string) {
    return this.request<{ message: string }>(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  // Orders endpoints
  async getOrders() {
    return this.request<{ message: string; pedidos: any[] }>('/orders');
  }

  async getOrder(id: string) {
    return this.request<{ message: string; pedido: any }>(`/orders/${id}`);
  }

  async createOrder(produtos: { produto: string; quantidade: number }[]) {
    return this.request<{ message: string; pedido: any }>('/orders', {
      method: 'POST',
      body: JSON.stringify({ produtos }),
    });
  }

  async deleteOrder(id: string) {
    return this.request<{ message: string }>(`/orders/${id}`, {
      method: 'DELETE',
    });
  }
}

export const api = new ApiClient(API_BASE_URL);