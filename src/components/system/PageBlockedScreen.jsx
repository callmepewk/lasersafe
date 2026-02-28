import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, ArrowLeft, Clock, Wrench } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function PageBlockedScreen({ pageName }) {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <Card className="max-w-lg w-full bg-white/95 backdrop-blur-sm shadow-2xl border-0">
        <CardContent className="p-8 text-center">
          {/* Ícone animado */}
          <div className="relative mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-amber-100 rounded-full flex items-center justify-center mx-auto">
              <Lock className="w-12 h-12 text-orange-500" />
            </div>
            <div className="absolute -top-1 -right-1 w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center animate-pulse">
              <Wrench className="w-4 h-4 text-white" />
            </div>
          </div>

          {/* Título */}
          <h1 className="text-2xl font-bold text-slate-900 mb-3">
            Página em Manutenção
          </h1>

          {/* Descrição */}
          <p className="text-slate-600 mb-6 leading-relaxed">
            Esta página está passando por <strong>atualizações</strong> para melhorar sua experiência. 
            Em breve o acesso será liberado.
          </p>

          {/* Info box */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center gap-2 text-amber-700">
              <Clock className="w-5 h-5" />
              <span className="font-medium">Aguarde algumas horas</span>
            </div>
            <p className="text-sm text-amber-600 mt-2">
              Estamos trabalhando para trazer novidades incríveis para você!
            </p>
          </div>

          {/* Botão de voltar */}
          <Link to={createPageUrl("Dashboard")}>
            <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Dashboard
            </Button>
          </Link>

          {/* Rodapé */}
          <p className="text-xs text-slate-400 mt-6">
            Agradecemos sua compreensão! 💙
          </p>
        </CardContent>
      </Card>
    </div>
  );
}