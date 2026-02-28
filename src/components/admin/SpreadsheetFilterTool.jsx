import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Filter, Upload, Download } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function SpreadsheetFilterTool() {
  const [fileUrl, setFileUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [resultFile, setResultFile] = useState(null); // {name, mime, content}

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const res = await base44.integrations.Core.UploadFile({ file });
    if (res?.file_url) {
      setFileUrl(res.file_url);
      setFileName(file.name);
      setResultFile(null);
    }
  };

  const processFile = async () => {
    if (!fileUrl || !prompt) {
      alert("Envie um arquivo e escreva um prompt.");
      return;
    }
    setLoading(true);
    setResultFile(null);

    const schema = {
      type: 'object',
      properties: {
        file_name: { type: 'string' },
        mime_type: { type: 'string' },
        content: { type: 'string' },
        notes: { type: 'string' }
      }
    };

    const instructions = `Você é um assistente de transformação de dados. Leia o arquivo anexado (PDF ou CSV) e aplique exatamente as instruções abaixo, gerando um novo arquivo pronto para download. Se for PDF, produza uma versão textual (CSV ou TSV) com as alterações; se for CSV, retorne um CSV válido.

INSTRUÇÕES DO ADMIN:
${prompt}

Regras:
- Preserve cabeçalhos quando existirem.
- Use ; como separador padrão para CSV no retorno.
- Nunca devolva explicações fora do JSON; apenas o conteúdo no campo 'content'.
- Se necessário, normalize acentuação e espaços.
`;

    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: instructions,
        file_urls: [fileUrl],
        response_json_schema: schema
      });

      const outName = res.file_name || (fileName.replace(/\.[^.]+$/, '') + '_processado.csv');
      const mime = res.mime_type || 'text/csv';
      const content = res.content || '';
      setResultFile({ name: outName, mime, content });
    } catch (e) {
      console.error('Erro ao processar arquivo:', e);
      alert('Erro ao processar o arquivo. Tente novamente.');
    }
    setLoading(false);
  };

  const downloadResult = () => {
    if (!resultFile) return;
    const blob = new Blob([resultFile.content], { type: resultFile.mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = resultFile.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="bg-gradient-to-br from-teal-50 to-emerald-50 border-teal-200 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-t-lg">
        <div className="flex items-center gap-3">
          <Filter className="w-6 h-6" />
          <CardTitle className="text-xl">Filtragem e Transformação de Planilhas</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-5">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>Arquivo (PDF ou CSV)</Label>
            <div className="flex items-center gap-3 mt-1">
              <Upload className="w-4 h-4 text-slate-500" />
              <Input type="file" accept=".pdf,.csv" onChange={handleUpload} />
            </div>
            {fileName && (
              <p className="text-xs text-slate-500 mt-1">Selecionado: {fileName}</p>
            )}
          </div>
          <div>
            <Label>Prompt (o que deseja fazer no arquivo?)</Label>
            <Textarea
              placeholder="Ex.: Filtrar apenas registros do estado SP e manter colunas Nome, Email, Telefone. Renomear 'CEP' para 'CodigoPostal'."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="h-28"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={processFile} disabled={loading || !fileUrl || !prompt} className="bg-teal-600 hover:bg-teal-700">
            {loading ? 'Processando...' : 'Processar Arquivo'}
          </Button>
          {resultFile && (
            <Button variant="outline" onClick={downloadResult}>
              <Download className="w-4 h-4 mr-2" />
              Baixar Resultado
            </Button>
          )}
        </div>

        {resultFile && (
          <div className="text-sm text-slate-600">
            <p>Arquivo gerado: <strong>{resultFile.name}</strong></p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}