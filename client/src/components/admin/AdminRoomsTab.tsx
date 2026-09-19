import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { fetchRooms, createRoom, deleteRoom, uploadPhoto } from '../../lib/api';

export default function AdminRoomsTab() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newRoom, setNewRoom] = useState({ name: '', description: '', price: '', capacity: '', size: '', amenities: '', checkInTime: '2:00 PM', checkOutTime: '11:00 AM', policies: 'Breakfast Included, Welcome Drink on Arrival, Bonfire Access, Free Cancellation (48hrs prior)', totalUnits: '1' });
  const [roomImageFiles, setRoomImageFiles] = useState<FileList | null>(null);
  const [roomVideoFile, setRoomVideoFile] = useState<File | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const rm = await fetchRooms();
      setRooms(rm);
    } catch (error) {
      toast.error('Failed to load rooms.');
    } finally {
      setLoading(false);
    }
  };

  const [editingRoomId, setEditingRoomId] = useState<number | null>(null);

  const handleRoomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let imageUrls: string[] = [];
      if (roomImageFiles && roomImageFiles.length > 0) {
        for (let i = 0; i < roomImageFiles.length; i++) {
          const file = roomImageFiles[i];
          const uploadRes = await uploadPhoto(file);
          imageUrls.push(uploadRes.url);
        }
      }

      let videoUrl = null;
      if (roomVideoFile) {
        const uploadRes = await uploadPhoto(roomVideoFile);
        videoUrl = uploadRes.url;
      }
      
      const amenitiesArray = newRoom.amenities.split(',').map(a => a.trim()).filter(a => a);
      const policiesArray = newRoom.policies.split(',').map(a => a.trim()).filter(a => a);
      
      const payload = { 
        ...newRoom, 
        images: imageUrls.length > 0 ? imageUrls : undefined,
        image: imageUrls.length > 0 ? imageUrls[0] : undefined,
        videoUrl: videoUrl || undefined,
        price: Number(newRoom.price), 
        capacity: Number(newRoom.capacity),
        totalUnits: Number(newRoom.totalUnits),
        amenities: amenitiesArray,
        policies: policiesArray
      };

      if (editingRoomId) {
        // @ts-ignore
        const { updateRoom } = await import('../../lib/api');
        const res = await updateRoom(editingRoomId, payload);
        setRooms(rooms.map(r => r.id === editingRoomId ? res.item : r));
        toast.success('Room updated');
        setEditingRoomId(null);
      } else {
        const res = await createRoom(payload as any);
        setRooms([...rooms, res.item]);
        toast.success('Room created');
      }

      setNewRoom({ name: '', description: '', price: '', capacity: '', size: '', amenities: '', checkInTime: '2:00 PM', checkOutTime: '11:00 AM', policies: 'Breakfast Included, Welcome Drink on Arrival, Bonfire Access, Free Cancellation (48hrs prior)', totalUnits: '1' });
      setRoomImageFiles(null);
      setRoomVideoFile(null);
    } catch {
      toast.error(editingRoomId ? 'Failed to update room' : 'Failed to create room');
    }
  };

  const handleEditClick = (room: any) => {
    setEditingRoomId(room.id);
    setNewRoom({
      name: room.name || '',
      description: room.description || '',
      price: String(room.price || ''),
      capacity: String(room.capacity || ''),
      size: room.size || '',
      amenities: (room.amenities || []).join(', '),
      checkInTime: room.checkInTime || '2:00 PM',
      checkOutTime: room.checkOutTime || '11:00 AM',
      policies: (room.policies || []).join(', '),
      totalUnits: String(room.totalUnits || '1')
    });
    setRoomImageFiles(null);
    setRoomVideoFile(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRoomDelete = async (id: number) => {
    if (!window.confirm('Delete this room?')) return;
    try {
      await deleteRoom(id);
      setRooms(rooms.filter((r: any) => r.id !== id));
      toast.success('Room deleted');
    } catch {
      toast.error('Delete failed');
    }
  };

  if (loading) return <div className="text-cream/50 py-12 text-center">Loading rooms...</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-1">
        <div className="glass p-6 sticky top-32">
          <h3 className="font-display text-2xl text-gold mb-6">
            {editingRoomId ? 'Edit Room' : 'Add Room'}
          </h3>
          <form onSubmit={handleRoomSubmit} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-cream/50 mb-1">Name</label>
              <input required value={newRoom.name} onChange={e => setNewRoom({...newRoom, name: e.target.value})} className="luxury-input w-full" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-cream/50 mb-1">Description</label>
              <textarea required value={newRoom.description} onChange={e => setNewRoom({...newRoom, description: e.target.value})} className="luxury-input w-full min-h-[80px]" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-cream/50 mb-1">Price (₹)</label>
                <input required type="number" value={newRoom.price} onChange={e => setNewRoom({...newRoom, price: e.target.value})} className="luxury-input w-full" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-cream/50 mb-1">Max Guests (per unit)</label>
                <input required type="number" value={newRoom.capacity} onChange={e => setNewRoom({...newRoom, capacity: e.target.value})} className="luxury-input w-full" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-cream/50 mb-1">Total Units (Inventory)</label>
                <input required type="number" value={newRoom.totalUnits} onChange={e => setNewRoom({...newRoom, totalUnits: e.target.value})} className="luxury-input w-full" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-cream/50 mb-1">Size</label>
                <input required value={newRoom.size} onChange={e => setNewRoom({...newRoom, size: e.target.value})} placeholder="e.g. 400 sq ft" className="luxury-input w-full" />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-cream/50 mb-1">Amenities</label>
                <input value={newRoom.amenities} onChange={e => setNewRoom({...newRoom, amenities: e.target.value})} placeholder="Comma separated" className="luxury-input w-full" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-cream/50 mb-1">Check-in Time</label>
                <input required value={newRoom.checkInTime} onChange={e => setNewRoom({...newRoom, checkInTime: e.target.value})} placeholder="e.g. 2:00 PM" className="luxury-input w-full" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-cream/50 mb-1">Check-out Time</label>
                <input required value={newRoom.checkOutTime} onChange={e => setNewRoom({...newRoom, checkOutTime: e.target.value})} placeholder="e.g. 11:00 AM" className="luxury-input w-full" />
              </div>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-cream/50 mb-1">Policies / Features</label>
              <input value={newRoom.policies} onChange={e => setNewRoom({...newRoom, policies: e.target.value})} placeholder="Comma separated (e.g. Breakfast Included, Bonfire)" className="luxury-input w-full" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-cream/50 mb-1">Photo Upload (Up to 5)</label>
              <input type="file" multiple accept="image/*" onChange={e => setRoomImageFiles(e.target.files)} className="w-full text-sm text-cream/70 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gold/10 file:text-gold hover:file:bg-gold/20" />
              {roomImageFiles && roomImageFiles.length > 0 && (
                <p className="text-xs text-cream/50 mt-2">{roomImageFiles.length} files selected</p>
              )}
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-cream/50 mb-1">Video Upload (Optional)</label>
              <input type="file" accept="video/*" onChange={e => setRoomVideoFile(e.target.files ? e.target.files[0] : null)} className="w-full text-sm text-cream/70 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gold/10 file:text-gold hover:file:bg-gold/20" />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn-gold flex-1 py-3">
                {editingRoomId ? 'Update Room' : 'Add Room'}
              </button>
              {editingRoomId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingRoomId(null);
                    setNewRoom({ name: '', description: '', price: '', capacity: '', size: '', amenities: '', checkInTime: '2:00 PM', checkOutTime: '11:00 AM', policies: 'Breakfast Included, Welcome Drink on Arrival, Bonfire Access, Free Cancellation (48hrs prior)', totalUnits: '1' });
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
        <h2 className="font-display text-2xl text-gold mb-6">Current Rooms</h2>
        <div className="space-y-4">
          {rooms.map(room => (
            <div key={room.id} className="glass p-6 flex gap-6">
              <div className="w-40 h-32 bg-dark-100 rounded-lg overflow-hidden shrink-0 border border-black/5 flex items-center justify-center">
                {room.image ? (
                  <img src={room.image} alt={room.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl opacity-20">🏕️</span>
                )}
              </div>
              <div className="flex-1 min-w-0 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-display text-xl text-cream truncate">{room.name}</h4>
                  <p className="text-gold text-lg font-semibold whitespace-nowrap ml-4">₹{room.price}/night</p>
                </div>
                <div className="flex gap-4 text-xs text-cream/60 mb-2">
                  <span>Capacity: {room.capacity}</span>
                  <span>Size: {room.size}</span>
                </div>
                <p className="text-cream/40 text-sm line-clamp-2 mb-4 flex-1">{room.description}</p>
                <div className="flex justify-between items-end mt-auto">
                  <div className="flex flex-wrap gap-2">
                    {(room.amenities || []).slice(0, 3).map((a: string) => (
                      <span key={a} className="text-[10px] uppercase tracking-wider text-cream/40 bg-black/5 px-2 py-1 rounded">{a}</span>
                    ))}
                    {room.amenities && room.amenities.length > 3 && (
                      <span className="text-[10px] uppercase tracking-wider text-cream/40 bg-black/5 px-2 py-1 rounded">+{room.amenities.length - 3}</span>
                    )}
                  </div>
                  <div className="flex gap-4">
                    <button onClick={() => handleEditClick(room)} className="text-gold hover:text-gold/80 text-xs uppercase tracking-wider">Edit</button>
                    <button onClick={() => handleRoomDelete(room.id)} className="text-red-400 hover:text-red-300 text-xs uppercase tracking-wider">Delete</button>
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
