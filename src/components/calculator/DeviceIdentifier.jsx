import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Upload, Camera, X, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { laserDatabase } from "./laserDatabase";

export default function DeviceIdentifier({ deviceInfo, onDeviceInfoChange }) {
  const [uploading, setUploading] = useState(false);
  const [identifying, setIdentifying] = useState(false);
  const [devicePhoto, setDevicePhoto] = useState(deviceInfo?.photo || null);
  const [identificationSuccess, setIdentificationSuccess] = useState(false);
  const [openCatalog, setOpenCatalog] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [hasSearched, setHasSearched] = useState(false);

  // Resetar flag quando o catálogo abre, para não exibir aviso sem interação
  React.useEffect(() => {
    if (openCatalog) setHasSearched(false);
  }, [openCatalog]);

  const brandOptions = React.useMemo(() => {
    const arr = Array.from(new Set(laserDatabase.map(l => l.manufacturer).filter(Boolean)));
    return ["all", ...arr.sort()];
  }, []);

  const typeOptions = React.useMemo(() => {
    const arr = Array.from(new Set(laserDatabase.map(l => l.type).filter(Boolean)));
    return ["all", ...arr.sort()];
  }, []);

  const filteredList = React.useMemo(() => {
    const s = (search || "").toLowerCase().trim();
    return laserDatabase.filter((l) => {
      const matchesSearch = !s ||
        (l.name?.toLowerCase() || "").includes(s) ||
        (l.manufacturer?.toLowerCase() || "").includes(s) ||
        (l.type?.toLowerCase() || "").includes(s);
      const matchesBrand = selectedBrand === "all" || (l.manufacturer || "") === selectedBrand;
      const matchesType = selectedType === "all" || (l.type || "") === selectedType;
      return matchesSearch && matchesBrand && matchesType;
    });
  }, [search, selectedBrand, selectedType]);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setIdentificationSuccess(false);
    
    try {
      // Upload da foto
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setDevicePhoto(file_url);
      // Identificação automática removida: apenas salva a foto e permite preenchimento manual ou catálogo
      setIdentifying(false);
      onDeviceInfoChange({ ...(deviceInfo || {}), photo: file_url });
      /* Removido OCR/IA */
      /* const identificationResult = await base44.integrations.Core.InvokeLLM({
        prompt: `Você é um perito em reconhecimento de equipamentos de laser dermatológico.
TAREFA:
1) Faça OCR COMPLETO da imagem (logos, etiquetas, painel/display) e extraia todos os textos relevantes.
2) Pesquise imagens de referência na internet (sites oficiais, catálogos, lojas, reviews) para cada modelo do banco de dados fornecido e compare visualmente (corpo, layout do painel, ponteiras, cores, design industrial).
3) Considere variações de grafia/acentos e nomes próximos. Quando aplicável, priorize identificação de lasers de Diodo 808/810nm.
4) Se houver múltiplas hipóteses, liste candidatos com escores e escolha a mais provável.
5) Retorne APENAS JSON no schema indicado.

${databaseContext}

Retorne apenas o JSON.`,
        add_context_from_internet: true,
        file_urls: [file_url],
        response_json_schema: {
          type: "object",
          properties: {
            brand: { type: "string" },
            model: { type: "string" },
            type: { type: "string" },
            wavelength: { type: "string" },
            description: { type: "string" },
            confidence: { type: "number" },
            ocr_texts: { type: "array", items: { type: "string" } },
            candidates: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  brand: { type: "string" },
                  model: { type: "string" },
                  type: { type: "string" },
                  wavelength: { type: "string" },
                  score: { type: "number" }
                }
              }
            }
          },
          required: ["brand", "model", "type", "wavelength", "description"]
        }
      }); */
      // Atualização apenas da foto; preenchimento manual/catálogo recomendado
      // onDeviceInfoChange já chamado acima
      setIdentificationSuccess(false);
      setIdentifying(false);
    } catch (error) {
      console.error("Erro ao processar foto:", error);
      alert("Erro ao processar a foto do aparelho. Você pode preencher as informações manualmente abaixo.");
      setIdentifying(false);
    }
    setUploading(false);
  };

  const handleRemovePhoto = () => {
    setDevicePhoto(null);
    setIdentificationSuccess(false);
    onDeviceInfoChange({});
  };

  const handleManualChange = (field, value) => {
    onDeviceInfoChange({
      ...deviceInfo,
      [field]: value
    });
  };

  return (
    <Card className="bg-white/95 backdrop-blur-sm shadow-lg border-0">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-4">
          <Camera className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg md:text-xl font-semibold text-slate-900">
            Foto do Aparelho (opcional)
          </h3>
        </div>
        
        <p className="text-sm text-slate-600 mb-4">
          Faça upload da foto do aparelho (opcional) e preencha os dados manualmente ou selecione no catálogo
        </p>

        {/* Upload de Foto */}
        {!devicePhoto ? (
          <label className="flex flex-col items-center justify-center w-full h-40 sm:h-48 border-2 border-dashed border-purple-300 rounded-lg cursor-pointer bg-purple-50 hover:bg-purple-100 transition-colors mb-4">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-10 h-10 sm:w-12 sm:h-12 text-purple-500 mb-3" />
              <p className="mb-2 text-sm text-purple-700">
                <span className="font-semibold">Clique para fazer upload</span>
              </p>
              <p className="text-xs text-purple-600">PNG, JPG até 10MB</p>
            </div>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={uploading || identifying}
            />
          </label>
        ) : (
          <div className="relative mb-4">
            <img
              src={devicePhoto}
              alt="Foto do aparelho"
              className="w-full h-40 sm:h-48 object-cover rounded-lg"
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={handleRemovePhoto}
              disabled={identifying}
            >
              <X className="w-4 h-4" />
            </Button>
            {identificationSuccess && (
              <div className="absolute bottom-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full flex items-center gap-1 text-xs font-medium">
                <CheckCircle className="w-3 h-3" />
                Identificado
              </div>
            )}
          </div>
        )}

        {uploading && (
          <div className="flex items-center justify-center gap-2 p-4 bg-blue-50 rounded-lg mb-4">
            <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
            <p className="text-sm text-blue-700">Fazendo upload da imagem...</p>
          </div>
        )}

        {identifying && (
          <div className="flex items-center justify-center gap-2 p-4 bg-purple-50 rounded-lg mb-4">
            <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />
            <p className="text-sm text-purple-700">Identificando aparelho com IA...</p>
          </div>
        )}

        {/* Seleção por Catálogo */}
        <div className="mb-4">
          <Dialog open={openCatalog} onOpenChange={setOpenCatalog}>
            <DialogTrigger asChild>
              <Button type="button" variant="outline" onClick={() => setHasSearched(false)}>Selecionar laser no catálogo</Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] sm:max-w-2xl md:max-w-3xl max-h-[75vh] overflow-hidden" onOpenAutoFocus={(e) => { e.preventDefault(); setHasSearched(false); }}>
              <DialogHeader>
                <DialogTitle>Selecionar Laser</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2" role="search">
                  <Input placeholder="Buscar por nome, fabricante, tipo..." value={search} onChange={(e) => { setSearch(e.target.value); setHasSearched(true); }} />
                  <Select value={selectedBrand} onValueChange={(value) => { setSelectedBrand(value); setHasSearched(true); }}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Marca" />
                    </SelectTrigger>
                    <SelectContent>
                      {brandOptions.map((b) => (
                        <SelectItem key={b} value={b}>{b === "all" ? "Todas as marcas" : b}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedType} onValueChange={(value) => { setSelectedType(value); setHasSearched(true); }}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Tecnologia" />
                    </SelectTrigger>
                    <SelectContent>
                      {typeOptions.map((t) => (
                        <SelectItem key={t} value={t}>{t === "all" ? "Todas as tecnologias" : t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="border rounded-md h-[55vh] overflow-y-auto p-2 bg-white/60">
                  {filteredList.length > 0 ? (
                    filteredList.map((l, idx) => (
                      <button key={idx} className="w-full text-left p-3 rounded hover:bg-slate-100 border-b last:border-b-0"
                        onClick={() => {
                          onDeviceInfoChange({ brand: l.manufacturer, model: l.name, type: l.type, wavelength: l.wavelength, description: `${l.type} - ${l.wavelength}` });
                          setOpenCatalog(false);
                        }}>
                        <p className="font-medium text-slate-900">{l.name}</p>
                        <p className="text-xs text-slate-600">{l.manufacturer} • {l.wavelength} • {l.type}</p>
                      </button>
                    ))
                  ) : (
                    (hasSearched && (search.trim().length > 0 || selectedBrand !== "all" || selectedType !== "all")) ? (
                      <div className="flex items-start gap-2 p-3 bg-amber-50 text-amber-800 rounded-md border border-amber-200">
                        <AlertCircle className="w-4 h-4 mt-0.5 text-amber-700" />
                        <p className="text-sm">
                          Nenhum equipamento localizado na base de dados atual. A busca é baseada em registros nacionais autorizados pela ANVISA e SBD, incluindo referências internacionais.
                        </p>
                      </div>
                    ) : null
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Campos de Informação do Aparelho */}
        {devicePhoto && !identifying && (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="brand">Marca/Fabricante</Label>
                <Input
                  id="brand"
                  value={deviceInfo?.brand || ""}
                  onChange={(e) => handleManualChange("brand", e.target.value)}
                  placeholder="Ex: Candela, Alma Lasers..."
                />
              </div>
              <div>
                <Label htmlFor="model">Modelo</Label>
                <Input
                  id="model"
                  value={deviceInfo?.model || ""}
                  onChange={(e) => handleManualChange("model", e.target.value)}
                  placeholder="Ex: GentleMax Pro"
                />
              </div>
              <div>
                <Label htmlFor="type">Tipo de Tecnologia</Label>
                <Input
                  id="type"
                  value={deviceInfo?.type || ""}
                  onChange={(e) => handleManualChange("type", e.target.value)}
                  placeholder="Ex: Laser Alexandrite"
                />
              </div>
              <div>
                <Label htmlFor="wavelength">Comprimento de Onda</Label>
                <Input
                  id="wavelength"
                  value={deviceInfo?.wavelength || ""}
                  onChange={(e) => handleManualChange("wavelength", e.target.value)}
                  placeholder="Ex: 755nm"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="description">Descrição Técnica</Label>
              <Input
                id="description"
                value={deviceInfo?.description || ""}
                onChange={(e) => handleManualChange("description", e.target.value)}
                placeholder="Breve descrição técnica do equipamento"
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}