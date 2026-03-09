import React, { useEffect, useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { PlayCircle, SquareArrowOutUpRight, AlertTriangle } from "lucide-react";

export default function TutorialVideoHeader() {
  const videoId = "BXU-jgUKEoM";
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const watchUrl = `https://youtu.be/${videoId}`;
  const thumbUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

  const embedUrl = useMemo(() => {
    const base = `https://www.youtube-nocookie.com/embed/${videoId}`;
    const params = new URLSearchParams({
      rel: "0",
      modestbranding: "1",
      playsinline: "1",
      iv_load_policy: "3",
    });
    if (origin) params.set("origin", origin);
    return `${base}?${params.toString()}`;
  }, [origin]);

  const [playerError, setPlayerError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!loaded) setPlayerError(true);
    }, 5000);
    return () => clearTimeout(timer);
  }, [loaded]);

  return (
    <div className="relative rounded-2xl p-[2px] bg-gradient-to-r from-fuchsia-500 via-indigo-500 to-blue-600 shadow-xl">
      <Card className="bg-white/95 backdrop-blur-md border-0 rounded-2xl overflow-hidden">
        {/* Header */}
        <CardHeader className="p-5 sm:p-6 flex flex-row items-start sm:items-center gap-3 sm:gap-4">
          <div className="p-2 bg-indigo-50 rounded-lg shadow-inner">
            <PlayCircle className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="inline-flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200">Em destaque</span>
            </div>
            <CardTitle className="text-lg sm:text-xl font-bold text-slate-900 truncate">
              Tutorial em Vídeo — Dr. Jauru Nunes de Freitas
            </CardTitle>
            <p className="text-sm text-slate-600 truncate">Guia detalhado de uso da calculadora e boas práticas clínicas.</p>
          </div>
          <a
            href={watchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-2 text-indigo-700 hover:text-indigo-900 text-sm font-medium"
          >
            Abrir no YouTube <SquareArrowOutUpRight className="w-4 h-4" />
          </a>
        </CardHeader>

        {/* Player or Fallback */}
        {!playerError ? (
          <CardContent className="p-0">
            <AspectRatio ratio={16 / 9}>
              <iframe
                src={embedUrl}
                title="Tutorial em Vídeo — Dr. Jauru Nunes de Freitas"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                onLoad={() => setLoaded(true)}
                onError={() => setPlayerError(true)}
                className="w-full h-full rounded-b-2xl"
              />
            </AspectRatio>
          </CardContent>
        ) : (
          <div className="relative">
            <div
              className="w-full overflow-hidden"
            >
              <AspectRatio ratio={16 / 9}>
                <div
                  className="w-full h-full bg-center bg-cover"
                  style={{ backgroundImage: `url(${thumbUrl})` }}
                />
              </AspectRatio>
            </div>
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-4">
              <div className="max-w-xl w-full text-center text-white">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-3">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-xs font-medium">Reprodução bloqueada no player incorporado</span>
                </div>
                <p className="text-sm sm:text-base mb-4 opacity-90">
                  Para assistir, abra diretamente no YouTube.
                </p>
                <a
                  href={watchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white font-semibold shadow-lg"
                >
                  Assistir no YouTube <SquareArrowOutUpRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Footer note */}
        <div className="px-5 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-slate-50 to-white border-t">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <p className="text-xs sm:text-sm text-slate-600">
              Dica: ative 1080p para melhor visualização. Conteúdo educativo — use sempre o julgamento clínico e protocolos.
            </p>
            <a
              href={watchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex sm:hidden items-center gap-1.5 text-indigo-700 hover:text-indigo-900 text-xs font-medium"
            >
              Abrir no YouTube <SquareArrowOutUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </Card>
    </div>
  );
}