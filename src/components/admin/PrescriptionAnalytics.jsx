import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileText, Users, MapPin, Pill, TrendingUp, BarChart3 } from "lucide-react";
import { Prescription } from "@/entities/Prescription";
import { Patient } from "@/entities/Patient";
import { Professional } from "@/entities/Professional";

// Mapeamento de DDDs para estados
const DDD_TO_STATE = {
  "11": "SP", "12": "SP", "13": "SP", "14": "SP", "15": "SP", "16": "SP", "17": "SP", "18": "SP", "19": "SP",
  "21": "RJ", "22": "RJ", "24": "RJ",
  "27": "ES", "28": "ES",
  "31": "MG", "32": "MG", "33": "MG", "34": "MG", "35": "MG", "37": "MG", "38": "MG",
  "41": "PR", "42": "PR", "43": "PR", "44": "PR", "45": "PR", "46": "PR",
  "47": "SC", "48": "SC", "49": "SC",
  "51": "RS", "53": "RS", "54": "RS", "55": "RS",
  "61": "DF",
  "62": "GO", "64": "GO",
  "63": "TO",
  "65": "MT", "66": "MT",
  "67": "MS",
  "68": "AC",
  "69": "RO",
  "71": "BA", "73": "BA", "74": "BA", "75": "BA", "77": "BA",
  "79": "SE",
  "81": "PE", "87": "PE",
  "82": "AL",
  "83": "PB",
  "84": "RN",
  "85": "CE", "88": "CE",
  "86": "PI", "89": "PI",
  "91": "PA", "93": "PA", "94": "PA",
  "92": "AM", "97": "AM",
  "95": "RR",
  "96": "AP",
  "98": "MA", "99": "MA"
};

