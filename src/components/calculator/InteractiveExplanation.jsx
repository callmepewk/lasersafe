import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { FileText, Loader2 } from "lucide-react";

export default function InteractiveExplanation({ assessment, params }) {
  const [loading, setLoading] = React.useState(false);
  const [text, setText] = React.useState("");

  const generate = async () => {
    setLoading(true);
    try {
      const prompt = `Explique sucintamente (tópicos curtos) por que estes parâmetros foram sugeridos para o caso abaixo. Evite jargões em excesso. Retorne em markdown com bullet points.\n\nCaso: ${JSON.stringify(assessment)}\nParâmetros: ${JSON.stringify(params)}`;
      const res = await base44.integrations.Core.InvokeLLM({ prompt });
      setText(typeof res === 'string' ? res : JSON.stringify(res));
    } finally { setLoading(false); }
  };

  return (
    <Card className="bg-white/95 backdrop-blur-sm shadow-lg border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-800 text-lg">
          <FileText className="w-5 h-5" /> Explicação Interativa
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button onClick={generate} disabled={loading} className="bg-slate-800 hover:bg-slate-900">
          {loading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin"/>Gerando...</>) : 'Gerar explicação'}
        </Button>
        {text && (
          <div className="prose max-w-none">
            <div dangerouslySetInnerHTML={{ __html: text.replace(/\n/g, '<br/>') }} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}