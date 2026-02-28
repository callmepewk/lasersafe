import React, { useState, useEffect } from "react";
import { Patient } from "@/entities/Patient";
import { User } from "@/entities/User";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Users, Search, Plus, User as UserIcon, Phone, Mail, Calendar, Trash2, Pencil } from "lucide-react";
import PatientForm from "../components/patients/PatientForm";
import { useTranslation } from "@/components/i18n/TranslationContext";
import PageBlockChecker from "../components/system/PageBlockChecker";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";


const phototypeColors = {
  "I": "bg-red-100 text-red-800",
  "II": "bg-orange-100 text-orange-800", 
  "III": "bg-yellow-100 text-yellow-800",
  "IV": "bg-green-100 text-green-800",
  "V": "bg-blue-100 text-blue-800",
  "VI": "bg-purple-100 text-purple-800"
};

export default function Patients() {
  const { t } = useTranslation();
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [patientToDelete, setPatientToDelete] = useState(null);

  useEffect(() => {
    loadPatients();
  }, []);

  useEffect(() => {
    const filtered = patients.filter(patient => 
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.cpf.includes(searchTerm) ||
      (patient.phone && patient.phone.includes(searchTerm))
    );
    setFilteredPatients(filtered);
  }, [patients, searchTerm]);

  const loadPatients = async () => {
    setLoading(true);
    try {
      const user = await User.me();
      let data;
      if (user.role === 'admin') {
        data = await Patient.list('-created_date');
      } else {
        data = await Patient.filter({ created_by: user.email }, '-created_date');
      }
      setPatients(data);
      setFilteredPatients(data);
    } catch (error) {
      console.error('Erro ao carregar pacientes:', error);
    }
    setLoading(false);
  };

  const handleSubmit = async (patientData) => {
    try {
      if (editingPatient) {
        await Patient.update(editingPatient.id, patientData);
      } else {
        await Patient.create(patientData);
      }
      setShowForm(false);
      setEditingPatient(null);
      loadPatients();
    } catch (error) {
      console.error('Erro ao salvar paciente:', error);
    }
  };

  const handleEdit = (patient) => {
    setEditingPatient(patient);
    setShowForm(true);
  };

  const handleConfirmDelete = async () => {
    if (!patientToDelete) return;
    try {
      await Patient.delete(patientToDelete.id);
      setPatientToDelete(null);
      loadPatients();
    } catch (error) {
      console.error("Erro ao excluir paciente:", error);
    }
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return '';
    const today = new Date();
    const birth = new Date(birthDate);
    const age = today.getFullYear() - birth.getFullYear();
    return age;
  };

  return (
    <PageBlockChecker pageName="Patients">
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 md:mb-8">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="p-2 md:p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
            <Users className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">{t("patients.title", "Pacientes")}</h1>
            <p className="text-slate-600 text-sm md:text-lg">{t("patients.subtitle", "Gerencie o cadastro de todos os pacientes")}</p>
          </div>
        </div>
        <Dialog open={showForm} onOpenChange={(isOpen) => { setShowForm(isOpen); if (!isOpen) setEditingPatient(null); }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg h-14 w-full sm:w-auto">
              <Plus className="w-5 h-5 mr-2" />
              {t("patients.newPatient", "Novo Paciente")}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingPatient ? t("patients.editPatient", "Editar Paciente") : t("patients.newPatient", "Novo Paciente")}</DialogTitle>
            </DialogHeader>
            <PatientForm 
              patient={editingPatient}
              onSubmit={handleSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingPatient(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
      
      <Card className="mb-6 bg-white/90 backdrop-blur-sm shadow-lg border-0">
        <CardContent className="p-4 sm:p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              placeholder={t("patients.searchPlaceholder", "Pesquisar por nome, CPF ou telefone...")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 text-base sm:text-lg border-0 bg-slate-50 focus:bg-white transition-colors"
            />
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={!!patientToDelete} onOpenChange={() => setPatientToDelete(null)}>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle>{t("common.areYouSure", "Você tem certeza?")}</AlertDialogTitle>
                  <AlertDialogDescription>
                      {t("patients.deleteWarning", "Esta ação não pode ser desfeita. Isso excluirá permanentemente o paciente")} <span className="font-bold">{patientToDelete?.name}</span>.
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                  <AlertDialogCancel>{t("common.cancel", "Cancelar")}</AlertDialogCancel>
                  <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">{t("common.delete", "Excluir")}</AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>

      <div className="grid gap-4">
        {loading ? (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-slate-500">{t("patients.loading", "Carregando pacientes...")}</p>
            </CardContent>
          </Card>
        ) : filteredPatients.length > 0 ? (
          filteredPatients.map((patient) => (
            <Card key={patient.id} className="bg-white/90 backdrop-blur-sm shadow-lg border-0 hover:shadow-xl transition-all duration-300 overflow-hidden">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                  {/* Patient Info */}
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <UserIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-xl font-semibold text-slate-900 truncate">{patient.name}</h3>
                        {patient.phototype && (
                          <Badge className={`${phototypeColors[patient.phototype]} flex-shrink-0`}>
                           {t("common.phototype", "Fototipo")} {patient.phototype}
                          </Badge>
                        )}
                        {patient.gender && (
                          <Badge variant="outline" className="capitalize flex-shrink-0">
                            {patient.gender}
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-sm text-slate-600">
                        {patient.phone ? (
                          <div className="flex items-center gap-1">
                            <Phone className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{patient.phone}</span>
                          </div>
                        ) : patient.has_no_phone && (
                          <div className="flex items-center gap-1 text-slate-400">
                            <Phone className="w-4 h-4 flex-shrink-0" />
                            <span className="italic">{t("patients.noPhone", "Sem telefone")}</span>
                          </div>
                        )}
                        {patient.email ? (
                          <div className="flex items-center gap-1">
                            <Mail className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{patient.email}</span>
                          </div>
                        ) : patient.has_no_email && (
                          <div className="flex items-center gap-1 text-slate-400">
                            <Mail className="w-4 h-4 flex-shrink-0" />
                            <span className="italic">{t("patients.noEmail", "Sem email")}</span>
                          </div>
                        )}
                        {patient.birth_date && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4 flex-shrink-0" />
                            <span>{calculateAge(patient.birth_date)} {t("common.years", "anos")}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Desktop Buttons */}
                  <div className="hidden sm:flex items-center gap-2 self-start sm:self-center flex-shrink-0">
                      <Button variant="outline" size="icon" onClick={() => handleEdit(patient)}>
                          <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="destructive" size="icon" onClick={() => setPatientToDelete(patient)}>
                          <Trash2 className="w-4 h-4" />
                      </Button>
                  </div>
                </div>
                 {/* Mobile Buttons */}
                <div className="sm:hidden flex items-center justify-end gap-2 mt-4 pt-4 border-t border-slate-200/60">
                   <Button variant="outline" size="icon" onClick={() => handleEdit(patient)}>
                      <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="destructive" size="icon" onClick={() => setPatientToDelete(patient)}>
                      <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">{t("patients.noPatients", "Nenhum paciente encontrado")}</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? t("patients.tryDifferentSearch", "Tente uma pesquisa diferente.") : t("patients.addFirst", "Comece adicionando um novo paciente.")}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
    </PageBlockChecker>
  );
}