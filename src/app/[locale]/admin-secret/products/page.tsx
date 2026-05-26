import { getAllProducts } from '../actions';
import { ProductsClient } from './ProductsClient';

export default async function ProductsPage() {
  const { data: products, nextCursor } = await getAllProducts();
  return <ProductsClient products={products} nextCursor={nextCursor} />;
}
