export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  price: number;
  image_url: string | null;
  stock: number;
  is_active: boolean;
  category?: string;
  created_at: string;
}

export interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  shipping_address: string | null;
  delivery_method: "shipping" | "pickup";
  total_amount: number;
  status: "pending" | "approved" | "rejected";
  payment_id: string | null;
  payment_method: "mercadopago" | "whatsapp_transfer";
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  product?: Product;
}
