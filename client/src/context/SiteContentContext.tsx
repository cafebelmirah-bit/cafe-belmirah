import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchSiteContent, getCachedData, setCachedData } from '../lib/api';

type SiteContentMap = Record<string, string>;

const DEFAULT_CONTENT: SiteContentMap = {
  hero_headline: "Luxury\nBeyond\nImagination",
  hero_subheadline: "Luxury Glamping  ·  Continental Café  ·  Nature  ·  Unforgettable Experiences",
  cafe_intro_title: "A Culinary Journey",
  cafe_intro_text: "Our continental menu is thoughtfully curated to complement the breathtaking surroundings. We source the finest local ingredients to create dishes that are both comforting and sophisticated, offering a dining experience that elevates your stay.",
  rooms_intro_title: "Sanctuaries of Comfort",
  rooms_intro_text: "Each of our glamping units is designed to blur the lines between indoors and out, offering panoramic views without compromising on the luxurious amenities you expect from a world-class resort.",
  contact_address: "At Ambegaon, Pawna Lake, Lonavala, Maharashtra 410405",
  contact_phone: "+91 95118 96490",
  contact_email: "reservations@cafebelmirah.com",
};

interface SiteContentContextType {
  content: SiteContentMap;
  loading: boolean;
  refreshContent: () => Promise<void>;
}

const SiteContentContext = createContext<SiteContentContextType>({
  content: DEFAULT_CONTENT,
  loading: false,
  refreshContent: async () => {},
});

export const useSiteContent = () => useContext(SiteContentContext);

export const SiteContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [content, setContent] = useState<SiteContentMap>(() => getCachedData('site_content', DEFAULT_CONTENT));
  const [loading, setLoading] = useState(false);

  const loadContent = async () => {
    try {
      const res = await fetchSiteContent();
      if (res && res.success && res.data) {
        setContent(res.data);
        setCachedData('site_content', res.data);
        
        // Dynamically update favicon if admin has uploaded a logo
        if (res.data.site_logo) {
          let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
          if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.head.appendChild(link);
          }
          link.href = res.data.site_logo;
        }
      }
    } catch (error) {
      console.error('Failed to load site content', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContent();
  }, []);

  return (
    <SiteContentContext.Provider value={{ content, loading, refreshContent: loadContent }}>
      {children}
    </SiteContentContext.Provider>
  );
};
