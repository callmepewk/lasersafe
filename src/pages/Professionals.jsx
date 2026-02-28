import React, { useState, useEffect } from "react";
import { Professional } from "@/entities/Professional";
import { User } from "@/entities/User";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { UserCheck, Search, Plus, Phone, Mail, Building, Trash2, Pencil } from "lucide-react";
import ProfessionalForm from "../components/professionals/ProfessionalForm";
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

export default function Professionals() {
  const { t } = useTranslation();
  const [professionals, setProfessionals] = useState([]);
  const [filteredProfessionals, setFilteredProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingProfessional, setEditingProfessional] = useState(null);
  const [professionalToDelete, setProfessionalToDelete] = useState(null);

  useEffect(() => {
    loadProfessionals();
  }, []);

  useEffect(() => {
    const filtered = professionals.filter(professional => 
      professional.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      professional.cpf.includes(searchTerm) ||
      professional.specialty?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      professional.phone.includes(searchTerm)
    );
    setFilteredProfessionals(filtered);
  }, [professionals, searchTerm]);

  const loadProfessionals = async () => {
    setLoading(true);
    try {
      const user = await User.me();
      let data;
      if (user.role === 'admin') {
        data = await Professional.list('-created_date');
      } else {
        data = await Professional.filter({ created_by: user.email }, '-created_date');
      }
      setProfessionals(data);
      setFilteredProfessionals(data);
    } catch (error) {
      console.error('Erro ao carregar profissionais:', error);
    }
    setLoading(false);
  };

  const handleSubmit = async (professionalData) => {
    try {
      if (editingProfessional) {
        await Professional.update(editingProfessional.id, professionalData);
      } else {
        await Professional.create(professionalData);
      }
      setShowForm(false);
      setEditingProfessional(null);
      loadProfessionals();
    } catch (error) {
      console.error('Erro ao salvar profissional:', error);
    }
  };

  const handleEdit = (professional) => {
    setEditingProfessional(professional);
    setShowForm(true);
  };

  const handleConfirmDelete = async () => {
    if (!professionalToDelete) return;
    try {
      await Professional.delete(professionalToDelete.id);
      setProfessionalToDelete(null);
      loadProfessionals();
    } catch (error) {
      console.error("Erro ao excluir profissional:", error);
    }
  };

  return (
    <PageBlockChecker pageName="Professionals">
    <div className="w-full max-w-7xl mx-auto">
       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 md:mb-8">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="p-2 md:p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
            <UserCheck className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">{t("professionals.title", "Profissionais")}</h1>
            <p className="text-slate-600 text-sm md:text-lg">{t("professionals.subtitle", "Gerencie o cadastro de médicos e especialistas")}</p>
          </div>
        </div>
        <Dialog open={showForm} onOpenChange={(isOpen) => { setShowForm(isOpen); if (!isOpen) setEditingProfessional(null); }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg h-14 w-full sm:w-auto">
              <Plus className="w-5 h-5 mr-2" />
              {t("professionals.newProfessional", "Novo Profissional")}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingProfessional ? t("professionals.editProfessional", "Editar Profissional") : t("professionals.newProfessional", "Novo Profissional")}</DialogTitle>
            </DialogHeader>
            <ProfessionalForm 
              professional={editingProfessional}
              onSubmit={handleSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingProfessional(null);
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
              placeholder={t("professionals.searchPlaceholder", "Pesquisar por nome, especialidade...")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 text-base sm:text-lg border-0 bg-slate-50 focus:bg-white transition-colors"
            />
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={!!professionalToDelete} onOpenChange={() => setProfessionalToDelete(null)}>
          <AlertDialogContent>
              <AlertDialogHeader>
              <AlertDialogTitle>{t("common.areYouSure", "Você tem certeza?")}</AlertDialogTitle>
              <AlertDialogDescription>
                  {t("professionals.deleteWarning", "Esta ação não pode ser desfeita. Isso excluirá permanentemente o profissional")} <span className="font-bold">{professionalToDelete?.name}</span>.
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
              <p className="text-slate-500">{t("professionals.loading", "Carregando profissionais...")}</p>
            </CardContent>
          </Card>
        ) : filteredProfessionals.length > 0 ? (
          filteredProfessionals.map((professional) => (
            <Card key={professional.id} className="bg-white/90 backdrop-blur-sm shadow-lg border-0 hover:shadow-xl transition-all duration-300 overflow-hidden">
              <CardContent className="p-4 sm:p-6">
                 <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                  {/* Professional Info */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <UserCheck className="w-6 h-6 text-white" />
                    </div>
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="text-xl font-semibold text-slate-900 truncate">{professional.name}</h3>
                        {professional.specialty && (
                          <Badge className="bg-green-100 text-green-800 flex-shrink-0">
                            {professional.specialty}
                          </Badge>
                        )}
                        {professional.experience_years && (
                          <Badge variant="outline" className="flex-shrink-0">
                            {professional.experience_years} {t("common.years", "anos")}
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-sm text-slate-600">
                        <div className="flex items-center gap-1">
                          <Phone className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{professional.phone}</span>
                        </div>
                        {professional.email && (
                          <div className="flex items-center gap-1">
                            <Mail className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{professional.email}</span>
                          </div>
                        )}
                        {professional.clinic_name && (
                          <div className="flex items-center gap-1">
                            <Building className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{professional.clinic_name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Desktop Buttons */}
                  <div className="hidden sm:flex items-center gap-2 self-start sm:self-center flex-shrink-0">
                      <Button variant="outline" size="icon" onClick={() => handleEdit(professional)}>
                          <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="destructive" size="icon" onClick={() => setProfessionalToDelete(professional)}>
                          <Trash2 className="w-4 h-4" />
                      </Button>
                  </div>
                </div>
                {/* Mobile Buttons */}
                <div className="sm:hidden flex items-center justify-end gap-2 mt-4 pt-4 border-t border-slate-200/60">
                   <Button variant="outline" size="icon" onClick={() => handleEdit(professional)}>
                      <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="destructive" size="icon" onClick={() => setProfessionalToDelete(professional)}>
                      <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <UserCheck className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">{t("professionals.noProfessionals", "Nenhum profissional encontrado")}</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? t("professionals.tryDifferentSearch", "Tente uma pesquisa diferente.") : t("professionals.addFirst", "Comece adicionando um novo profissional.")}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
    </PageBlockChecker>
  );
}