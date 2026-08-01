import { Redirect } from 'expo-router';
import { useAuth, homeGroupFor } from '../src/data/stores/auth';

export default function Index() {
  const user = useAuth((s) => s.user);
  if (!user) return <Redirect href="/login" />;
  return <Redirect href={homeGroupFor(user.role) as any} />;
}
