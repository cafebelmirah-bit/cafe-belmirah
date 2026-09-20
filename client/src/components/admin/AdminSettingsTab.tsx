import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { fetchSettings, updateSettings, uploadPhoto } from '../../lib/api';

export default function AdminSettingsTab() {
  const [settings, setSettings] = useState<any>({ 
    maxGlampingBookingsPerDay: 5, 
    maxTableReservationsPerDay: 20,
    propertyAddressLine1: '123 Mountain View Road',
    propertyAddressLine2: 'Hill Station, India 400001',
    propertyEmail: 'contact@cafebelmirah.com',
    propertyPhone: '+91 98765 43210',
    propertyLogo: ''
  });
  const [loading, setLoading] = useState(true);
  const [logoFile, setLogoFile] = useState<File | null>(null);

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
      let finalSettings = { ...settings };
      if (logoFile) {
        const uploadRes = await uploadPhoto(logoFile);
        finalSettings.propertyLogo = uploadRes.url;
      }
      
      const res = await updateSettings(finalSettings);
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
              <div className="pt-2">
                <label className="block text-xs uppercase tracking-wider text-cream/50 mb-1">Invoice Logo (PNG/JPG Only)</label>
                {settings.propertyLogo && !logoFile && (
                  <div className="mb-2">
                    <img src={settings.propertyLogo} alt="Logo" className="h-16 object-contain bg-white p-2 rounded" />
                  </div>
                )}
                <input 
                  type="file" 
                  accept="image/png, image/jpeg, image/jpg"
                  onChange={e => setLogoFile(e.target.files ? e.target.files[0] : null)}
                  className="w-full text-sm text-cream/70 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gold/10 file:text-gold hover:file:bg-gold/20"
                />
                <p className="text-[10px] text-cream/40 mt-1">This logo will replace the text header on the PDF invoices. Must be PNG or JPG.</p>
              </div>
            </div>
          </div>
          <button type="submit" className="btn-gold w-full justify-center">Save Settings</button>
        </form>
      </div>
    </div>
  );
}
