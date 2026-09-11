import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Product } from "@/types/database";

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface SyncedProductInfo {
  id: string;
  title: string;
  price: number;
  stock: number;
  is_active: boolean;
}

export interface CartStore {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  syncProducts: (freshProducts: SyncedProductInfo[]) => void;
  hasOutOfStockItems: () => boolean;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product: Product) => {
        set((state) => {
          const existingIndex = state.items.findIndex(
            (item) => item.product.id === product.id,
          );

          if (existingIndex > -1) {
            const currentItem = state.items[existingIndex];
            if (currentItem.quantity < product.stock) {
              const updatedItems = [...state.items];
              updatedItems[existingIndex] = {
                ...currentItem,
                product,
                quantity: currentItem.quantity + 1,
              };
              return { items: updatedItems };
            }
            return state;
          }

          if (product.stock > 0 && product.is_active !== false) {
            return {
              items: [...state.items, { product, quantity: 1 }],
            };
          }

          return state;
        });
      },

      removeItem: (productId: string) => {
        set((state) => ({
          items: state.items.filter((item) => item.product.id !== productId),
        }));
      },

      updateQuantity: (productId: string, quantity: number) => {
        set((state) => ({
          items: state.items.map((item) => {
            if (item.product.id === productId) {
              if (quantity > 0 && quantity <= item.product.stock) {
                return { ...item, quantity };
              }
            }
            return item;
          }),
        }));
      },

      syncProducts: (freshProducts: SyncedProductInfo[]) => {
        set((state) => {
          const freshMap = new Map(freshProducts.map((p) => [p.id, p]));
          const updatedItems = state.items.map((item) => {
            const fresh = freshMap.get(item.product.id);
            if (!fresh) {
              // Si el producto fue eliminado del catálogo
              return {
                ...item,
                product: {
                  ...item.product,
                  stock: 0,
                  is_active: false,
                },
              };
            }

            // Actualizar en caliente precio, stock, título y estado activo
            const updatedProduct: Product = {
              ...item.product,
              title: fresh.title,
              price: fresh.price,
              stock: fresh.stock,
              is_active: fresh.is_active,
            };

            // Ajustar cantidad si el stock se redujo por debajo de lo seleccionado
            const adjustedQuantity =
              fresh.stock > 0
                ? Math.min(item.quantity, fresh.stock)
                : item.quantity;

            return {
              ...item,
              quantity: adjustedQuantity,
              product: updatedProduct,
            };
          });

          return { items: updatedItems };
        });
      },

      hasOutOfStockItems: () => {
        return get().items.some(
          (item) => item.product.stock <= 0 || item.product.is_active === false,
        );
      },

      clearCart: () => {
        set({ items: [] });
      },

      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + item.product.price * item.quantity,
          0,
        );
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
    }),
    {
      name: "cart-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    },
  ),
);

export default useCartStore;
