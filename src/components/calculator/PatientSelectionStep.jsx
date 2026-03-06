import React, { useState, useEffect } from "react";
import { Patient } from "@/entities/Patient";
import { User } from "@/entities/User";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Search, User as UserIcon, Calendar } from "lucide-react";
import { useTranslation } from "@/components/i18n/TranslationContext";

export default function PatientSelectionStep({ selectedPatient, onPatientSelect }) {
  const { t } = useTranslation();
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      const user = await User.me(); // Fetch current user
      let data;
      if (user.role === 'admin') {
        data = await Patient.list('-created_date'); // Admins can see all patients
      } else {
        // Non-admins can only see patients they created
        data = await Patient.filter({ created_by: user.email }, '-created_date');
      }
      setPatients(data);
    } catch (error) {
      console.error('Erro ao carregar pacientes:', error);
      // Optionally handle authentication errors or display a more user-friendly message
    }
    setLoading(false);
  };

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.cpf.includes(searchTerm)
  );

  const calculateAge = (birthDate) => {
    if (!birthDate) return '';
    const today = new Date();
    const birth = new Date(birthDate);
    const age = today.getFullYear() - birth.getFullYear();
    return age;
  };

  const phototypeColors = {
    "I": "bg-red-100 text-red-800",
    "II": "bg-orange-100 text-orange-800",
    "III": "bg-yellow-100 text-yellow-800",
    "IV": "bg-green-100 text-green-800",
    "V": "bg-blue-100 text-blue-800",
    "VI": "bg-purple-100 text-purple-800"
  };

  return (
    <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-0">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b">
        <CardTitle className="flex items-center gap-3 text-xl">
          <Users className="w-6 h-6 text-blue-600" />
          {t("patientSelection.title", "Selecionar Paciente")}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="mb-4 p-3 rounded-md bg-blue-50 border border-blue-200 text-sm text-blue-900">
          O cadastro completo do paciente agiliza os cálculos de parâmetros, permitindo o autopreenchimento das informações clínicas.
        </div>
        <div className="mb-6 flex flex-col sm:flex-row gap-3">
          <Button type="button" variant="outline" onClick={() => onPatientSelect({ id: `temp_${Date.now()}`, name: 'Paciente não cadastrado', is_temp: true })}>
            Atender paciente novo (sem cadastro)
          </Button>
        </div>
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              placeholder={t("patientSelection.searchPlaceholder", "Pesquisar paciente por nome ou CPF...")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 text-lg"
            />
          </div>
        </div>

        {loading ? (
          <p className="text-center text-slate-500 py-8">{t("common.loadingPatients", "Carregando pacientes...")}</p>
        ) : filteredPatients.length > 0 ? (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredPatients.map((patient) => (
              <div
                key={patient.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                  selectedPatient?.id === patient.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                }`}
                onClick={() => onPatientSelect(patient)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <UserIcon className="w-5 h-5 text-blue-600" /> {/* Using UserIcon */}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{patient.name}</h3>
                      <div className="flex items-center gap-3 text-sm text-slate-600">
                        <span>{patient.cpf}</span>
                        {patient.birth_date && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{calculateAge(patient.birth_date)} {t("common.years", "anos")}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {patient.phototype && (
                      <Badge className={phototypeColors[patient.phototype]}>
                        {t("common.phototype", "Fototipo")} {patient.phototype}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">{t("patientSelection.noPatients", "Nenhum paciente encontrado")}</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? t("patientSelection.tryDifferentSearch", "Tente uma pesquisa diferente.") : t("patientSelection.registerFirst", "Cadastre um paciente primeiro.")}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}