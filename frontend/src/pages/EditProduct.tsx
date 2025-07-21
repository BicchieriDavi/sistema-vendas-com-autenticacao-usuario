
import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2 } from 'lucide-react';

const EditProduct = () => {
  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState('');
  const [qtdEstoque, setQtdEstoque] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProduct, setIsLoadingProduct] = useState(true);
  const { token } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { id } = useParams();

  useEffect(() => {
    fetchProduct();
  }, [id, token]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`http://localhost:3000/products/products/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const product = data.produto;
        setNome(product.nome);
        setPreco(product.preco.toString());
        setQtdEstoque(product.qtdEstoque.toString());
      } else {
        const error = await response.json();
        toast({
          title: "Erro ao carregar produto",
          description: error.message,
          variant: "destructive",
        });
        navigate('/products');
      }
    } catch (error) {
      toast({
        title: "Erro de conexão",
        description: "Não foi possível carregar o produto",
        variant: "destructive",
      });
      navigate('/products');
    } finally {
      setIsLoadingProduct(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`http://localhost:3000/products/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          nome,
          preco: parseFloat(preco),
          qtdEstoque: parseInt(qtdEstoque),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Produto atualizado com sucesso!",
          description: `O produto "${nome}" foi atualizado.`,
        });
        navigate('/products');
      } else {
        toast({
          title: "Erro ao atualizar produto",
          description: data.message,
          variant: "destructive",
        });
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

  if (isLoadingProduct) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="mx-auto h-12 w-12 text-gray-400 animate-spin" />
            <p className="mt-2 text-gray-500">Carregando produto...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/products')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft size={16} />
            <span>Voltar</span>
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Editar Produto</h2>
            <p className="text-muted-foreground">
              Atualize as informações do produto
            </p>
          </div>
        </div>

        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Informações do Produto</CardTitle>
            <CardDescription>
              Modifique os dados do produto conforme necessário
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome do Produto</Label>
                <Input
                  id="nome"
                  type="text"
                  placeholder="Digite o nome do produto"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="preco">Preço (R$)</Label>
                  <Input
                    id="preco"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={preco}
                    onChange={(e) => setPreco(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="qtdEstoque">Quantidade em Estoque</Label>
                  <Input
                    id="qtdEstoque"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={qtdEstoque}
                    onChange={(e) => setQtdEstoque(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="flex space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/products')}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Atualizando...
                    </>
                  ) : (
                    'Atualizar Produto'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default EditProduct;
