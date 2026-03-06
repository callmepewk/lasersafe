import React, { useState, useEffect } from "react";
import { LaserCalculation } from "@/entities/LaserCalculation";
import { Patient } from "@/entities/Patient";
import { Professional } from "@/entities/Professional";
import { User } from "@/entities/User";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Brain, FileClock, Search, User as UserIcon, UserCheck, Calendar, Eye, Trash2, Printer, Download } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useTranslation } from "@/components/i18n/TranslationContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import PageBlockChecker from "../components/system/PageBlockChecker";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter, // Added DialogFooter
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const phototypeColors = {
  "I": "bg-red-100 text-red-800 border-red-200", "II": "bg-orange-100 text-orange-800 border-orange-200", 
  "III": "bg-yellow-100 text-yellow-800 border-yellow-200", "IV": "bg-green-100 text-green-800 border-green-200",
  "V": "bg-blue-100 text-blue-800 border-blue-200", "VI": "bg-purple-100 text-purple-800 border-purple-200"
};

const DetailItem = ({ label, value }) => {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="font-medium text-slate-800 capitalize">{value.toString().replace(/_/g, ' ')}</p>
    </div>
  );
};

const useHistoryTranslations = () => {
  const { t } = useTranslation();
  return {
    title: t("history.title", "Histórico de Cálculos"),
    subtitle: t("history.subtitle", "Consulte todos os procedimentos realizados"),
    searchPlaceholder: t("history.searchPlaceholder", "Pesquisar por nome..."),
    clearHistory: t("history.clearHistory", "Limpar Histórico"),
    areYouSure: t("common.areYouSure", "Você tem certeza?"),
    deleteWarning: t("history.deleteWarning", "Esta ação não pode ser desfeita. Todos os seus registros de cálculo de histórico serão excluídos permanentemente."),
    adminWarning: t("history.adminWarning", "Como administrador, você excluirá O HISTÓRICO DE TODOS OS USUÁRIOS."),
    cancel: t("common.cancel", "Cancelar"),
    yesDeleteAll: t("history.yesDeleteAll", "Sim, Limpar Tudo"),
    details: t("common.details", "Detalhes"),
    print: t("common.print", "Imprimir"),
    savePDF: t("common.savePDF", "Salvar em PDF"),
    noCalculationsFound: t("history.noCalculationsFound", "Nenhum cálculo encontrado"),
    tryDifferentSearch: t("history.tryDifferentSearch", "Tente uma pesquisa diferente."),
    goToCalculator: t("history.goToCalculator", "Vá para a calculadora para começar."),
    patient: t("common.patient", "Paciente"),
    professional: t("common.professional", "Profissional"),
    phototype: t("common.phototype", "Fototipo"),
    performedAt: t("history.performedAt", "Realizado em"),
    aiAdjustment: t("history.aiAdjustment", "Ajuste da IA"),
    parametersFinal: t("history.parametersFinal", "Parâmetros Finais (Ajustados)"),
    parametersSuggested: t("history.parametersSuggested", "Parâmetros Sugeridos"),
    fluence: t("common.fluence", "Fluência"),
    pulse: t("common.pulse", "Pulso"),
    spot: t("common.spot", "Spot"),
    frequency: t("common.frequency", "Frequência"),
    cooling: t("common.cooling", "Resfriamento"),
    level: t("common.level", "Nível"),
    clinicalSummary: t("history.clinicalSummary", "Resumo da Avaliação Clínica"),
    dermatologicalClassifications: t("history.dermatologicalClassifications", "Classificações Dermatológicas"),
    observations: t("common.observations", "Observações"),
    procedure: t("common.procedure", "Procedimento"),
    region: t("common.region", "Região Tratada"),
    laser: t("common.laser", "Laser/Tecnologia"),
    targetType: t("common.targetType", "Tipo de Alvo"),
    skinColor: t("common.skinColor", "Cor da Pele Observada"),
    skinSensitivity: t("common.skinSensitivity", "Sensibilidade da Pele"),
    sunExposure: t("common.sunExposure", "Exposição Solar"),
    tanningHabits: t("common.tanningHabits", "Hábitos de Bronzeamento"),
    aggressivenessLevel: t("common.aggressivenessLevel", "Nível de Agressividade"),
    glogauScale: t("common.glogauScale", "Escala de Glogau"),
    acneScars: t("common.acneScars", "Cicatrizes de Acne"),
    leedsAcneScale: t("common.leedsAcneScale", "Escala de Acne (Leeds)"),
    patientNotFound: t("history.patientNotFound", "Paciente não encontrado"),
    professionalNotFound: t("history.professionalNotFound", "Profissional não encontrado"),
    calculationDetails: t("history.calculationDetails", "Detalhes do Cálculo"),
  };
};

