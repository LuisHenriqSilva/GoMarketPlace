import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const storageProducts = await AsyncStorage.getItem('@GoMarketPlace');
      if (storageProducts) {
        setProducts(JSON.parse(storageProducts));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(async (product: Product) => {
    setProducts(products => {
      const findIndexProduct = products.findIndex(
        item => item.id === product.id,
      );
      if (findIndexProduct >= 0) {
        products[findIndexProduct].quantity += 1;
        return [...products];
      } else {
        product.quantity = 1;
        return [...products, product];
      }
    });

    await AsyncStorage.setItem('@GoMarketPlace', JSON.stringify(products));
  }, []);

  const increment = useCallback(async id => {
    setProducts(products => {
      return products.filter(product => {
        if (product.id === id) {
          product.quantity += 1;
          return product;
        }
        return product;
      });
    });

    await AsyncStorage.setItem('@GoMarketPlace', JSON.stringify(products));
  }, []);

  const decrement = useCallback(async id => {
    setProducts(products => {
      return products.filter(product => {
        if (product.id === id) {
          if (product.id === id && product.quantity > 1) {
            product.quantity -= 1;
            return product;
          }
        } else {
          return product;
        }
      });
    });

    await AsyncStorage.setItem('@GoMarketPlace', JSON.stringify(products));
  }, []);

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
