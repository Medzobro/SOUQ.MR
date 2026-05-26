import { getAllProducts } from '../actions';
import { ProductsClient } from './ProductsClient';

export default async function ProductsPage() {
  const products = await getAllProducts();
  return <ProductsClient products={products} />;
}
