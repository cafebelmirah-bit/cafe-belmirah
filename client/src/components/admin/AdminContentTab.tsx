import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { fetchGallery, fetchExperiences, fetchHeroMedia, fetchStory, updateStory, createTestimonial, updateTestimonial, deleteTestimonial, createGalleryImage, deleteGalleryImage, createExperience, deleteExperience, createHeroMedia, deleteHeroMedia, uploadPhoto, fetchAdminTestimonials, fetchSiteContent, updateSiteContent } from '../../lib/api';

export default function AdminContentTab() {
  const [activeContentTab, setActiveContentTab] = useState<'story' | 'testimonials' | 'gallery' | 'experiences' | 'heromedia' | 'globaltext'>('story');

  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [gallery, setGallery] = useState<any[]>([]);
  const [experiences, setExperiences] = useState<any[]>([]);
  const [heroMediaItems, setHeroMediaItems] = useState<any[]>([]);
  const [storyData, setStoryData] = useState<any>({ title: '', subtitle: '', paragraph1: '', paragraph2: '', imageUrl: '' });
  const [globalText, setGlobalText] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [newTestimonial, setNewTestimonial] = useState({ name: '', role: '', content: '', rating: '5' });
  const [newGallery, setNewGallery] = useState({ title: '', category: '' });
  const [newExperience, setNewExperience] = useState({ title: '', description: '', icon: '🌟' });
  const [experienceFiles, setExperienceFiles] = useState<File[]>([]);
  const [newHeroMedia, setNewHeroMedia] = useState({ type: 'image', url: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [t, g, e, h, s, globalRes] = await Promise.all([
        fetchAdminTestimonials(), fetchGallery(), fetchExperiences(), fetchHeroMedia(), fetchStory(), fetchSiteContent()
      ]);
      setTestimonials(t);
      setGallery(g);
      setExperiences(e);
      setHeroMediaItems(h);
      if (s && s.data) setStoryData(s.data);
      if (globalRes && globalRes.data) setGlobalText(globalRes.data);
    } catch (error: any) {
      console.error(error);
      toast.error('Failed to load content data: ' + (error?.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleStorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let finalData = { ...storyData };
      if (imageFile) {
        const uploadRes = await uploadPhoto(imageFile);
        finalData.imageUrl = uploadRes.url;
      }
      const res = await updateStory(finalData);
      setStoryData(res.data);
      toast.success('Story content updated');
      setImageFile(null);
    } catch {
      toast.error('Failed to update story');
    }
  };

  const handleGlobalTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSiteContent(globalText);
      toast.success('Global text updated');
    } catch {
      toast.error('Failed to update global text');
    }
  };

  const handleTestimonialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await createTestimonial({ ...newTestimonial, rating: Number(newTestimonial.rating) });
      setTestimonials([...testimonials, res.item]);
      toast.success('Testimonial added');
      setNewTestimonial({ name: '', role: '', content: '', rating: '5' });
    } catch { toast.error('Failed to add testimonial'); }
  };

  const handleTestimonialApproval = async (id: number, currentStatus: boolean) => {
    try {
      await updateTestimonial(id, { isApproved: !currentStatus });
      setTestimonials(testimonials.map((t: any) => t.id === id ? { ...t, isApproved: !currentStatus } : t));
      toast.success(`Testimonial ${!currentStatus ? 'approved' : 'hidden'}`);
    } catch { toast.error('Status update failed'); }
  };

  const handleTestimonialDelete = async (id: number) => {
    if (!window.confirm('Delete this testimonial?')) return;
    try {
      await deleteTestimonial(id);
      setTestimonials(testimonials.filter((t: any) => t.id !== id));
      toast.success('Testimonial deleted');
    } catch { toast.error('Delete failed'); }
  };

  const handleGallerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) return toast.error('Please select an image');
    try {
      const uploadRes = await uploadPhoto(imageFile);
      const res = await createGalleryImage({ ...newGallery, url: uploadRes.url });
      setGallery([...gallery, res.item]);
      toast.success('Image added to gallery');
      setNewGallery({ title: '', category: '' });
      setImageFile(null);
    } catch (e: any) {
      toast.error('Failed to add image: ' + (e.response?.data?.message || e.message));
      console.error(e);
    }
  };

  const handleGalleryDelete = async (id: number) => {
    if (!window.confirm('Delete this image?')) return;
    try {
      await deleteGalleryImage(id);
      setGallery(gallery.filter((g: any) => g.id !== id));
      toast.success('Image deleted');
    } catch { toast.error('Delete failed'); }
  };

  const [editingExperienceId, setEditingExperienceId] = useState<number | null>(null);

  const handleExperienceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let imageUrls: string[] = [];
      if (experienceFiles && experienceFiles.length > 0) {
        for (const file of experienceFiles) {
          const uploadRes = await uploadPhoto(file);
          imageUrls.push(uploadRes.url);
        }
      }

      const payload = {
        ...newExperience,
        image: imageUrls.length > 0 ? imageUrls[0] : undefined,
        images: imageUrls.length > 0 ? imageUrls : undefined
      };

      if (editingExperienceId) {
        const { updateExperience } = await import('../../lib/api');
        const res = await updateExperience(editingExperienceId, payload);
        setExperiences(experiences.map(exp => exp.id === editingExperienceId ? res.item : exp));
        toast.success('Experience updated');
        setEditingExperienceId(null);
      } else {
        const res = await createExperience(payload as any);
        setExperiences([...experiences, res.item]);
        toast.success('Experience added');
      }
      
      setNewExperience({ title: '', description: '', icon: '🌟' });
      setExperienceFiles([]);
    } catch { toast.error(editingExperienceId ? 'Failed to update experience' : 'Failed to add experience'); }
  };

  const handleExperienceEditClick = (exp: any) => {
    setEditingExperienceId(exp.id);
    setNewExperience({
      title: exp.title || '',
      description: exp.description || '',
      icon: exp.icon || '🌟'
    });
    setExperienceFiles([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExperienceDelete = async (id: number) => {
    if (!window.confirm('Delete this experience?')) return;
    try {
      await deleteExperience(id);
      setExperiences(experiences.filter((e: any) => e.id !== id));
      toast.success('Experience deleted');
    } catch { toast.error('Delete failed'); }
  };

  const handleHeroMediaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let finalUrl = newHeroMedia.url;
      if (imageFile) {
        const uploadRes = await uploadPhoto(imageFile);
        finalUrl = uploadRes.url;
      }
      if (!finalUrl) return toast.error('Please provide a URL or upload a file');

      const res = await createHeroMedia({ type: newHeroMedia.type, url: finalUrl });
      setHeroMediaItems([...heroMediaItems, res.item]);
      toast.success('Hero media added');
      setNewHeroMedia({ type: 'image', url: '' });
      setImageFile(null);
    } catch { toast.error('Failed to add hero media'); }
  };

  const handleHeroMediaDelete = async (id: number) => {
    if (!window.confirm('Delete this hero media?')) return;
    try {
      await deleteHeroMedia(id);
      setHeroMediaItems(heroMediaItems.filter((h: any) => h.id !== id));
      toast.success('Hero media deleted');
    } catch { toast.error('Delete failed'); }
  };

  if (loading) return <div className="text-cream/50 py-12 text-center">Loading content...</div>;

  return (
    <div>
      <div className="flex gap-4 mb-8 flex-wrap">
        <button onClick={() => setActiveContentTab('story')} className={`px-4 py-2 rounded text-xs uppercase tracking-wider transition-colors ${activeContentTab === 'story' ? 'bg-gold text-dark font-bold' : 'bg-black/5 text-cream/50 hover:bg-black/10'}`}>Our Story</button>
        <button onClick={() => setActiveContentTab('testimonials')} className={`px-4 py-2 rounded text-xs uppercase tracking-wider transition-colors ${activeContentTab === 'testimonials' ? 'bg-gold text-dark font-bold' : 'bg-black/5 text-cream/50 hover:bg-black/10'}`}>Testimonials</button>
        <button onClick={() => setActiveContentTab('gallery')} className={`px-4 py-2 rounded text-xs uppercase tracking-wider transition-colors ${activeContentTab === 'gallery' ? 'bg-gold text-dark font-bold' : 'bg-black/5 text-cream/50 hover:bg-black/10'}`}>Gallery</button>
        <button onClick={() => setActiveContentTab('experiences')} className={`px-4 py-2 rounded text-xs uppercase tracking-wider transition-colors ${activeContentTab === 'experiences' ? 'bg-gold text-dark font-bold' : 'bg-black/5 text-cream/50 hover:bg-black/10'}`}>Experiences</button>
        <button onClick={() => setActiveContentTab('heromedia')} className={`px-4 py-2 rounded text-xs uppercase tracking-wider transition-colors ${activeContentTab === 'heromedia' ? 'bg-gold text-dark font-bold' : 'bg-black/5 text-cream/50 hover:bg-black/10'}`}>Hero Media</button>
        <button onClick={() => setActiveContentTab('globaltext')} className={`px-4 py-2 rounded text-xs uppercase tracking-wider transition-colors ${activeContentTab === 'globaltext' ? 'bg-gold text-dark font-bold' : 'bg-black/5 text-cream/50 hover:bg-black/10'}`}>Global Text</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-1">
          <div className="glass p-6 sticky top-32">
            <h3 className="font-display text-2xl text-gold mb-6">
              {activeContentTab === 'story' ? 'Edit Story Content' : activeContentTab === 'testimonials' ? 'Add Testimonial' : activeContentTab === 'gallery' ? 'Upload Image' : activeContentTab === 'experiences' ? 'Add Experience' : activeContentTab === 'heromedia' ? 'Add Hero Media' : 'Edit Global Text'}
            </h3>

            {activeContentTab === 'story' && (
              <form onSubmit={handleStorySubmit} className="space-y-4">
                <input required placeholder="Title" value={storyData.title || ''} onChange={e => setStoryData({ ...storyData, title: e.target.value })} className="luxury-input w-full" />
                <input required placeholder="Subtitle" value={storyData.subtitle || ''} onChange={e => setStoryData({ ...storyData, subtitle: e.target.value })} className="luxury-input w-full" />
                <textarea required placeholder="Paragraph 1" value={storyData.paragraph1 || ''} onChange={e => setStoryData({ ...storyData, paragraph1: e.target.value })} className="luxury-input w-full min-h-[120px]" />
                <textarea required placeholder="Paragraph 2" value={storyData.paragraph2 || ''} onChange={e => setStoryData({ ...storyData, paragraph2: e.target.value })} className="luxury-input w-full min-h-[120px]" />
                <div className="space-y-1">
                  <label className="text-xs text-cream/70 font-semibold uppercase tracking-wider">Image Focal Point</label>
                  <select value={storyData.imagePosition || 'center'} onChange={e => setStoryData({ ...storyData, imagePosition: e.target.value })} className="luxury-input w-full">
                    <option value="center">Center (Default)</option>
                    <option value="top">Top</option>
                    <option value="bottom">Bottom</option>
                    <option value="left">Left</option>
                    <option value="right">Right</option>
                  </select>
                  <p className="text-xs text-cream/50 mt-1">Adjust this if the subject of your image is cut off on the main page.</p>
                </div>

                <input placeholder="Image URL (optional if uploading)" value={storyData.imageUrl || ''} onChange={e => setStoryData({ ...storyData, imageUrl: e.target.value })} className="luxury-input w-full" />
                <div className="text-center text-xs text-cream/40 -my-2">- OR -</div>
                <input type="file" onChange={e => setImageFile(e.target.files ? e.target.files[0] : null)} className="w-full text-sm text-cream/70 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gold/10 file:text-gold hover:file:bg-gold/20" />
                <button type="submit" className="btn-gold w-full py-3">Save Story</button>
              </form>
            )}

            {activeContentTab === 'testimonials' && (
              <form onSubmit={handleTestimonialSubmit} className="space-y-4">
                <input required placeholder="Name" value={newTestimonial.name} onChange={e => setNewTestimonial({ ...newTestimonial, name: e.target.value })} className="luxury-input w-full" />
                <input placeholder="Role (e.g. Guest from Paris)" value={newTestimonial.role} onChange={e => setNewTestimonial({ ...newTestimonial, role: e.target.value })} className="luxury-input w-full" />
                <textarea required placeholder="Review content..." value={newTestimonial.content} onChange={e => setNewTestimonial({ ...newTestimonial, content: e.target.value })} className="luxury-input w-full min-h-[80px]" />
                <input type="number" min="1" max="5" placeholder="Rating (1-5)" value={newTestimonial.rating} onChange={e => setNewTestimonial({ ...newTestimonial, rating: e.target.value })} className="luxury-input w-full" />
                <button type="submit" className="btn-gold w-full py-3">Add Testimonial</button>
              </form>
            )}

            {activeContentTab === 'gallery' && (
              <form onSubmit={handleGallerySubmit} className="space-y-4">
                <input placeholder="Title (optional)" value={newGallery.title} onChange={e => setNewGallery({ ...newGallery, title: e.target.value })} className="luxury-input w-full" />
                <input required placeholder="Category (e.g. Glamping, Nature, Stay...)" value={newGallery.category} onChange={e => setNewGallery({ ...newGallery, category: e.target.value })} className="luxury-input w-full" />
                <input type="file" onChange={e => setImageFile(e.target.files ? e.target.files[0] : null)} className="w-full text-sm text-cream/70 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gold/10 file:text-gold hover:file:bg-gold/20" />
                <button type="submit" className="btn-gold w-full py-3">Upload Image</button>
              </form>
            )}

            {activeContentTab === 'experiences' && (
              <form onSubmit={handleExperienceSubmit} className="space-y-4">
                <h4 className="font-display text-xl text-gold mb-4">
                  {editingExperienceId ? 'Edit Experience' : 'Add Experience'}
                </h4>
                <input required placeholder="Title" value={newExperience.title} onChange={e => setNewExperience({ ...newExperience, title: e.target.value })} className="luxury-input w-full" />
                <textarea required placeholder="Description" value={newExperience.description} onChange={e => setNewExperience({ ...newExperience, description: e.target.value })} className="luxury-input w-full min-h-[80px]" />
                <input required placeholder="Icon (emoji)" value={newExperience.icon} onChange={e => setNewExperience({ ...newExperience, icon: e.target.value })} className="luxury-input w-full" />
                <div>
                  <label className="block text-xs uppercase tracking-wider text-cream/50 mb-1">Images (Multiple allowed)</label>
                  <input type="file" multiple accept="image/*" onChange={e => setExperienceFiles(Array.from(e.target.files || []))} className="w-full text-sm text-cream/70 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gold/10 file:text-gold hover:file:bg-gold/20" />
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="btn-gold flex-1 py-3">
                    {editingExperienceId ? 'Update Experience' : 'Add Experience'}
                  </button>
                  {editingExperienceId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingExperienceId(null);
                        setNewExperience({ title: '', description: '', icon: '🌟' });
                      }}
                      className="btn-outline-gold px-4 py-3"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            )}

            {activeContentTab === 'heromedia' && (
              <form onSubmit={handleHeroMediaSubmit} className="space-y-4">
                <select value={newHeroMedia.type} onChange={e => setNewHeroMedia({ ...newHeroMedia, type: e.target.value })} className="luxury-input w-full">
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                </select>
                <input placeholder="Direct URL (optional if uploading)" value={newHeroMedia.url} onChange={e => setNewHeroMedia({ ...newHeroMedia, url: e.target.value })} className="luxury-input w-full" />
                <div className="text-center text-xs text-cream/40 -my-2">- OR -</div>
                <input type="file" onChange={e => setImageFile(e.target.files ? e.target.files[0] : null)} className="w-full text-sm text-cream/70 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gold/10 file:text-gold hover:file:bg-gold/20" />
                <button type="submit" className="btn-gold w-full py-3">Add Hero Media</button>
              </form>
            )}

            {activeContentTab === 'globaltext' && (
              <form onSubmit={handleGlobalTextSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs text-cream/70 font-semibold uppercase tracking-wider">Site Logo (Image)</label>
                  <p className="text-[10px] text-cream/50">Upload a logo image. If set, replaces the text logo in the Navbar.</p>
                  {globalText.site_logo && (
                    <div className="mb-2 p-2 glass rounded flex items-center gap-3">
                      <img src={globalText.site_logo} alt="Current Logo" className="h-10 w-auto object-contain" />
                      <button type="button" onClick={() => setGlobalText({ ...globalText, site_logo: '' })} className="text-red-400 text-xs uppercase font-bold">Remove</button>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      try {
                        const uploadRes = await uploadPhoto(file);
                        const updatedText = { ...globalText, site_logo: uploadRes.url };
                        setGlobalText(updatedText);
                        // Auto-save immediately so it persists after refresh
                        await updateSiteContent(updatedText);
                        toast.success('Logo uploaded and saved!');
                      } catch { toast.error('Logo upload failed'); }
                    }}
                    className="w-full text-sm text-cream/70 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gold/10 file:text-gold hover:file:bg-gold/20"
                  />
                </div>

                {/* Logo Size Control */}
                {globalText.site_logo && (
                  <div className="space-y-1">
                    <label className="text-xs text-cream/70 font-semibold uppercase tracking-wider">Logo Height (px)</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min="20"
                        max="300"
                        value={globalText.site_logo_px ?? ''}
                        onChange={e => setGlobalText({ ...globalText, site_logo_px: e.target.value })}
                        className="luxury-input w-32"
                        placeholder="56"
                      />
                      <span className="text-cream/50 text-sm">px</span>
                      {globalText.site_logo_px && (
                        <img src={globalText.site_logo} alt="preview" style={{ height: `${globalText.site_logo_px}px` }} className="w-auto object-contain border border-gold/20 rounded p-1" />
                      )}
                    </div>
                    <p className="text-[10px] text-cream/50">Type any number. Live preview shown on the right. Click Save Global Text to apply.</p>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs text-cream/70 font-semibold uppercase tracking-wider">Hero Headline</label>
                  <textarea value={globalText.hero_headline || ''} onChange={e => setGlobalText({ ...globalText, hero_headline: e.target.value })} className="luxury-input w-full min-h-[80px]" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-cream/70 font-semibold uppercase tracking-wider">Hero Subheadline</label>
                  <input value={globalText.hero_subheadline || ''} onChange={e => setGlobalText({ ...globalText, hero_subheadline: e.target.value })} className="luxury-input w-full" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-cream/70 font-semibold uppercase tracking-wider">Cafe Intro Title</label>
                  <input value={globalText.cafe_intro_title || ''} onChange={e => setGlobalText({ ...globalText, cafe_intro_title: e.target.value })} className="luxury-input w-full" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-cream/70 font-semibold uppercase tracking-wider">Cafe Intro Text</label>
                  <textarea value={globalText.cafe_intro_text || ''} onChange={e => setGlobalText({ ...globalText, cafe_intro_text: e.target.value })} className="luxury-input w-full min-h-[80px]" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-cream/70 font-semibold uppercase tracking-wider">Rooms Intro Title</label>
                  <input value={globalText.rooms_intro_title || ''} onChange={e => setGlobalText({ ...globalText, rooms_intro_title: e.target.value })} className="luxury-input w-full" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-cream/70 font-semibold uppercase tracking-wider">Rooms Intro Text</label>
                  <textarea value={globalText.rooms_intro_text || ''} onChange={e => setGlobalText({ ...globalText, rooms_intro_text: e.target.value })} className="luxury-input w-full min-h-[80px]" />
                </div>

                <h4 className="font-display text-xl text-gold mt-8 mb-4">Footer Section</h4>

                <div className="space-y-1">
                  <label className="text-xs text-cream/70 font-semibold uppercase tracking-wider">Footer Brand Description</label>
                  <textarea value={globalText.footer_brand_text || ''} onChange={e => setGlobalText({ ...globalText, footer_brand_text: e.target.value })} className="luxury-input w-full min-h-[80px]" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-cream/50 mb-1">Links: Stay (comma-separated)</label>
                    <input value={globalText.footer_links_stay || ''} onChange={e => setGlobalText({ ...globalText, footer_links_stay: e.target.value })} className="luxury-input w-full" />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-cream/50 mb-1">Links: Dining (comma-separated)</label>
                    <input value={globalText.footer_links_dining || ''} onChange={e => setGlobalText({ ...globalText, footer_links_dining: e.target.value })} className="luxury-input w-full" />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-cream/50 mb-1">Links: Experiences (comma-separated)</label>
                    <input value={globalText.footer_links_experiences || ''} onChange={e => setGlobalText({ ...globalText, footer_links_experiences: e.target.value })} className="luxury-input w-full" />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-cream/50 mb-1">Links: Company (comma-separated)</label>
                    <input value={globalText.footer_links_company || ''} onChange={e => setGlobalText({ ...globalText, footer_links_company: e.target.value })} className="luxury-input w-full" />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-cream/50 mb-1">Newsletter Title</label>
                    <input value={globalText.footer_newsletter_title || ''} onChange={e => setGlobalText({ ...globalText, footer_newsletter_title: e.target.value })} className="luxury-input w-full" />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-cream/50 mb-1">Newsletter Subtext</label>
                    <input value={globalText.footer_newsletter_text || ''} onChange={e => setGlobalText({ ...globalText, footer_newsletter_text: e.target.value })} className="luxury-input w-full" />
                  </div>
                </div>

                <div className="space-y-1 mt-4">
                  <label className="text-xs text-cream/70 font-semibold uppercase tracking-wider">Copyright Text</label>
                  <input value={globalText.footer_copyright || ''} onChange={e => setGlobalText({ ...globalText, footer_copyright: e.target.value })} className="luxury-input w-full" />
                </div>

                <h4 className="font-display text-xl text-gold mt-8 mb-4">Contact Info</h4>
                <div className="space-y-1">
                  <label className="text-xs text-cream/70 font-semibold uppercase tracking-wider">Contact Address</label>
                  <input value={globalText.contact_address || ''} onChange={e => setGlobalText({ ...globalText, contact_address: e.target.value })} className="luxury-input w-full" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-cream/70 font-semibold uppercase tracking-wider">Contact Phone</label>
                  <input value={globalText.contact_phone || ''} onChange={e => setGlobalText({ ...globalText, contact_phone: e.target.value })} className="luxury-input w-full" />
                </div>

                <h4 className="font-display text-xl text-gold mt-8 mb-4">Opening Hours</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-cream/50 mb-1">Café & Restaurant (Time)</label>
                    <input value={globalText.hours_cafe_time || ''} onChange={e => setGlobalText({ ...globalText, hours_cafe_time: e.target.value })} placeholder="e.g. 7:00 AM – 10:30 PM" className="luxury-input w-full" />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-cream/50 mb-1">Café & Restaurant (Days)</label>
                    <input value={globalText.hours_cafe_days || ''} onChange={e => setGlobalText({ ...globalText, hours_cafe_days: e.target.value })} placeholder="e.g. All Days" className="luxury-input w-full" />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-cream/50 mb-1">Check-In (Time)</label>
                    <input value={globalText.hours_checkin_time || ''} onChange={e => setGlobalText({ ...globalText, hours_checkin_time: e.target.value })} placeholder="e.g. 12:00 PM – 9:00 PM" className="luxury-input w-full" />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-cream/50 mb-1">Check-In (Days)</label>
                    <input value={globalText.hours_checkin_days || ''} onChange={e => setGlobalText({ ...globalText, hours_checkin_days: e.target.value })} placeholder="e.g. All Days" className="luxury-input w-full" />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-cream/50 mb-1">Check-Out (Time)</label>
                    <input value={globalText.hours_checkout_time || ''} onChange={e => setGlobalText({ ...globalText, hours_checkout_time: e.target.value })} placeholder="e.g. By 11:00 AM" className="luxury-input w-full" />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-cream/50 mb-1">Check-Out (Days)</label>
                    <input value={globalText.hours_checkout_days || ''} onChange={e => setGlobalText({ ...globalText, hours_checkout_days: e.target.value })} placeholder="e.g. All Days" className="luxury-input w-full" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-cream/70 font-semibold uppercase tracking-wider">Contact Email</label>
                  <input value={globalText.contact_email || ''} onChange={e => setGlobalText({ ...globalText, contact_email: e.target.value })} className="luxury-input w-full" />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-cream/70 font-semibold uppercase tracking-wider">Map Embed URL</label>
                  <input value={globalText.contact_map_url || ''} onChange={e => setGlobalText({ ...globalText, contact_map_url: e.target.value })} placeholder="e.g. https://www.google.com/maps/embed?pb=..." className="luxury-input w-full" />
                  <p className="text-[10px] text-cream/50 mt-1">Paste the 'src' link from a Google Maps embed iframe.</p>
                </div>

                <button type="submit" className="btn-gold w-full py-3 mt-4">Save Global Text</button>
              </form>
            )}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2">
          <div className="space-y-4">
            {activeContentTab === 'story' && (
              <div className="glass p-8">
                <h4 className="font-display text-3xl text-cream mb-2">{storyData.title}</h4>
                <h5 className="font-display text-xl text-gold italic mb-6">{storyData.subtitle}</h5>
                <p className="text-cream/70 mb-4 whitespace-pre-wrap">{storyData.paragraph1}</p>
                <p className="text-cream/70 mb-6 whitespace-pre-wrap">{storyData.paragraph2}</p>
                {storyData.imageUrl && (
                  <div className="relative w-full mx-auto rounded-xl overflow-hidden shadow-lg mt-6 bg-black/10">
                    <img
                      src={storyData.imageUrl}
                      alt="Story preview"
                      className="w-full h-auto max-h-[400px] object-cover"
                      style={{ objectPosition: storyData.imagePosition || 'center' }}
                    />
                  </div>
                )}
              </div>
            )}

            {activeContentTab === 'testimonials' && testimonials.map(t => (
              <div key={t.id} className="glass p-4 flex justify-between items-center relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-1 h-full ${t.isApproved ? 'bg-green-500' : 'bg-yellow-500'}`} />
                <div className="pl-2">
                  <h4 className="text-gold font-bold">{t.name} <span className="text-xs text-cream/50 ml-2">{t.role}</span></h4>
                  <p className="text-cream/70 text-sm mt-1">{t.content}</p>
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded mt-2 inline-block ${t.isApproved ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                    {t.isApproved ? 'Approved' : 'Pending'}
                  </span>
                </div>
                <div className="flex gap-4 items-center">
                  <button onClick={() => handleTestimonialApproval(t.id, t.isApproved)} className="text-cream/70 hover:text-gold text-xs uppercase tracking-wider font-bold">
                    {t.isApproved ? 'Hide' : 'Approve'}
                  </button>
                  <button onClick={() => handleTestimonialDelete(t.id)} className="text-red-400 text-xs uppercase tracking-wider font-bold">Delete</button>
                </div>
              </div>
            ))}

            {activeContentTab === 'gallery' && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {gallery.map(g => (
                  <div key={g.id} className="relative group aspect-square rounded-lg overflow-hidden border border-black/10">
                    <img src={g.url} alt={g.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button onClick={() => handleGalleryDelete(g.id)} className="text-red-400 text-xs uppercase font-bold tracking-wider">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeContentTab === 'experiences' && experiences.map(exp => (
              <div key={exp.id} className="glass flex gap-4 items-center overflow-hidden">
                <div className="w-24 h-24 bg-dark-100 flex items-center justify-center text-3xl border-r border-black/5 overflow-hidden shrink-0">
                  {exp.image ? <img src={exp.image} alt={exp.title} className="w-full h-full object-cover" /> : exp.icon}
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <h5 className="font-display text-lg text-cream flex items-center gap-2 mb-2">
                    <span>{exp.icon}</span> {exp.title}
                  </h5>
                  <p className="text-cream/50 text-sm mb-4 flex-1">{exp.description}</p>
                  <div className="flex gap-4 mt-auto">
                    <button onClick={() => handleExperienceEditClick(exp)} className="text-gold hover:text-gold/80 text-xs uppercase tracking-wider">Edit</button>
                    <button onClick={() => handleExperienceDelete(exp.id)} className="text-red-400 hover:text-red-300 text-xs uppercase tracking-wider">Delete</button>
                  </div>
                </div>
              </div>
            ))}

            {activeContentTab === 'heromedia' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {heroMediaItems.map(h => (
                  <div key={h.id} className="glass p-4 rounded-lg overflow-hidden flex flex-col relative group border border-black/10">
                    <div className="aspect-video w-full bg-dark-100 rounded flex items-center justify-center overflow-hidden mb-3">
                      {h.type === 'video' ? (
                        <video src={h.url} className="w-full h-full object-cover" muted />
                      ) : (
                        <img src={h.url} alt="hero" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex justify-between items-center mt-auto">
                      <span className="text-[10px] uppercase tracking-wider text-gold bg-gold/10 px-2 py-1 rounded">{h.type}</span>
                      <button onClick={() => handleHeroMediaDelete(h.id)} className="text-red-400 text-xs uppercase font-bold tracking-wider">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