const CalculationDetail = ({ calculation, patient, professional }) => {
  if (!calculation) return null;

  const assessmentDetails = [
    { label: 'Procedimento', value: calculation.procedure_type },
    { label: 'Região Tratada', value: calculation.region },
    { label: 'Laser/Tecnologia', value: calculation.laser_type },
    { label: 'Tipo de Alvo', value: calculation.target_type },
    { label: 'Cor da Pele Observada', value: calculation.skin_color },
    { label: 'Sensibilidade da Pele', value: calculation.skin_sensitivity },
    { label: 'Exposição Solar', value: calculation.sun_exposure },
    { label: 'Hábitos de Bronzeamento', value: calculation.tanning_habits },
    { label: 'Nível de Agressividade', value: calculation.aggressiveness_level },
  ];

  const classificationDetails = [
      { label: 'Escala de Glogau', value: calculation.glogau_scale },
      { label: 'Cicatrizes de Acne', value: calculation.acne_scar_classification },
      { label: 'Escala de Acne (Leeds)', value: calculation.leeds_acne_scale },
  ];
  
  const hasClassifications = classificationDetails.some(detail => detail.value);

  return (
    <div className="space-y-6">
      {calculation.is_adjusted && (
          <Card className="bg-indigo-50 border-indigo-200 print:shadow-none print:border-none">
              <CardHeader className="print:hidden">
                  <CardTitle className="flex items-center gap-2 text-indigo-800 text-base"><Brain className="w-5 h-5"/> Ajuste da IA</CardTitle>
              </CardHeader>
              <CardContent>
                  <p className="text-sm text-indigo-700">{calculation.adjustment_reasoning}</p>
              </CardContent>
          </Card>
      )}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="p-4 bg-blue-50 rounded-lg">
          <p className="text-sm font-medium text-blue-900">Paciente</p>
          <p className="font-semibold text-blue-800">{patient?.name || "Desconhecido"}</p>
        </div>
        <div className="p-4 bg-green-50 rounded-lg">
          <p className="text-sm font-medium text-green-900">Profissional</p>
          <p className="font-semibold text-green-800">{professional?.name || "Desconhecido"}</p>
        </div>
      </div>
      
      <Card className="print:shadow-none">
        <CardHeader>
          <CardTitle className="text-lg">Parâmetros {calculation.is_adjusted ? 'Finais (Ajustados)' : 'Sugeridos'}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 text-center">
          {[
            { label: 'Fluência', value: calculation.fluence, unit: 'J/cm²' },
            { label: 'Pulso', value: calculation.pulse_duration, unit: 'ms' },
            { label: 'Spot', value: calculation.spot_size, unit: 'mm' },
            { label: 'Frequência', value: calculation.frequency, unit: 'Hz' },
            { label: 'Resfriamento', value: calculation.cooling_intensity, unit: 'Nível' }
          ].map(param => (
            <div key={param.label} className="p-2 bg-slate-100 rounded-md">
              <p className="text-xs text-slate-500">{param.label}</p>
              <p className="text-xl font-bold">{param.value}</p>
              <p className="text-xs text-slate-500">{param.unit}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="print:shadow-none">
        <CardHeader>
          <CardTitle className="text-lg">Resumo da Avaliação Clínica</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-6">
          {assessmentDetails.map(detail => <DetailItem key={detail.label} {...detail} />)}
        </CardContent>
      </Card>

      {hasClassifications && (
        <Card className="print:shadow-none">
          <CardHeader>
            <CardTitle className="text-lg">Classificações Dermatológicas</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-6">
            {classificationDetails.map(detail => <DetailItem key={detail.label} {...detail} />)}
          </CardContent>
        </Card>
      )}

      {calculation.treatment_notes && (
        <div>
          <h4 className="font-semibold text-slate-800 mb-2">Observações:</h4>
          <p className="text-slate-600 bg-slate-50 p-4 rounded-md">{calculation.treatment_notes}</p>
        </div>
      )}
    </div>
  );
};

export default function History() {
  const tr = useHistoryTranslations();
  const [calculations, setCalculations] = useState([]);
  const [patientsMap, setPatientsMap] = useState(new Map());
  const [professionalsMap, setProfessionalsMap] = useState(new Map());
  const [filteredCalculations, setFilteredCalculations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [adminViewCleared, setAdminViewCleared] = useState(() => (localStorage.getItem('adminHistoryViewCleared') === '1'));
  const [convertOpen, setConvertOpen] = useState(false);
  const [convertCalc, setConvertCalc] = useState(null);
  const [convertForm, setConvertForm] = useState({ name: '', cpf: '', phone: '', birth_date: '' });

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    const filtered = calculations.filter(calc => {
      const patientName = patientsMap.get(calc.patient_id)?.name || "";
      const professionalName = professionalsMap.get(calc.professional_id)?.name || "";
      const search = searchTerm.toLowerCase();
      return patientName.toLowerCase().includes(search) || professionalName.toLowerCase().includes(search);
    });
    setFilteredCalculations(filtered);
  }, [calculations, searchTerm, patientsMap, professionalsMap]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const user = await User.me(); // Fetch current user
      setCurrentUser(user);
      let calcsPromise, patientsPromise, profsPromise;

      // *** LÓGICA DE DADOS: Admin vê tudo, outros usuários veem apenas os seus ***
      if (user.role === 'admin') {
        calcsPromise = LaserCalculation.list('-created_date');
        // Admin precisa ver todos os pacientes e profissionais para associar nomes
        patientsPromise = Patient.list();
        profsPromise = Professional.list();
      } else {
        const filter = { created_by: user.email };
        calcsPromise = LaserCalculation.filter(filter, '-created_date');
        // Um usuário padrão também precisa carregar todos para ver nomes,
        // mas a lista de cálculos já está filtrada para ele.
        patientsPromise = Patient.list();
        profsPromise = Professional.list();
      }

      const [calcsData, patientsData, profsData] = await Promise.all([
        calcsPromise,
        patientsPromise,
        profsPromise
      ]);
      setCalculations(calcsData);
      setFilteredCalculations(calcsData);
      setPatientsMap(new Map(patientsData.map(p => [p.id, p])));
      setProfessionalsMap(new Map(profsData.map(p => [p.id, p])));
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    }
    setLoading(false);
  };

  const handleClearHistory = async () => {
    if (!currentUser) return;
    try {
      let calcsToDelete = [];
      if (currentUser.role === 'admin') {
        calcsToDelete = await LaserCalculation.list();
      } else {
        calcsToDelete = await LaserCalculation.filter({ created_by: currentUser.email });
      }
      
      // Delete in parallel
      await Promise.all(calcsToDelete.map(calc => LaserCalculation.delete(calc.id)));

      loadHistory(); // Reload the list
    } catch (error) {
      console.error("Erro ao limpar histórico:", error);
      alert("Falha ao limpar o histórico.");
    }
  };

  const handleConvertSubmit = async () => {
    if (!convertCalc) return;
    try {
      const newPatient = await Patient.create({
        name: convertForm.name,
        cpf: convertForm.cpf,
        phone: convertForm.phone,
        birth_date: convertForm.birth_date,
      });
      const tempId = convertCalc.patient_id;
      const toUpdate = calculations.filter(c => c.patient_id === tempId);
      await Promise.all(toUpdate.map(c => LaserCalculation.update(c.id, { patient_id: newPatient.id })));
      setConvertOpen(false);
      setConvertCalc(null);
      await loadHistory();
    } catch (e) {
      console.error('Falha ao cadastrar paciente:', e);
      alert('Falha ao cadastrar paciente.');
    }
  };

  return (
    // *** INTERFACE UNIVERSAL: O código JSX abaixo é idêntico para todos ***
    <PageBlockChecker pageName="History">
    <div className="w-full max-w-7xl mx-auto">
      <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8 print:hidden">
        <div className="p-2 md:p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg">
          <FileClock className="w-5 h-5 md:w-6 md:h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">{tr.title}</h1>
          <p className="text-slate-600 text-sm md:text-lg">{tr.subtitle}</p>
        </div>
      </div>

      <Card className="mb-6 bg-white/90 backdrop-blur-sm shadow-lg border-0 print:hidden">
        <CardContent className="p-4 sm:p-6 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              placeholder={tr.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 text-base sm:text-lg border-0 bg-slate-50 focus:bg-white transition-colors"
            />
          </div>
           <AlertDialog>
              <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full md:w-auto">
                      <Trash2 className="w-4 h-4 mr-2"/>
                      {tr.clearHistory}
                  </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                  <AlertDialogHeader>
                  <AlertDialogTitle>{tr.areYouSure}</AlertDialogTitle>
                  <AlertDialogDescription>
                      {tr.deleteWarning}
                      {currentUser?.role === 'admin' && <b className="text-red-600"> {tr.adminWarning}</b>}
                  </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                          <AlertDialogCancel>{tr.cancel}</AlertDialogCancel>
                          {currentUser?.role === 'admin' && (
                            <AlertDialogAction onClick={() => { setAdminViewCleared(true); localStorage.setItem('adminHistoryViewCleared','1'); }} className="bg-slate-600 hover:bg-slate-700">
                              Limpar Minha Visualização (admin)
                            </AlertDialogAction>
                          )}
                          <AlertDialogAction onClick={handleClearHistory} className="bg-red-600 hover:bg-red-700">{tr.yesDeleteAll}</AlertDialogAction>
                          </AlertDialogFooter>
              </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {loading ? (
          [1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 w-full" />)
        ) : ((currentUser?.role === 'admin' && adminViewCleared) ? [] : filteredCalculations).length > 0 ? (
          ((currentUser?.role === 'admin' && adminViewCleared) ? [] : filteredCalculations).map((calc) => (
            <Dialog key={calc.id}>
              <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0 hover:shadow-xl transition-all duration-300 print:hidden overflow-hidden">
                <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="flex-shrink-0 w-16 text-center">
                      <p className="text-sm text-slate-500">{format(new Date(calc.session_date || calc.created_date), 'MMM', { locale: ptBR })}</p>
                      <p className="text-2xl font-bold text-slate-800">{format(new Date(calc.session_date || calc.created_date), 'dd')}</p>
                      <p className="text-sm text-slate-500">{format(new Date(calc.session_date || calc.created_date), 'yyyy')}</p>
                    </div>
                    <div className="border-l pl-4 space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <UserIcon className="w-4 h-4 text-blue-600 flex-shrink-0"/>
                        <p className="font-semibold text-slate-900 truncate">{patientsMap.get(calc.patient_id)?.name || (calc.patient_id?.startsWith('temp_') ? 'Paciente não cadastrado' : 'Paciente não encontrado')}</p>
                        <Badge className={phototypeColors[calc.phototype] + " border flex-shrink-0"}>
                          Fototipo {calc.phototype}
                        </Badge>
                        {calc.patient_id?.startsWith('temp_') ? (
                          <Badge variant="outline" className="flex-shrink-0">Paciente não cadastrado</Badge>
                        ) : (
                          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 flex-shrink-0">Paciente cadastrado</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <UserCheck className="w-4 h-4 text-green-600 flex-shrink-0"/>
                        <p className="truncate">{professionalsMap.get(calc.professional_id)?.name || 'Profissional não encontrado'}</p>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0"/>
                        <p>Realizado em {format(new Date(calc.created_date), 'dd/MM/yy HH:mm')}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0 mt-2 sm:mt-0">
                    {(!patientsMap.get(calc.patient_id) && (calc.patient_id?.startsWith('temp_'))) && (
                      <Button variant="secondary" onClick={() => { setConvertCalc(calc); setConvertForm({ name: '', cpf: '', phone: '', birth_date: '' }); setConvertOpen(true); }}>
                        Cadastrar paciente
                      </Button>
                    )}
                    <DialogTrigger asChild>
                      <Button variant="outline"><Eye className="w-4 h-4 mr-2" /> {tr.details}</Button>
                    </DialogTrigger>
                  </div>
                </CardContent>
              </Card>
              <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] flex flex-col print:p-8 print:max-w-none print:w-full print:h-auto print:rounded-none">
                <DialogHeader className="print:hidden flex-shrink-0">
                  <DialogTitle>{tr.calculationDetails}</DialogTitle>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto pr-2">
                  <CalculationDetail 
                    calculation={calc}
                    patient={patientsMap.get(calc.patient_id)}
                    professional={professionalsMap.get(calc.professional_id)}
                  />
                </div>
                <DialogFooter className="print:hidden pt-4 flex-shrink-0 border-t mt-4">
                    <Button variant="outline" onClick={() => window.print()}>
                        <Printer className="w-4 h-4 mr-2"/> {tr.print}
                    </Button>
                    <Button variant="outline" onClick={() => window.print()}>
                        <Download className="w-4 h-4 mr-2"/> {tr.savePDF}
                    </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          ))
        ) : (
          <Card className="text-center py-12 print:hidden">
            <CardContent>
              <FileClock className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">{tr.noCalculationsFound}</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? tr.tryDifferentSearch : tr.goToCalculator}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>

    {/* Modal de conversão para paciente cadastrado */}
    <Dialog open={convertOpen} onOpenChange={setConvertOpen}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Cadastrar paciente</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Nome</Label>
            <Input id="name" value={convertForm.name} onChange={(e) => setConvertForm({ ...convertForm, name: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="cpf">CPF</Label>
            <Input id="cpf" value={convertForm.cpf} onChange={(e) => setConvertForm({ ...convertForm, cpf: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="phone">Telefone</Label>
            <Input id="phone" value={convertForm.phone} onChange={(e) => setConvertForm({ ...convertForm, phone: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="birth_date">Data de Nascimento</Label>
            <Input id="birth_date" type="date" value={convertForm.birth_date} onChange={(e) => setConvertForm({ ...convertForm, birth_date: e.target.value })} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setConvertOpen(false)}>Cancelar</Button>
          <Button onClick={handleConvertSubmit}>Salvar e vincular</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    </PageBlockChecker>
  );
}