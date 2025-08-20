import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/enhanced-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Plus, ShoppingCart, Trash2, Calendar, Package } from 'lucide-react';

interface Product {
  _id: string;
  nome: string;
  preco: number;
  qtdEstoque: number;
}

interface OrderItem {
  produto: Product;
  quantidade: number;
}

interface Order {
  _id: string;
  usuario: string;
  produtos: OrderItem[];
  dataPedido: string;
}

const Orders = () => {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [orderItems, setOrderItems] = useState<{ produto: string; quantidade: number }[]>([]);

  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => api.getOrders(),
    retry: 2,
    staleTime: 1000 * 60 * 5, // 5 minutos
    refetchOnWindowFocus: false,
  });

  const { data: productsData } = useQuery({
    queryKey: ['products'],
    queryFn: () => api.getProducts(),
    retry: 2,
    staleTime: 1000 * 60 * 5, // 5 minutos
    refetchOnWindowFocus: false,
  });

  const createMutation = useMutation({
    mutationFn: (produtos: { produto: string; quantidade: number }[]) =>
      api.createOrder(produtos),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setIsCreateOpen(false);
      setOrderItems([]);
      toast({
        title: "Pedido criado",
        description: "Pedido realizado com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast({
        title: "Pedido removido",
        description: "Pedido removido com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const orders: Order[] = ordersData?.pedidos || [];
  const products: Product[] = productsData?.produtos || [];

  const addOrderItem = () => {
    setOrderItems([...orderItems, { produto: '', quantidade: 1 }]);
  };

  const updateOrderItem = (index: number, field: 'produto' | 'quantidade', value: string | number) => {
    const updated = [...orderItems];
    updated[index] = { ...updated[index], [field]: value };
    setOrderItems(updated);
  };

  const removeOrderItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const handleCreateOrder = () => {
    const validItems = orderItems.filter(item => item.produto && item.quantidade > 0);

    if (validItems.length === 0) {
      toast({
        title: "Erro",
        description: "Adicione pelo menos um produto ao pedido",
        variant: "destructive",
      });
      return;
    }

    for (const item of validItems) {

      const productDetails = products.find(p => p._id === item.produto);


      if (productDetails && item.quantidade > productDetails.qtdEstoque) {
        toast({
          title: "Estoque insuficiente",
          description: `O produto "${productDetails.nome}" possui apenas ${productDetails.qtdEstoque} unidades em estoque.`,
          variant: "destructive",
        });
        return;
      }
    }

    createMutation.mutate(validItems);
  };

  const getOrderTotal = (order: Order) => {
    return order.produtos.reduce((sum, item) => {
      return sum + (item.produto?.preco || 0) * item.quantidade;
    }, 0);
  };

  return (
    <Layout>
      <div className="space-y-8 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Pedidos
            </h1>
            <p className="text-lg text-muted-foreground">
              Gerencie todos os pedidos do sistema
            </p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button variant="gradient" className="shadow-elegant hover:shadow-glow transition-all duration-300">
                <Plus className="mr-2 h-4 w-4" />
                Novo Pedido
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Criar Novo Pedido</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-4">
                  {orderItems.map((item, index) => {
                    // Encontra o produto selecionado para obter o estoque
                    const selectedProduct = products.find(p => p._id === item.produto);
                    const maxQuantity = selectedProduct ? selectedProduct.qtdEstoque : undefined;

                    return (
                      <div key={index} className="flex gap-4 items-end">
                        <div className="flex-1">
                          <Label>Produto</Label>
                          <Select
                            value={item.produto}
                            onValueChange={(value) => updateOrderItem(index, 'produto', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um produto" />
                            </SelectTrigger>
                            <SelectContent>
                              {products.map((product) => (
                                <SelectItem key={product._id} value={product._id} disabled={product.qtdEstoque === 0}>
                                  {product.nome} - R$ {product.preco.toFixed(2)} (Estoque: {product.qtdEstoque})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="w-24">
                          <Label>Qtd</Label>
                          <Input
                            type="number"
                            min="1"
                            max={maxQuantity} // <-- ADICIONADO AQUI
                            value={item.quantidade}
                            onChange={(e) => {
                              let value = parseInt(e.target.value) || 1;
                              // Opcional: Forçar o valor a não ultrapassar o máximo
                              if (maxQuantity && value > maxQuantity) {
                                value = maxQuantity;
                              }
                              updateOrderItem(index, 'quantidade', value);
                            }}
                            disabled={!selectedProduct} // Desabilita se nenhum produto for selecionado
                          />
                        </div>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => removeOrderItem(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>

                <Button variant="outline" onClick={addOrderItem}>
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Produto
                </Button>

                <div className="flex gap-2 pt-4">
                  <Button
                    variant="gradient"
                    onClick={handleCreateOrder}
                    disabled={createMutation.isPending || orderItems.length === 0}
                  >
                    Criar Pedido
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsCreateOpen(false);
                      setOrderItems([]);
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Orders List */}
        {ordersLoading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="bg-gradient-subtle border-border/50 shadow-elegant animate-pulse">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="h-6 bg-muted/50 rounded" />
                    <div className="h-4 bg-muted/50 rounded w-2/3" />
                    <div className="h-4 bg-muted/50 rounded w-1/2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : orders.length > 0 ? (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order._id} className="bg-gradient-subtle border-border shadow-elegant hover:shadow-glow transition-all duration-300 group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-success/10">
                      <ShoppingCart className="h-6 w-6 text-success" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold">Pedido #{order._id.slice(-6)}</CardTitle>
                      <div className="flex items-center gap-6 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(order.dataPedido).toLocaleDateString('pt-BR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Package className="h-4 w-4" />
                          {order.produtos.length} item(s)
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-3xl font-bold text-primary">
                        R$ {getOrderTotal(order).toFixed(2)}
                      </p>
                      <p className="text-sm text-muted-foreground font-medium">Total do pedido</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => deleteMutation.mutate(order._id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {order.produtos.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-4 bg-background/50 rounded-lg border border-border/50 hover:border-primary/20 transition-colors">
                        <div className="space-y-1">
                          <p className="font-semibold text-lg text-foreground">{item.produto?.nome || 'Produto removido'}</p>
                          <p className="text-sm text-muted-foreground">
                            Quantidade: <span className="font-medium text-accent-foreground">{item.quantidade}</span>
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-xl text-primary">
                            R$ {((item.produto?.preco || 0) * item.quantidade).toFixed(2)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            R$ {(item.produto?.preco || 0).toFixed(2)} cada
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-gradient-subtle border-border shadow-elegant">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="p-4 rounded-full bg-success/10 mb-6">
                <ShoppingCart className="h-12 w-12 text-success" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Nenhum pedido encontrado</h3>
              <p className="text-muted-foreground text-center mb-6 max-w-md">
                Quando os pedidos forem criados, eles aparecerão aqui. Comece criando seu primeiro pedido!
              </p>
              <Button variant="gradient" className="shadow-elegant hover:shadow-glow transition-all duration-300" onClick={() => setIsCreateOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Criar primeiro pedido
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Orders;