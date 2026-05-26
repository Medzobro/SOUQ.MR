import { getUsers, makeAdmin } from '../actions';
import { UsersClient } from './UsersClient';

export default async function UsersPage() {
  const { data: users, nextCursor } = await getUsers();
  return <UsersClient users={users} nextCursor={nextCursor} makeAdmin={makeAdmin} />;
}
