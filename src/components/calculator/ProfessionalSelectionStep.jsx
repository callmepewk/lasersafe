import React, { useState, useEffect } from "react";
import { Professional } from "@/entities/Professional";
import { User } from "@/entities/User";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { UserCheck, Search, ArrowLeft, User as UserIcon } from "lucide-react";
import { useTranslation } from "@/components/i18n/TranslationContext";

export default function ProfessionalSelectionStep({ selectedProfessional, onProfessionalSelect, onBack }) {
  const { t } = useTranslation();
  const [professionals, setProfessionals] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfessionals();
  }, []);

  const loadProfessionals = async () => {
    try {
      const user = await User.me();
      let data;
      if (user.role === 'admin') {
        data = await Professional.list('-created_date');
      } else {
        data = await Professional.filter({ created_by: user.email }, '-created_date');
      }
      setProfessionals(data);
    } catch (error) {
      console.error('Erro ao carregar profissionais:', error);
    }
    setLoading(false);
  };

  const filteredProfessionals = professionals.filter(professional =>
    professional.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    professional.specialty?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-0">
      <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 border-b">
        <CardTitle className="flex items-center justify-between text-xl">
          <div className="flex items-center gap-3">
            <UserCheck className="w-6 h-6 text-green-600" />
            {t("professionalSelection.title", "Selecionar Profissional")}
          </div>
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("common.back", "Voltar")}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="mb-4 p-3 rounded-md bg-amber-50 border border-amber-200 text-sm text-amber-900">
          A seleção do profissional é necessária para verificação da habilitação legal para utilização de lasers e tecnologias dermatológicas.
        </div>
        <div className="mb-4">
          <Dialog>
            <DialogTrigger asChild>
              <button className="text-blue-700 hover:underline text-sm">Veja quem pode realizar esses procedimentos.</button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Profissionais habilitados (Brasil)</DialogTitle>
              </DialogHeader>
              <div className="space-y-2 text-sm text-slate-700">
                <ul className="list-disc pl-5 space-y-1">
                  <li>Médicos (conforme especialidade/atribuições)</li>
                  <li>Dermatologistas</li>
                  <li>Biomédicos estetas (habilitados)</li>
                  <li>Fisioterapeutas dermatofuncionais</li>
                  <li>Enfermeiros estetas (habilitados)</li>
                  <li>Dentistas habilitados em estética</li>
                </ul>
                <p className="text-xs text-slate-500 mt-2">Consulte sempre as normativas dos respectivos conselhos profissionais e regulamentações locais vigentes.</p>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              placeholder={t("professionalSelection.searchPlaceholder", "Pesquisar profissional por nome ou especialidade...")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 text-lg"
            />
          </div>
        </div>

        {loading ? (
          <p className="text-center text-slate-500 py-8">{t("common.loadingProfessionals", "Carregando profissionais...")}</p>
        ) : filteredProfessionals.length > 0 ? (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredProfessionals.map((professional) => (
              <div
                key={professional.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                  selectedProfessional?.id === professional.id 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-slate-200 hover:border-green-300 hover:bg-slate-50'
                }`}
                onClick={() => onProfessionalSelect(professional)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <UserCheck className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{professional.name}</h3>
                      <div className="flex items-center gap-3 text-sm text-slate-600">
                        {professional.license_number && <span>{professional.license_number}</span>}
                        {professional.clinic_name && <span>{professional.clinic_name}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {professional.specialty && (
                      <Badge className="bg-green-100 text-green-800">
                        {professional.specialty}
                      </Badge>
                    )}
                    {professional.experience_years && (
                      <Badge variant="outline">
                        {professional.experience_years} {t("common.years", "anos")}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">{t("professionalSelection.noProfessionals", "Nenhum profissional encontrado")}</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? t("professionalSelection.tryDifferentSearch", "Tente uma pesquisa diferente.") : t("professionalSelection.registerFirst", "Cadastre um profissional primeiro.")}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}