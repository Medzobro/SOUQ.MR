import { getStores } from '../actions';
import { StoresClient } from './StoresClient';

export default async function StoresPage() {
  const { data: stores, nextCursor } = await getStores();
  return <StoresClient stores={stores} nextCursor={nextCursor} />;
}
