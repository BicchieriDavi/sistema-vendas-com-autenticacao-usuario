
import { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '../contexts/AuthContext';
import { Package, ShoppingCart, TrendingUp, Users } from 'lucide-react';

interface Stats {
  totalProducts: number;
  totalOrders: number;
  lowStockProducts: number;
}

const Dashboard = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    totalOrders: 0,
    lowStockProducts: 0,
  });
  const [recentProducts, setRecentProducts] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, [token]);

  const fetchDashboardData = async () => {
    try {
      // Buscar produtos
      const productsResponse = await fetch('http://localhost:3000/products/products', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (productsResponse.ok) {
        const productsData = await productsResponse.json();
        const products = productsData.produtos || [];
        
        setStats(prev => ({
          ...prev,
          totalProducts: products.length,
          lowStockProducts: products.filter((p: any) => p.qtdEstoque < 10).length,
        }));
        
        setRecentProducts(products.slice(0, 5));
      }

      // Buscar pedidos
      const ordersResponse = await fetch('http://localhost:3000/orders/orders', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json();
        const orders = ordersData.pedidos || [];
        
        setStats(prev => ({
          ...prev,
          totalOrders: orders.length,
        }));
      }
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Visão geral do seu sistema de vendas
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Produtos
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
              <p className="text-xs text-muted-foreground">
                produtos cadastrados
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Pedidos
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
              <p className="text-xs text-muted-foreground">
                pedidos realizados
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Estoque Baixo
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.lowStockProducts}</div>
              <p className="text-xs text-muted-foreground">
                produtos com estoque baixo
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Sistema Ativo
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Online</div>
              <p className="text-xs text-muted-foreground">
                funcionando perfeitamente
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Produtos Recentes</CardTitle>
            <CardDescription>
              Os últimos produtos cadastrados no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentProducts.length > 0 ? (
                recentProducts.map((product) => (
                  <div key={product._id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{product.nome}</p>
                      <p className="text-sm text-muted-foreground">
                        Estoque: {product.qtdEstoque} unidades
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">
                        R$ {product.preco.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  Nenhum produto cadastrado ainda
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Dashboard;
