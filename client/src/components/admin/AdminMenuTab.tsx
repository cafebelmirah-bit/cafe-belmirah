import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { fetchMenu, createMenuItem, deleteMenuItem, uploadPhoto } from '../../lib/api';

export default function AdminMenuTab() {
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newItem, setNewItem] = useState({ name: '', description: '', price: '', category: 'Starters', isVeg: false, isBestseller: false });
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const m = await fetchMenu();
      setMenuItems(m);
    } catch (error) {
      toast.error('Failed to load menu items.');
    } finally {
      setLoading(false);
    }
  };

  const [editingMenuId, setEditingMenuId] = useState<number | null>(null);

  const handleMenuSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let imageUrl = null;
      if (imageFile) {
        const uploadRes = await uploadPhoto(imageFile);
        imageUrl = uploadRes.url;
      }
      
      const payload = { 
        ...newItem, 
        image: imageUrl || undefined 
      };

      if (editingMenuId) {
        // @ts-ignore
        const { updateMenuItem } = await import('../../lib/api');
        const res = await updateMenuItem(editingMenuId, payload);
        setMenuItems(menuItems.map(m => m.id === editingMenuId ? res.item : m));
        toast.success('Menu item updated');
        setEditingMenuId(null);
      } else {
        const res = await createMenuItem(payload as any);
        setMenuItems([...menuItems, res.item]);
        toast.success('Menu item created');
      }
      
      setNewItem({ name: '', description: '', price: '', category: 'Starters', isVeg: false, isBestseller: false });
      setImageFile(null);
    } catch {
      toast.error(editingMenuId ? 'Failed to update item' : 'Failed to create item');
    }
  };

  const handleMenuEditClick = (item: any) => {
    setEditingMenuId(item.id);
    setNewItem({
      name: item.name || '',
      description: item.description || '',
      price: String(item.price || ''),
      category: item.category || 'Starters',
      isVeg: item.isVeg || false,
      isBestseller: item.isBestseller || false
    });
    setImageFile(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleMenuDelete = async (id: number) => {
    if (!window.confirm('Delete this menu item?')) return;
    try {
      await deleteMenuItem(id);
      setMenuItems(menuItems.filter((m: any) => m.id !== id));
      toast.success('Item deleted');
    } catch {
      toast.error('Delete failed');
    }
  };

  if (loading) return <div className="text-cream/50 py-12 text-center">Loading menu...</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-1">
        <div className="glass p-6 sticky top-32">
          <h3 className="font-display text-2xl text-gold mb-6">
            {editingMenuId ? 'Edit Menu Item' : 'Add Menu Item'}
          </h3>
          <form onSubmit={handleMenuSubmit} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-cream/50 mb-1">Name</label>
              <input required value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} className="luxury-input w-full" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-cream/50 mb-1">Description</label>
              <textarea value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} className="luxury-input w-full min-h-[80px]" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-cream/50 mb-1">Price (₹)</label>
                <input required type="number" value={newItem.price} onChange={e => setNewItem({...newItem, price: e.target.value})} className="luxury-input w-full" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-cream/50 mb-1">Category</label>
                <input 
                  required 
                  type="text" 
                  value={newItem.category} 
                  onChange={e => setNewItem({...newItem, category: e.target.value})} 
                  className="luxury-input w-full" 
                  placeholder="e.g. Starters, Desserts..." 
                />
              </div>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-cream/50 mb-1">Photo Upload</label>
              <input type="file" onChange={e => setImageFile(e.target.files ? e.target.files[0] : null)} className="w-full text-sm text-cream/70 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gold/10 file:text-gold hover:file:bg-gold/20" />
            </div>
            <div className="flex gap-4 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={newItem.isVeg} onChange={e => setNewItem({...newItem, isVeg: e.target.checked})} className="accent-green-500" />
                <span className="text-sm text-cream/80">Veg</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={newItem.isBestseller} onChange={e => setNewItem({...newItem, isBestseller: e.target.checked})} className="accent-gold" />
                <span className="text-sm text-cream/80">Bestseller</span>
              </label>
            </div>
            <div className="flex gap-2 mt-4">
              <button type="submit" className="btn-gold flex-1 justify-center py-3">
                {editingMenuId ? 'Update Item' : 'Add Item'}
              </button>
              {editingMenuId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingMenuId(null);
                    setNewItem({ name: '', description: '', price: '', category: 'Starters', isVeg: false, isBestseller: false });
                  }}
                  className="btn-outline-gold px-4 py-3"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2">
        <h2 className="font-display text-2xl text-gold mb-6">Current Menu</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {menuItems.map(item => (
            <div key={item.id} className="glass p-4 flex gap-4">
              <div className="w-24 h-24 bg-dark-100 rounded-lg overflow-hidden shrink-0 border border-black/5 flex items-center justify-center">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl opacity-20">🍽️</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-display text-lg text-cream truncate">{item.name}</h4>
                  <div className="flex items-center gap-1">
                    {item.isVeg && <span className="w-2 h-2 rounded-full bg-green-500" title="Veg" />}
                    {item.isBestseller && <span className="text-xs">⭐</span>}
                  </div>
                </div>
                <p className="text-gold text-sm font-semibold mb-2">₹{item.price}</p>
                <div className="flex justify-between items-center mt-auto">
                  <span className="text-xs uppercase tracking-wider text-cream/40 bg-black/5 px-2 py-1 rounded">{item.category}</span>
                  <div className="flex gap-4">
                    <button onClick={() => handleMenuEditClick(item)} className="text-gold hover:text-gold/80 text-xs uppercase tracking-wider">Edit</button>
                    <button onClick={() => handleMenuDelete(item.id)} className="text-red-400 hover:text-red-300 text-xs uppercase tracking-wider">Delete</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
