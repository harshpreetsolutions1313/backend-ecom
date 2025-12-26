export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'https://ecom-smoky-delta.vercel.app/api';

export async function fetchProducts() {
  const res = await fetch(`${API_BASE_URL}/products`);
  if (!res.ok) {
    throw new Error('Failed to load products');
  }
  return res.json();
}

export async function createOrder({ buyer, productId, amount, token, orderId, paid }) {

  const res = await fetch(`${API_BASE_URL}/orders/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ buyer, productId, amount, token, orderId, paid }),
  });

  let data = null;

  try {

    data = await res.json();

  } catch (err) {
    data = null;
  }

  if (!res.ok) {
    throw new Error((data && data.error) || 'Failed to create order');
  }
  return data; // { orderId }
}

export async function addProduct(product) {

  const res = await fetch(`${API_BASE_URL}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product),
  });

  if (!res.ok) {
    throw new Error('Failed to add product');
  }
  
  return res.json();
}