export default function PrescriptionAnalytics() {
  const [loading, setLoading] = useState(true);
  const [prescriptions, setPrescriptions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [professionals, setProfessionals] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailsType, setDetailsType] = useState(null); // 'medications' | 'byType' | 'byRegion'

  const [stats, setStats] = useState({
    totalPrescriptions: 0,
    byStatus: { rascunho: 0, finalizada: 0, enviada: 0 },
    topMedications: [],
    byType: { medicamento: [], manipulado: [], cosmetico: [], dermocosmetico: [] },
    byRegion: {},
    prescriptionsByUser: []
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [prescs, pats, profs] = await Promise.all([
        Prescription.list(),
        Patient.list(),
        Professional.list()
      ]);

      setPrescriptions(prescs);
      setPatients(pats);
      setProfessionals(profs);
      
      processStats(prescs, pats, profs);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
    setLoading(false);
  };

  const getStateFromPhone = (phone) => {
    if (!phone) return "Desconhecido";
    const cleanPhone = phone.replace(/\D/g, '');
    // Remover código do país se presente
    const phoneWithoutCountry = cleanPhone.startsWith('55') ? cleanPhone.slice(2) : cleanPhone;
    const ddd = phoneWithoutCountry.slice(0, 2);
    return DDD_TO_STATE[ddd] || "Desconhecido";
  };

  const processStats = (prescs, pats, profs) => {
    // Contagem por status
    const byStatus = { rascunho: 0, finalizada: 0, enviada: 0 };
    prescs.forEach(p => {
      byStatus[p.status] = (byStatus[p.status] || 0) + 1;
    });

    // Contagem de medicamentos
    const medicationCounts = {};
    const byType = { medicamento: {}, manipulado: {}, cosmetico: {}, dermocosmetico: {} };

    prescs.forEach(presc => {
      if (presc.items && Array.isArray(presc.items)) {
        presc.items.forEach(item => {
          const name = item.name || "Sem nome";
          const type = item.type || "medicamento";
          
          // Contagem geral
          medicationCounts[name] = (medicationCounts[name] || 0) + 1;
          
          // Contagem por tipo
          if (byType[type]) {
            byType[type][name] = (byType[type][name] || 0) + 1;
          }
        });
      }
    });

    // Top 10 medicamentos
    const topMedications = Object.entries(medicationCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    // Converter byType para arrays ordenadas
    const byTypeArrays = {};
    Object.keys(byType).forEach(type => {
      byTypeArrays[type] = Object.entries(byType[type])
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([name, count]) => ({ name, count }));
    });

    // Contagem por região (baseado no telefone do paciente)
    const byRegion = {};
    const patientMap = new Map(pats.map(p => [p.id, p]));
    
    prescs.forEach(presc => {
      const patient = patientMap.get(presc.patient_id);
      if (patient) {
        const state = getStateFromPhone(patient.phone);
        byRegion[state] = (byRegion[state] || 0) + 1;
      }
    });

    // Prescrições por usuário
    const prescByUser = {};
    prescs.forEach(presc => {
      const userId = presc.created_by;
      if (userId) {
        if (!prescByUser[userId]) {
          prescByUser[userId] = { count: 0, items: [] };
        }
        prescByUser[userId].count++;
        prescByUser[userId].items.push(presc);
      }
    });

    const prescriptionsByUser = Object.entries(prescByUser)
      .map(([email, data]) => ({ email, ...data }))
      .sort((a, b) => b.count - a.count);

    setStats({
      totalPrescriptions: prescs.length,
      byStatus,
      topMedications,
      byType: byTypeArrays,
      byRegion,
      prescriptionsByUser
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      rascunho: "bg-slate-100 text-slate-800",
      finalizada: "bg-green-100 text-green-800",
      enviada: "bg-blue-100 text-blue-800"
    };
    return colors[status] || "bg-slate-100 text-slate-600";
  };

  const openDetails = (type) => {
    setDetailsType(type);
    setShowDetailsModal(true);
  };

  if (loading) {
    return (
      <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0">
        <CardContent className="p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-600">Carregando dados de receitas...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-pink-50 to-rose-50 border-pink-200 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-t-lg">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6" />
            <CardTitle className="text-xl">Analytics de Receitas</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {/* Estatísticas Gerais */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-pink-100 rounded-lg">
                  <FileText className="w-5 h-5 text-pink-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Total de Receitas</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.totalPrescriptions}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Finalizadas</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.byStatus.finalizada}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Enviadas</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.byStatus.enviada}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Pill className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Medicamentos Únicos</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.topMedications.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Cards de Detalhes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Top 10 Medicamentos */}
            <Card className="bg-white border hover:shadow-lg transition-shadow cursor-pointer" onClick={() => openDetails('medications')}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Pill className="w-4 h-4 text-pink-600" />
                  Top 10 Medicamentos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {stats.topMedications.slice(0, 5).map((med, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <span className="truncate flex-1">{med.name}</span>
                      <Badge variant="outline">{med.count}</Badge>
                    </div>
                  ))}
                  {stats.topMedications.length > 5 && (
                    <Button variant="ghost" size="sm" className="w-full text-pink-600">
                      Ver todos ({stats.topMedications.length})
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Por Tipo de Receituário */}
            <Card className="bg-white border hover:shadow-lg transition-shadow cursor-pointer" onClick={() => openDetails('byType')}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-purple-600" />
                  Por Tipo de Receituário
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(stats.byType).map(([type, items]) => (
                    <div key={type} className="flex items-center justify-between text-sm">
                      <span className="capitalize">{type}</span>
                      <Badge variant="outline">{items.length} itens</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Por Região */}
            <Card className="bg-white border hover:shadow-lg transition-shadow cursor-pointer" onClick={() => openDetails('byRegion')}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-green-600" />
                  Por Região (Estado)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(stats.byRegion)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5)
                    .map(([state, count]) => (
                      <div key={state} className="flex items-center justify-between text-sm">
                        <span>{state}</span>
                        <Badge variant="outline">{count}</Badge>
                      </div>
                    ))}
                  {Object.keys(stats.byRegion).length > 5 && (
                    <Button variant="ghost" size="sm" className="w-full text-green-600">
                      Ver todos ({Object.keys(stats.byRegion).length} estados)
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lista de Usuários com Receitas */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-3">Receitas por Usuário</h3>
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {stats.prescriptionsByUser.slice(0, 20).map((user, idx) => (
                <div key={idx} className="flex items-center justify-between bg-white p-3 rounded-lg border">
                  <div>
                    <p className="font-medium text-slate-900">{user.email}</p>
                    <p className="text-sm text-slate-500">{user.count} receitas geradas</p>
                  </div>
                  <Badge className="bg-pink-100 text-pink-800">
                    {user.count}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Detalhes */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {detailsType === 'medications' && <><Pill className="w-5 h-5 text-pink-600" /> Top 10 Medicamentos</>}
              {detailsType === 'byType' && <><BarChart3 className="w-5 h-5 text-purple-600" /> Por Tipo de Receituário</>}
              {detailsType === 'byRegion' && <><MapPin className="w-5 h-5 text-green-600" /> Por Região (Estado)</>}
            </DialogTitle>
          </DialogHeader>
          
          {detailsType === 'medications' && (
            <div className="space-y-3">
              {stats.topMedications.map((med, idx) => (
                <div key={idx} className="flex items-center justify-between bg-slate-50 p-3 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 flex items-center justify-center bg-pink-100 text-pink-700 rounded-full text-sm font-bold">
                      {idx + 1}
                    </span>
                    <span className="font-medium">{med.name}</span>
                  </div>
                  <Badge className="bg-pink-100 text-pink-800">{med.count} prescrições</Badge>
                </div>
              ))}
            </div>
          )}

          {detailsType === 'byType' && (
            <div className="space-y-6">
              {Object.entries(stats.byType).map(([type, items]) => (
                <div key={type}>
                  <h4 className="font-semibold text-slate-900 mb-2 capitalize flex items-center gap-2">
                    {type}
                    <Badge variant="outline">{items.length} itens</Badge>
                  </h4>
                  <div className="space-y-2">
                    {items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-slate-50 p-2 rounded">
                        <span>{item.name}</span>
                        <Badge variant="outline">{item.count}</Badge>
                      </div>
                    ))}
                    {items.length === 0 && (
                      <p className="text-sm text-slate-500 italic">Nenhum item nesta categoria</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {detailsType === 'byRegion' && (
            <div className="space-y-3">
              {Object.entries(stats.byRegion)
                .sort((a, b) => b[1] - a[1])
                .map(([state, count], idx) => (
                  <div key={state} className="flex items-center justify-between bg-slate-50 p-3 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 flex items-center justify-center bg-green-100 text-green-700 rounded-full text-sm font-bold">
                        {idx + 1}
                      </span>
                      <span className="font-medium">{state}</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">{count} receitas</Badge>
                  </div>
                ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}