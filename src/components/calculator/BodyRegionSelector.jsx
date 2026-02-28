import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, ChevronLeft, ChevronRight, X } from "lucide-react";
import { base44 } from "@/api/base44Client";

const bodyRegions = [
  { id: "head", name: "Cabeça", emoji: "👤", description: "Couro cabeludo, face, orelhas" },
  { id: "neck", name: "Pescoço", emoji: "🦒", description: "Região cervical anterior e posterior" },
  { id: "chest", name: "Peito/Tórax", emoji: "💪", description: "Região torácica anterior" },
  { id: "shoulders", name: "Ombros", emoji: "🤷", description: "Região deltoide bilateral" },
  { id: "arms", name: "Braços", emoji: "💪", description: "Braços superiores e inferiores" },
  { id: "hands", name: "Mãos", emoji: "✋", description: "Mãos e dedos" },
  { id: "abdomen", name: "Abdômen", emoji: "⬜", description: "Região abdominal anterior" },
  { id: "waist", name: "Cintura/Lombar", emoji: "⭕", description: "Região lombar e flancos" },
  { id: "glutes", name: "Glúteos", emoji: "🍑", description: "Região glútea" },
  { id: "intimate", name: "Área Íntima", emoji: "🔒", description: "Região genital e virilha" },
  { id: "legs", name: "Pernas", emoji: "🦵", description: "Coxas e pernas" },
  { id: "feet", name: "Pés", emoji: "👣", description: "Pés e dedos" }
];

export default function BodyRegionSelector({ selectedRegion, onRegionChange, regionPhoto, onPhotoChange }) {
  const [uploading, setUploading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(
    selectedRegion ? bodyRegions.findIndex(r => r.id === selectedRegion) : 0
  );

  const currentRegion = bodyRegions[currentIndex];

  const handleRegionSelect = (region, index) => {
    setCurrentIndex(index);
    onRegionChange(region.id);
  };

  const handleNext = () => {
    if (currentIndex < bodyRegions.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      onRegionChange(bodyRegions[newIndex].id);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      onRegionChange(bodyRegions[newIndex].id);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      onPhotoChange(file_url);
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      alert("Erro ao fazer upload da foto. Tente novamente.");
    }
    setUploading(false);
  };

  const handleRemovePhoto = () => {
    onPhotoChange(null);
  };

  return (
    <Card className="bg-white/95 backdrop-blur-sm shadow-lg border-0">
      <CardContent className="p-4 sm:p-6">
        <h3 className="text-lg md:text-xl font-semibold text-slate-900 mb-4">Regiões do Corpo</h3>
        
        {/* Grade de Botões */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
          {bodyRegions.map((region, index) => (
            <button
              key={region.id}
              onClick={() => handleRegionSelect(region, index)}
              className={`p-4 rounded-lg border-2 transition-all duration-200 hover:border-blue-400 ${
                selectedRegion === region.id
                  ? 'bg-slate-800 text-white border-slate-800'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="text-3xl sm:text-4xl mb-2">{region.emoji}</div>
              <div className="text-xs sm:text-sm font-medium">{region.name}</div>
            </button>
          ))}
        </div>

        {/* Detalhes da Região Selecionada */}
        {selectedRegion && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
              <div className="text-4xl">{currentRegion.emoji}</div>
              <div className="flex-1">
                <h4 className="font-semibold text-slate-900">
                  {currentRegion.name} - {currentIndex + 1} / {bodyRegions.length}
                </h4>
                <p className="text-sm text-slate-600">{currentRegion.description}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handlePrevious}
                  disabled={currentIndex === 0}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleNext}
                  disabled={currentIndex === bodyRegions.length - 1}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Upload de Foto */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Foto da Região (opcional)
              </label>
              {!regionPhoto ? (
                <label className="flex flex-col items-center justify-center w-full h-32 sm:h-40 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 sm:w-10 sm:h-10 text-slate-400 mb-2" />
                    <p className="mb-2 text-sm text-slate-600">
                      <span className="font-semibold">Clique para fazer upload</span>
                    </p>
                    <p className="text-xs text-slate-500">PNG, JPG até 10MB</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={uploading}
                  />
                </label>
              ) : (
                <div className="relative">
                  <img
                    src={regionPhoto}
                    alt="Foto da região"
                    className="w-full h-32 sm:h-40 object-cover rounded-lg"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={handleRemovePhoto}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
              {uploading && (
                <p className="text-sm text-blue-600 mt-2">Fazendo upload...</p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}