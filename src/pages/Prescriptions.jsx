import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FileText, Plus, Search, User, Eye, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useTranslation } from "@/components/i18n/TranslationContext";
import PrescriptionForm from "../components/prescriptions/PrescriptionForm";
import PrescriptionViewer from "../components/prescriptions/PrescriptionViewer";
import PageBlockChecker from "../components/system/PageBlockChecker";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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

export default function Prescriptions() {
  const { t } = useTranslation();
  const [prescriptions, setPrescriptions] = useState([]);
  const [patients, setPatients] = useState({});
  const [professionals, setProfessionals] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [prescriptionToDelete, setPrescriptionToDelete] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const user = await base44.auth.me();
      setCurrentUser(user);

      const [prescriptionsData, patientsData, professionalsData] = await Promise.all([
        base44.entities.Prescription.list('-prescription_date'),
        base44.entities.Patient.list(),
        base44.entities.Professional.list()
      ]);

      // Filtrar por usuário se não for admin
      const filteredPrescriptions = user.role === 'admin' 
        ? prescriptionsData 
        : prescriptionsData.filter(p => p.created_by === user.email);

      setPrescriptions(filteredPrescriptions);

      // Criar mapas de pacientes e profissionais
      const patientsMap = {};
      patientsData.forEach(p => { patientsMap[p.id] = p; });
      setPatients(patientsMap);

      const professionalsMap = {};
      professionalsData.forEach(p => { professionalsMap[p.id] = p; });
      setProfessionals(professionalsMap);
    } catch (error) {
      console.error('Erro ao carregar receitas:', error);
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!prescriptionToDelete) return;
    
    try {
      await base44.entities.Prescription.delete(prescriptionToDelete.id);
      await loadData();
      setShowDeleteAlert(false);
      setPrescriptionToDelete(null);
    } catch (error) {
      console.error('Erro ao excluir receita:', error);
      alert('Erro ao excluir receita.');
    }
  };

  const filteredPrescriptions = prescriptions.filter(p => {
    const patient = patients[p.patient_id];
    const professional = professionals[p.professional_id];
    const searchLower = searchTerm.toLowerCase();
    
    return (
      patient?.name?.toLowerCase().includes(searchLower) ||
      professional?.name?.toLowerCase().includes(searchLower) ||
      p.diagnosis?.toLowerCase().includes(searchLower)
    );
  });

  const getStatusBadge = (status) => {
    const colors = {
      'rascunho': 'bg-slate-100 text-slate-800',
      'finalizada': 'bg-green-100 text-green-800',
      'enviada': 'bg-blue-100 text-blue-800'
    };
    return colors[status] || 'bg-slate-100 text-slate-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <FileText className="w-12 h-12 text-blue-600 animate-pulse mx-auto mb-4" />
          <p className="text-slate-600">{t("prescriptions.loading", "Carregando receitas...")}</p>
        </div>
      </div>
    );
  }

  return (
    <PageBlockChecker pageName="Prescriptions">
    <div className="w-full max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6 md:mb-8">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="p-2 md:p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg">
            <FileText className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">{t("prescriptions.title", "Receitas Médicas")}</h1>
            <p className="text-slate-600 text-sm md:text-lg">{t("prescriptions.subtitle", "Prescrições e receituário digital")}</p>
          </div>
        </div>
        <Button 
          onClick={() => {
            setSelectedPrescription(null);
            setShowCreateModal(true);
          }} 
          className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t("prescriptions.newPrescription", "Nova Receita")}
        </Button>
      </div>

      {/* Busca */}
      <Card className="mb-6 bg-white/90 backdrop-blur-sm shadow-lg border-0">
        <CardContent className="p-4 sm:p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              placeholder={t("prescriptions.searchPlaceholder", "Buscar por paciente, profissional ou diagnóstico...")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 text-base"
            />
          </div>
        </CardContent>
      </Card>

      {/* Lista de Receitas */}
      {filteredPrescriptions.length === 0 ? (
        <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0">
          <CardContent className="py-12">
            <div className="text-center">
              <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-700 mb-2">
                {searchTerm ? t("prescriptions.noPrescriptionsFound", "Nenhuma receita encontrada") : t("prescriptions.noPrescriptionsYet", "Nenhuma receita criada ainda")}
              </h3>
              <p className="text-slate-500 mb-6">
                {searchTerm ? t("prescriptions.tryDifferentSearch", "Tente buscar com outros termos") : t("prescriptions.createFirst", "Crie sua primeira receita médica")}
              </p>
              {!searchTerm && (
                <Button onClick={() => setShowCreateModal(true)} className="bg-emerald-600 hover:bg-emerald-700">
                  <Plus className="w-4 h-4 mr-2" />
                  {t("prescriptions.create", "Criar Receita")}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredPrescriptions.map((prescription) => {
            const patient = patients[prescription.patient_id];
            const professional = professionals[prescription.professional_id];
            
            return (
              <Card key={prescription.id} className="bg-white/90 backdrop-blur-sm shadow-lg border-0 hover:shadow-xl transition-all">
                <CardContent className="p-4 md:p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <Badge className={getStatusBadge(prescription.status)}>
                          {prescription.status === 'rascunho' && `📝 ${t("prescriptions.draft", "Rascunho")}`}
                          {prescription.status === 'finalizada' && `✅ ${t("prescriptions.finalized", "Finalizada")}`}
                          {prescription.status === 'enviada' && `📧 ${t("prescriptions.sent", "Enviada")}`}
                        </Badge>
                        <span className="text-sm text-slate-500">
                          {format(new Date(prescription.prescription_date), "dd/MM/yyyy", { locale: ptBR })}
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-slate-700">
                          <User className="w-4 h-4 text-emerald-600" />
                          <span className="font-semibold">{t("prescriptions.patient", "Paciente")}:</span>
                          <span>{patient?.name || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-700">
                          <User className="w-4 h-4 text-blue-600" />
                          <span className="font-semibold">{t("prescriptions.professional", "Profissional")}:</span>
                          <span>{professional?.name || 'N/A'}</span>
                        </div>
                        {prescription.diagnosis && (
                          <div className="text-sm text-slate-600">
                            <span className="font-semibold">{t("prescriptions.diagnosis", "Diagnóstico")}:</span> {prescription.diagnosis}
                          </div>
                        )}
                        <div className="text-sm text-slate-500">
                          {prescription.items?.length || 0} {t("prescriptions.itemsPrescribed", "item(ns) prescrito(s)")}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedPrescription(prescription);
                          setShowViewModal(true);
                        }}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        {t("common.view", "Ver")}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedPrescription(prescription);
                          setShowCreateModal(true);
                        }}
                      >
                        <FileText className="w-4 h-4 mr-1" />
                        {t("common.edit", "Editar")}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setPrescriptionToDelete(prescription);
                          setShowDeleteAlert(true);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal Criar/Editar */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" />
              {selectedPrescription ? t("prescriptions.edit", "Editar Receita") : t("prescriptions.new", "Nova Receita")}
            </DialogTitle>
          </DialogHeader>
          <PrescriptionForm
            prescription={selectedPrescription}
            onSave={async () => {
              await loadData();
              setShowCreateModal(false);
              setSelectedPrescription(null);
            }}
            onCancel={() => {
              setShowCreateModal(false);
              setSelectedPrescription(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Modal Visualizar */}
      <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" />
              {t("prescriptions.view", "Visualizar Receita")}
            </DialogTitle>
          </DialogHeader>
          {selectedPrescription && (
            <PrescriptionViewer
              prescription={selectedPrescription}
              patient={patients[selectedPrescription.patient_id]}
              professional={professionals[selectedPrescription.professional_id]}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Alert Delete */}
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("prescriptions.deletePrescription", "Excluir Receita")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("prescriptions.deleteWarning", "Tem certeza que deseja excluir esta receita? Esta ação não pode ser desfeita.")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel", "Cancelar")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              {t("common.delete", "Excluir")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
    </PageBlockChecker>
  );
}