import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";

export default function BannerDisplay() {
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    setLoading(true);
    try {
      // Verificar se a entidade Banner existe
      const data = await base44.entities.Banner.filter({ 
        enabled: true,
        show_in_dashboard: true 
      }, '-priority', 10);
      
      // Filtrar por datas
      const now = new Date();
      const activeBanners = data.filter(banner => {
        if (banner.start_date && new Date(banner.start_date) > now) return false;
        if (banner.end_date && new Date(banner.end_date) < now) return false;
        return true;
      });
      
      setBanners(activeBanners);
      setError(false);
    } catch (error) {
      console.error('Erro ao carregar banners:', error);
      setError(true);
      setBanners([]);
    }
    setLoading(false);
  };

  const handleBannerClick = (banner) => {
    if (banner.link_url) {
      window.open(banner.link_url, '_blank', 'noopener,noreferrer');
    }
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
  };

  // Não renderizar nada se houver erro ou não houver banners
  if (loading || error || banners.length === 0) return null;

  const currentBanner = banners[currentIndex];

  return (
    <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0 hover:shadow-xl transition-all duration-300 overflow-hidden">
      <CardContent className="p-0">
        <div className="relative group">
          {/* Banner Image */}
          <div 
            className={`relative w-full h-48 md:h-64 overflow-hidden ${currentBanner.link_url ? 'cursor-pointer' : ''}`}
            onClick={() => handleBannerClick(currentBanner)}
          >
            <img 
              src={currentBanner.image_url} 
              alt={currentBanner.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            
            {/* Overlay com informações */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
              <div className="text-white">
                <h3 className="text-xl md:text-2xl font-bold mb-1">{currentBanner.title}</h3>
                {currentBanner.description && (
                  <p className="text-sm md:text-base opacity-90">{currentBanner.description}</p>
                )}
                {currentBanner.link_url && (
                  <Button 
                    className="mt-3 bg-white text-slate-900 hover:bg-slate-100"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBannerClick(currentBanner);
                    }}
                  >
                    Saiba Mais
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Navigation Arrows (if multiple banners) */}
          {banners.length > 1 && (
            <>
              <button
                onClick={handlePrevious}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronLeft className="w-5 h-5 text-slate-900" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronRight className="w-5 h-5 text-slate-900" />
              </button>

              {/* Dots Indicator */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {banners.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentIndex 
                        ? 'bg-white w-6' 
                        : 'bg-white/50 hover:bg-white/75'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}