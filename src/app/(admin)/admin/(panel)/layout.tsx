import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Sidebar } from "@/components/admin/Sidebar";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  const newOrders = await prisma.order.count({ where: { status: "new" } });
  return (
    <div className="min-h-screen">
      <Sidebar username={admin.username} newOrders={newOrders} />
      <main className="min-h-screen p-4 sm:p-6 lg:ml-64 lg:p-10">{children}</main>
    </div>
  );
}
