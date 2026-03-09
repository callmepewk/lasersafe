import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { PlayCircle, SquareArrowOutUpRight } from "lucide-react";

export default function TutorialVideoHeader() {
  const videoId = "BXU-jgUKEoM";
  const embedUrl = `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
  const watchUrl = `https://youtu.be/${videoId}`;

  return (
    <div className="relative rounded-2xl p-[2px] bg-gradient-to-r from-fuchsia-500 via-indigo-500 to-blue-600 shadow-xl">
      <Card className="bg-white/95 backdrop-blur-md border-0 rounded-2xl overflow-hidden">
        <CardHeader className="p-5 sm:p-6 flex flex-row items-start sm:items-center gap-3 sm:gap-4">
          <div className="p-2 bg-indigo-50 rounded-lg shadow-inner">
            <PlayCircle className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg sm:text-xl font-bold text-slate-900 truncate">
              Tutorial em Vídeo — Dr. Jauru Nunes de Freitas
            </CardTitle>
            <p className="text-sm text-slate-600 truncate">Passo a passo prático sobre o uso da calculadora e boas práticas clínicas.</p>
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

        <CardContent className="p-0">
          <AspectRatio ratio={16 / 9}>
            <iframe
              src={embedUrl}
              title="Tutorial em Vídeo — Dr. Jauru Nunes de Freitas"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="w-full h-full rounded-b-2xl"
            />
          </AspectRatio>
        </CardContent>

        <div className="px-5 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-slate-50 to-white border-t">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <p className="text-xs sm:text-sm text-slate-600">
              Dica: ative 1080p para melhor visualização. Conteúdo educativo — siga protocolos e julgamento clínico.
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