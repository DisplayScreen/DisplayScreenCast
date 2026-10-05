import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SmartScreen Admin | Centralized Event Display Control Center',
  description: 'Operations console for live event screens and displays',
};

export default function AdminPage() {
  return <AdminDashboard />;
}
