import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Product } from "@/types/database";

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CartStore {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
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

          if (product.stock > 0) {
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
