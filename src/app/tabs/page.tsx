// Server Component
import { logTabsView } from './actions';
import ClientTabs from './ClientTabs';

export default async function TabsPage() {
  // server-side page-view log
  await logTabsView();
  return <ClientTabs />;
}
