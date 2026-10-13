import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminBookingsTab from '../components/admin/AdminBookingsTab';
import AdminMenuTab from '../components/admin/AdminMenuTab';
import AdminRoomsTab from '../components/admin/AdminRoomsTab';
import AdminContentTab from '../components/admin/AdminContentTab';
import AdminSettingsTab from '../components/admin/AdminSettingsTab';
import AdminInquiriesTab from '../components/admin/AdminInquiriesTab';
import AdminCalendarTab from '../components/admin/AdminCalendarTab';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'bookings' | 'calendar' | 'inquiries' | 'menu' | 'rooms' | 'content' | 'settings'>('bookings');

  const TABS = [
    { id: 'bookings', label: 'Bookings & Reservations' },
    { id: 'calendar', label: 'Calendar' },
    { id: 'inquiries', label: 'Inquiries' },
    { id: 'menu', label: 'Menu Items' },
    { id: 'rooms', label: 'Glamping Rooms' },
    { id: 'content', label: 'Website Content' },
    { id: 'settings', label: 'Settings' }
  ];

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-dark pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="font-display text-4xl text-cream mb-2">Admin Dashboard</h1>
            <div className="gold-divider" />
          </div>
          <button onClick={handleLogout} className="text-cream/50 hover:text-gold transition-colors font-body text-sm uppercase tracking-wider font-bold">
            Logout
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-12 border-b border-black/10 pb-4 overflow-x-auto no-scrollbar">
          {TABS.map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)} 
              className={`font-body text-sm uppercase tracking-wider transition-colors whitespace-nowrap font-bold ${activeTab === tab.id ? 'text-gold' : 'text-cream/50 hover:text-cream'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'bookings' && <AdminBookingsTab />}
        {activeTab === 'calendar' && <AdminCalendarTab />}
        {activeTab === 'inquiries' && <AdminInquiriesTab />}
        {activeTab === 'menu' && <AdminMenuTab />}
        {activeTab === 'rooms' && <AdminRoomsTab />}
        {activeTab === 'content' && <AdminContentTab />}
        {activeTab === 'settings' && <AdminSettingsTab />}
      </div>
    </div>
  );
}
