// Centralized Recycle Bin Context
// Manages soft-deleted items across all modules with 30-day retention

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { CentralBinItem } from '@/lib/api/types';

const RECYCLE_BIN_STORAGE_KEY = 'sra_recycle_bin';
const RETENTION_DAYS = 30;

interface RecycleBinContextType {
  deletedItems: CentralBinItem[];
  addToRecycleBin: (item: Omit<CentralBinItem, 'deletedAt'>) => void;
  restoreItem: (id: string, type: CentralBinItem['type']) => CentralBinItem | null;
  permanentlyDelete: (id: string, type: CentralBinItem['type']) => void;
  getItemsByType: (type: CentralBinItem['type']) => CentralBinItem[];
  clearExpiredItems: () => void;
  binCount: number;
}

const RecycleBinContext = createContext<RecycleBinContextType | undefined>(undefined);

export function RecycleBinProvider({ children }: { children: React.ReactNode }) {
  const [deletedItems, setDeletedItems] = useState<CentralBinItem[]>(() => {
    // Load from localStorage on mount
    try {
      const stored = localStorage.getItem(RECYCLE_BIN_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Save to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem(RECYCLE_BIN_STORAGE_KEY, JSON.stringify(deletedItems));
  }, [deletedItems]);

  // Clear expired items (older than 30 days)
  const clearExpiredItems = useCallback(() => {
    const now = new Date().getTime();
    const retentionMs = RETENTION_DAYS * 24 * 60 * 60 * 1000;
    
    setDeletedItems(prev => 
      prev.filter(item => {
        const deletedTime = new Date(item.deletedAt).getTime();
        return (now - deletedTime) < retentionMs;
      })
    );
  }, []);

  // Auto-clear expired items on mount and every hour
  useEffect(() => {
    clearExpiredItems();
    const interval = setInterval(clearExpiredItems, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [clearExpiredItems]);

  // Add item to recycle bin (soft delete)
  const addToRecycleBin = useCallback((item: Omit<CentralBinItem, 'deletedAt'>) => {
    const binItem: CentralBinItem = {
      ...item,
      deletedAt: new Date().toISOString(),
    };
    setDeletedItems(prev => [...prev, binItem]);
  }, []);

  // Restore item from recycle bin
  const restoreItem = useCallback((id: string, type: CentralBinItem['type']): CentralBinItem | null => {
    const item = deletedItems.find(i => i.id === id && i.type === type);
    if (item) {
      setDeletedItems(prev => prev.filter(i => !(i.id === id && i.type === type)));
      return item;
    }
    return null;
  }, [deletedItems]);

  // Permanently delete item
  const permanentlyDelete = useCallback((id: string, type: CentralBinItem['type']) => {
    setDeletedItems(prev => prev.filter(i => !(i.id === id && i.type === type)));
  }, []);

  // Get items by type
  const getItemsByType = useCallback((type: CentralBinItem['type']) => {
    return deletedItems.filter(i => i.type === type);
  }, [deletedItems]);

  const value: RecycleBinContextType = {
    deletedItems,
    addToRecycleBin,
    restoreItem,
    permanentlyDelete,
    getItemsByType,
    clearExpiredItems,
    binCount: deletedItems.length,
  };

  return (
    <RecycleBinContext.Provider value={value}>
      {children}
    </RecycleBinContext.Provider>
  );
}

export function useRecycleBin() {
  const context = useContext(RecycleBinContext);
  if (context === undefined) {
    throw new Error('useRecycleBin must be used within a RecycleBinProvider');
  }
  return context;
}
