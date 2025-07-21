
import { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Edit, Trash2, Plus, Package } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Product {
  _id: string;
  nome: string;
  preco: number;
  qtdEstoque: number;
}

const Products = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, [token]);

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:3000/products/products', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProducts(data.produtos || []);
      } else {
        const error = await response.json();
        if (error.message !== 'Não existem produtos cadastrados no sistema') {
          toast({
            title: "Erro ao carregar produtos",
            description: error.message,
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      toast({
        title: "Erro de conexão",
        description: "Não foi possível conectar ao servidor",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:3000/products/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast({
          title: "Produto excluído com sucesso!",
        });
        fetchProducts();
      } else {
        const error = await response.json();
        toast({
          title: "Erro ao excluir produto",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro de conexão",
        description: "Não foi possível excluir o produto",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Package className="mx-auto h-12 w-12 text-gray-400 animate-pulse" />
            <p className="mt-2 text-gray-500">Carregando produtos...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Produtos</h2>
            <p className="text-muted-foreground">
              Gerencie os produtos do seu sistema
            </p>
          </div>
          <Button 
            onClick={() => navigate('/products/create')}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Novo Produto
          </Button>
        </div>

        {products.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum produto cadastrado
              </h3>
              <p className="text-gray-500 mb-4">
                Comece criando seu primeiro produto no sistema
              </p>
              <Button 
                onClick={() => navigate('/products/create')}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Criar Produto
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <Card key={product._id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="truncate">{product.nome}</span>
                    {product.qtdEstoque < 10 && (
                      <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                        Baixo
                      </span>
                    )}
                  </CardTitle>
                  <CardDescription>
                    Estoque: {product.qtdEstoque} unidades
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-2xl font-bold text-green-600">
                      R$ {product.preco.toFixed(2)}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/products/edit/${product._id}`)}
                      className="flex-1"
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" className="flex-1">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir o produto "{product.nome}"? 
                            Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteProduct(product._id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Products;
