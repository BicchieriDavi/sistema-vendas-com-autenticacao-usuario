
import { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart, Package, Calendar, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Order {
  _id: string;
  usuario: string;
  produtos: Array<{
    produto: {
      _id: string;
      nome: string;
      preco: number;
    };
    quantidade: number;
  }>;
  dataPedido: string;
}

interface Product {
  _id: string;
  nome: string;
  preco: number;
  qtdEstoque: number;
}

const Orders = () => {
  const { token } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  useEffect(() => {
    fetchOrders();
    fetchProducts();
  }, [token]);

  const fetchOrders = async () => {
    try {
      const response = await fetch('http://localhost:3000/orders/orders', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data.pedidos || []);
      } else {
        const error = await response.json();
        if (error.message !== 'Não existem pedidos') {
          toast({
            title: "Erro ao carregar pedidos",
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
      }
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
    }
  };

  const handleCreateOrder = async () => {
    if (!selectedProduct || !quantity) {
      toast({
        title: "Campos obrigatórios",
        description: "Selecione um produto e quantidade",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingOrder(true);

    try {
      const response = await fetch('http://localhost:3000/orders/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          produtos: [{
            produto: selectedProduct,
            quantidade: parseInt(quantity),
          }],
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Pedido criado com sucesso!",
          description: "O pedido foi adicionado ao sistema.",
        });
        setIsDialogOpen(false);
        setSelectedProduct('');
        setQuantity('1');
        fetchOrders();
      } else {
        toast({
          title: "Erro ao criar pedido",
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
      setIsCreatingOrder(false);
    }
  };

  const calculateOrderTotal = (order: Order) => {
    return order.produtos.reduce((total, item) => {
      if (item.produto) return total + (item.produto.preco * item.quantidade);
      else return total;
    }, 0);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <ShoppingCart className="mx-auto h-12 w-12 text-gray-400 animate-pulse" />
            <p className="mt-2 text-gray-500">Carregando pedidos...</p>
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
            <h2 className="text-3xl font-bold tracking-tight">Pedidos</h2>
            <p className="text-muted-foreground">
              Visualize e gerencie os pedidos do sistema
            </p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4" />
                Novo Pedido
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Novo Pedido</DialogTitle>
                <DialogDescription>
                  Selecione um produto e quantidade para criar um pedido
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="product">Produto</Label>
                  <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um produto" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product._id} value={product._id}>
                          {product.nome} - R$ {product.preco.toFixed(2)} (Estoque: {product.qtdEstoque})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantidade</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                </div>

                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleCreateOrder}
                    disabled={isCreatingOrder}
                    className="flex-1"
                  >
                    {isCreatingOrder ? "Criando..." : "Criar Pedido"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {orders.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <ShoppingCart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum pedido encontrado
              </h3>
              <p className="text-gray-500 mb-4">
                Crie seu primeiro pedido no sistema
              </p>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="mr-2 h-4 w-4" />
                    Criar Pedido
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Criar Novo Pedido</DialogTitle>
                    <DialogDescription>
                      Selecione um produto e quantidade para criar um pedido
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="product">Produto</Label>
                      <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um produto" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((product) => (
                            <SelectItem key={product._id} value={product._id}>
                              {product.nome} - R$ {product.preco.toFixed(2)} (Estoque: {product.qtdEstoque})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="quantity">Quantidade</Label>
                      <Input
                        id="quantity"
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                      />
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                        className="flex-1"
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={handleCreateOrder}
                        disabled={isCreatingOrder}
                        className="flex-1"
                      >
                        {isCreatingOrder ? "Criando..." : "Criar Pedido"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order._id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center space-x-2">
                      <ShoppingCart className="h-5 w-5" />
                      <span>Pedido #{order._id.slice(-6)}</span>
                    </span>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">
                        R$ {calculateOrderTotal(order).toFixed(2)}
                      </div>
                    </div>
                  </CardTitle>
                  <CardDescription className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {format(new Date(order.dataPedido), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", {
                        locale: ptBR,
                      })}
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center space-x-2">
                      <Package className="h-4 w-4" />
                      <span>Produtos:</span>
                    </h4>
                    {order.produtos.filter(item => item.produto).map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{item.produto.nome}</p>
                          <p className="text-sm text-gray-600">
                            Quantidade: {item.quantidade} unidades
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">R$ {item.produto.preco.toFixed(2)}</p>
                          <p className="text-sm text-gray-600">
                            Total: R$ {(item.produto.preco * item.quantidade).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
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

export default Orders;
