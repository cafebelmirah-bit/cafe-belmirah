import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { fetchSettings, updateSettings } from '../../lib/api';

export default function AdminSettingsTab() {
  const [settings, setSettings] = useState<any>({ 
    maxGlampingBookingsPerDay: 5, 
    maxTableReservationsPerDay: 20,
    propertyAddressLine1: '123 Mountain View Road',
    propertyAddressLine2: 'Hill Station, India 400001',
    propertyEmail: 'contact@cafebelmirah.com',
    propertyPhone: '+91 98765 43210'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const s = await fetchSettings();
      if (s && s.data) setSettings(s.data);
    } catch (error) {
      toast.error('Failed to load settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await updateSettings(settings);
      if (res.success) {
        toast.success('Settings updated successfully');
        setSettings(res.data);
      }
    } catch {
      toast.error('Failed to update settings');
    }
  };

  if (loading) return <div className="text-cream/50 py-12 text-center">Loading settings...</div>;

  return (
    <div className="max-w-2xl">
      <h2 className="font-display text-2xl text-gold mb-6">Global Settings</h2>
      <div className="glass p-8">
        <form onSubmit={handleSettingsSubmit} className="space-y-6">
          <div>
            <h3 className="text-cream font-bold mb-4">Capacity Limits</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-cream/50 mb-1">Max Glamping Bookings Per Day</label>
                <input 
                  type="number" 
                  value={settings.maxGlampingBookingsPerDay} 
                  onChange={e => setSettings({...settings, maxGlampingBookingsPerDay: Number(e.target.value)})}
                  className="luxury-input w-full"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-cream/50 mb-1">Max Table Reservations Per Day</label>
                <input 
                  type="number" 
                  value={settings.maxTableReservationsPerDay} 
                  onChange={e => setSettings({...settings, maxTableReservationsPerDay: Number(e.target.value)})}
                  className="luxury-input w-full"
                />
              </div>
            </div>
          </div>
          <div className="pt-4 border-t border-cream/10">
            <h3 className="text-cream font-bold mb-4">Property Details (For Invoice)</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-cream/50 mb-1">Address Line 1</label>
                <input 
                  type="text" 
                  value={settings.propertyAddressLine1} 
                  onChange={e => setSettings({...settings, propertyAddressLine1: e.target.value})}
                  className="luxury-input w-full"
                  placeholder="e.g. 123 Mountain View Road"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-cream/50 mb-1">Address Line 2</label>
                <input 
                  type="text" 
                  value={settings.propertyAddressLine2} 
                  onChange={e => setSettings({...settings, propertyAddressLine2: e.target.value})}
                  className="luxury-input w-full"
                  placeholder="e.g. Hill Station, India 400001"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-cream/50 mb-1">Email</label>
                  <input 
                    type="email" 
                    value={settings.propertyEmail} 
                    onChange={e => setSettings({...settings, propertyEmail: e.target.value})}
                    className="luxury-input w-full"
                    placeholder="contact@example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-cream/50 mb-1">Phone</label>
                  <input 
                    type="text" 
                    value={settings.propertyPhone} 
                    onChange={e => setSettings({...settings, propertyPhone: e.target.value})}
                    className="luxury-input w-full"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>
            </div>
          </div>
          <button type="submit" className="btn-gold w-full justify-center">Save Settings</button>
        </form>
      </div>
    </div>
  );
}
