
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useNavigate, useLocation } from 'react-router-dom';
import { Package, ShoppingCart, Home, LogOut, Plus } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-bold text-gray-900">Sistema de Vendas</h1>
              
              <div className="flex space-x-4">
                <Button
                  variant={isActive('/') ? 'default' : 'ghost'}
                  onClick={() => navigate('/')}
                  className="flex items-center space-x-2"
                >
                  <Home size={16} />
                  <span>Dashboard</span>
                </Button>
                
                <Button
                  variant={isActive('/products') ? 'default' : 'ghost'}
                  onClick={() => navigate('/products')}
                  className="flex items-center space-x-2"
                >
                  <Package size={16} />
                  <span>Produtos</span>
                </Button>
                
                <Button
                  variant={isActive('/orders') ? 'default' : 'ghost'}
                  onClick={() => navigate('/orders')}
                  className="flex items-center space-x-2"
                >
                  <ShoppingCart size={16} />
                  <span>Pedidos</span>
                </Button>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => navigate('/products/create')}
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
              >
                <Plus size={16} />
                <span>Novo Produto</span>
              </Button>
              
              <Button
                variant="outline"
                onClick={handleLogout}
                className="flex items-center space-x-2"
              >
                <LogOut size={16} />
                <span>Sair</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>
      
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};
