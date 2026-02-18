// Admin routes wrapper - individual pages will use AdminLayout as needed
export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
