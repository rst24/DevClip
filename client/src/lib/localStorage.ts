// Local storage manager for anonymous users
export interface LocalClipboardItem {
  id: string;
  content: string;
  contentType: string;
  formatted: boolean;
  favorite: boolean;
  createdAt: string;
}

const STORAGE_KEY = "devclip_local_items";

export const localStorageManager = {
  getItems(): LocalClipboardItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Error reading from localStorage:", error);
      return [];
    }
  },

  addItem(item: Omit<LocalClipboardItem, "id" | "createdAt">): LocalClipboardItem {
    const items = this.getItems();
    const newItem: LocalClipboardItem = {
      ...item,
      id: `local_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      createdAt: new Date().toISOString(),
    };
    items.unshift(newItem);
    
    // Keep only last 50 items
    const limitedItems = items.slice(0, 50);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(limitedItems));
    return newItem;
  },

  toggleFavorite(id: string): void {
    const items = this.getItems();
    const item = items.find(i => i.id === id);
    if (item) {
      item.favorite = !item.favorite;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  },

  deleteItem(id: string): void {
    const items = this.getItems();
    const filtered = items.filter(i => i.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  },

  clear(): void {
    localStorage.removeItem(STORAGE_KEY);
  },

  hasItems(): boolean {
    return this.getItems().length > 0;
  }
};
