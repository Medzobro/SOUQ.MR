import { getPendingProducts, approveProduct, rejectProduct, deleteProduct } from '../actions';
import { PendingClient } from './PendingClient';

export default async function PendingPage() {
  const products = await getPendingProducts();
  return <PendingClient products={products} approveProduct={approveProduct} rejectProduct={rejectProduct} deleteProduct={deleteProduct} />;
}
