import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, ExternalLink } from "lucide-react";

export default function BannerPopup() {
  const [banner, setBanner] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    loadPopupBanner();
  }, []);

  useEffect(() => {
    if (banner && isOpen) {
      // Auto-close after 10 seconds
      const timer = setTimeout(() => {
        handleClose();
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [banner, isOpen]);

  const loadPopupBanner = async () => {
    try {
      const data = await base44.entities.Banner.filter({ 
        enabled: true,
        show_as_popup: true 
      }, '-priority', 1);
      
      if (data.length > 0) {
        const bannerData = data[0];
        
        // Verificar datas
        const now = new Date();
        if (bannerData.start_date && new Date(bannerData.start_date) > now) return;
        if (bannerData.end_date && new Date(bannerData.end_date) < now) return;
        
        // Verificar se já foi visto hoje
        const seenKey = `banner_popup_seen_${bannerData.id}`;
        const lastSeen = localStorage.getItem(seenKey);
        const today = new Date().toDateString();
        
        if (lastSeen !== today) {
          setBanner(bannerData);
          setIsOpen(true);
        }
      }
      setError(false);
    } catch (error) {
      console.error('Erro ao carregar banner popup:', error);
      setError(true);
    }
  };

  const handleClose = () => {
    if (banner) {
      const seenKey = `banner_popup_seen_${banner.id}`;
      localStorage.setItem(seenKey, new Date().toDateString());
    }
    setIsOpen(false);
  };

  const handleBannerClick = () => {
    if (banner?.link_url) {
      window.open(banner.link_url, '_blank', 'noopener,noreferrer');
      handleClose();
    }
  };

  // Não renderizar se houver erro ou não houver banner
  if (error || !banner) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-2xl p-0 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 z-10 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all"
        >
          <X className="w-5 h-5 text-slate-900" />
        </button>

        {/* Banner Content */}
        <div 
          className={`relative ${banner.link_url ? 'cursor-pointer' : ''}`}
          onClick={handleBannerClick}
        >
          <img 
            src={banner.image_url} 
            alt={banner.title}
            className="w-full h-auto max-h-[80vh] object-contain"
          />
          
          {/* Overlay with info */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-6">
            <div className="text-white">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">{banner.title}</h2>
              {banner.description && (
                <p className="text-base md:text-lg opacity-90 mb-4">{banner.description}</p>
              )}
              {banner.link_url && (
                <Button 
                  className="bg-white text-slate-900 hover:bg-slate-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBannerClick();
                  }}
                >
                  Saiba Mais
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Timer Indicator */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-3 py-1 rounded-full">
          Fecha automaticamente em 10s
        </div>
      </DialogContent>
    </Dialog>
  );
}