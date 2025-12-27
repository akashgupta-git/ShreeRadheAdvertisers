import { useState } from "react";
import { Outlet } from "react-router-dom";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { RecycleBinDialog } from "@/components/admin/RecycleBinDialog";
import { useRecycleBinItems, useRestoreFromBin, useRestoreAllFromBin } from "@/hooks/api/useRecycleBin";
import { toast } from "@/hooks/use-toast";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { apiClient } from "@/lib/api/client";
import { isBackendConfigured } from "@/lib/api/config";
import { useQueryClient } from "@tanstack/react-query";
import type { CentralBinItem } from "@/lib/api/types";

function AdminLayoutContent() {
  const [recycleBinOpen, setRecycleBinOpen] = useState(false);
  const queryClient = useQueryClient();
  
  // Use API hook for recycle bin items
  const { data: deletedItems = [], refetch } = useRecycleBinItems();
  const restoreFromBin = useRestoreFromBin();
  const restoreAllFromBin = useRestoreAllFromBin();

  const handleRestore = async (id: string, type: CentralBinItem['type']) => {
    if (!isBackendConfigured()) {
      toast({ variant: "destructive", title: "Backend not configured" });
      return;
    }
    
    try {
      await restoreFromBin.mutateAsync({ id, type });
      toast({ title: "Restored", description: "Item has been restored successfully." });
      refetch();
    } catch (error) {
      toast({ 
        variant: "destructive", 
        title: "Error", 
        description: error instanceof Error ? error.message : "Failed to restore item" 
      });
    }
  };

  const handlePermanentDelete = async (id: string, type: CentralBinItem['type']) => {
    if (!isBackendConfigured()) {
      toast({ variant: "destructive", title: "Backend not configured" });
      return;
    }
    
    try {
      // Backend uses DELETE with body via custom endpoint
      await apiClient.post('/api/recycle-bin/permanent-delete', { id, type });
      toast({ variant: "destructive", title: "Deleted Forever", description: "Item permanently removed." });
      refetch();
    } catch (error) {
      toast({ 
        variant: "destructive", 
        title: "Error", 
        description: error instanceof Error ? error.message : "Failed to delete item" 
      });
    }
  };

  const handleRestoreAll = async () => {
    if (!isBackendConfigured() || deletedItems.length === 0) return;
    
    try {
      const items = deletedItems.map(item => ({ id: item.id, type: item.type }));
      await restoreAllFromBin.mutateAsync(items);
      toast({ title: "All Restored", description: `${deletedItems.length} items have been restored.` });
      refetch();
    } catch (error) {
      toast({ 
        variant: "destructive", 
        title: "Error", 
        description: error instanceof Error ? error.message : "Failed to restore items" 
      });
    }
  };

  const handleDeleteAll = async () => {
    if (!isBackendConfigured() || deletedItems.length === 0) return;
    
    try {
      // Delete all items one by one
      for (const item of deletedItems) {
        await apiClient.post('/api/recycle-bin/permanent-delete', { id: item.id, type: item.type });
      }
      toast({ variant: "destructive", title: "All Deleted", description: `${deletedItems.length} items permanently removed.` });
      refetch();
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ['media'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    } catch (error) {
      toast({ 
        variant: "destructive", 
        title: "Error", 
        description: error instanceof Error ? error.message : "Failed to delete items" 
      });
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AdminSidebar />
        <SidebarInset className="flex flex-col flex-1 transition-all duration-300">
          <AdminHeader onOpenBin={() => setRecycleBinOpen(true)} binCount={deletedItems.length} />
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
  return <AdminLayoutContent />;
}
