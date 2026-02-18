import { AdminLayout } from "@/components/admin";

// Dashboard pages layout - uses the admin layout wrapper with sidebar
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayout>{children}</AdminLayout>;
}
