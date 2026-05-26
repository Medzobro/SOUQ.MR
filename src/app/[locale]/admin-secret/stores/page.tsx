import { getStores } from '../actions';
import { StoresClient } from './StoresClient';

export default async function StoresPage() {
  const stores = await getStores();
  return <StoresClient stores={stores} />;
}
