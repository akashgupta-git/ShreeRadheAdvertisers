import { useState } from "react";
import { Outlet } from "react-router-dom";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { RecycleBinDialog } from "@/components/admin/RecycleBinDialog";
import { RecycleBinProvider, useRecycleBin } from "@/contexts/RecycleBinContext";
import { toast } from "@/hooks/use-toast";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

function AdminLayoutContent() {
  const [recycleBinOpen, setRecycleBinOpen] = useState(false);
  const { deletedItems, restoreItem, permanentlyDelete, binCount } = useRecycleBin();

  const handleRestore = (id: string, type: Parameters<typeof restoreItem>[1]) => {
    const item = restoreItem(id, type);
    if (item) {
      toast({ title: "Restored", description: `${item.displayName} has been restored.` });
    }
  };

  const handlePermanentDelete = (id: string, type: Parameters<typeof permanentlyDelete>[1]) => {
    permanentlyDelete(id, type);
    toast({ variant: "destructive", title: "Deleted Forever", description: "Item permanently removed." });
  };

  const handleRestoreAll = () => {
    const count = deletedItems.length;
    deletedItems.forEach(item => {
      restoreItem(item.id, item.type);
    });
    toast({ title: "All Restored", description: `${count} items have been restored.` });
  };

  const handleDeleteAll = () => {
    const count = deletedItems.length;
    // Create a copy to avoid mutation during iteration
    [...deletedItems].forEach(item => {
      permanentlyDelete(item.id, item.type);
    });
    toast({ variant: "destructive", title: "All Deleted", description: `${count} items permanently removed.` });
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AdminSidebar />
        <SidebarInset className="flex flex-col flex-1 transition-all duration-300">
          <AdminHeader onOpenBin={() => setRecycleBinOpen(true)} binCount={binCount} />
          <main className="p-6">
            <Outlet />
          </main>
        </SidebarInset>

        <RecycleBinDialog 
          open={recycleBinOpen} 
          onOpenChange={setRecycleBinOpen}
          deletedItems={deletedItems}
          onRestore={handleRestore}
          onPermanentDelete={handlePermanentDelete}
          onRestoreAll={handleRestoreAll}
          onDeleteAll={handleDeleteAll}
        />
      </div>
    </SidebarProvider>
  );
}

export function AdminLayout() {
  return (
    <RecycleBinProvider>
      <AdminLayoutContent />
    </RecycleBinProvider>
  );
}