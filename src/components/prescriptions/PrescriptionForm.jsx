import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Loader2 } from "lucide-react";
import SignatureCanvas from "./SignatureCanvas";
import PrescriptionItemEditor from "./PrescriptionItemEditor";

export default function PrescriptionForm({ prescription, onSave, onCancel }) {
  const [patients, setPatients] = useState([]);
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchingMedication, setSearchingMedication] = useState(false);
  const [medicationSearch, setMedicationSearch] = useState("");
  const [medicationSuggestions, setMedicationSuggestions] = useState([]);

  const [formData, setFormData] = useState({
    patient_id: prescription?.patient_id || "",
    patient_name: prescription?.patient_name || "",
    professional_id: prescription?.professional_id || "",
    professional_name: prescription?.professional_name || "",
    prescription_date: prescription?.prescription_date || new Date().toISOString().split('T')[0],
    diagnosis: prescription?.diagnosis || "",
    observations: prescription?.observations || "",
    items: prescription?.items || [],
    signature_data: prescription?.signature_data || "",
    status: prescription?.status || "rascunho"
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [patientsData, professionalsData] = await Promise.all([
        base44.entities.Patient.list(),
        base44.entities.Professional.list()
      ]);
      setPatients(patientsData);
      setProfessionals(professionalsData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
    setLoading(false);
  };

  const searchMedications = async (query) => {
    if (!query || query.length < 3) {
      setMedicationSuggestions([]);
      return;
    }

    setSearchingMedication(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Você é um assistente farmacêutico especializado em dermatologia e medicina estética.

Busca: "${query}"

Liste medicamentos, dermocosméticos, manipulados e produtos relacionados. A busca pode ser por:
- Nome comercial (ex: Bepantol, La Roche-Posay)
- Nome genérico (ex: Paracetamol, Dexametasona)
- Princípio ativo (ex: Dexpantenol, Ácido Hialurônico)
- Categoria (ex: anti-inflamatório, cicatrizante)

Para cada produto, forneça:
1. Nome comercial E nome genérico (se aplicável)
2. Princípio ativo principal
3. Dosagem/concentração típica disponível no mercado
4. Tipo: medicamento, manipulado, dermocosmético ou cosmético
5. Principais indicações de uso (ex: "Pós-laser CO2", "Hidratação pós-procedimento")
6. Modo de uso resumido (ex: "2x ao dia", "Aplicar à noite")

IMPORTANTE: 
- Retorne APENAS produtos/medicamentos que EXISTEM no mercado brasileiro
- Priorize produtos comumente usados em dermatologia/estética
- Inclua opções manipuladas quando relevante
- Limite a 12 resultados mais relevantes

Ordene por relevância para a busca.`,
        response_json_schema: {
          type: "object",
          properties: {
            medications: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  active_ingredient: { type: "string" },
                  dosage: { type: "string" },
                  type: { type: "string" },
                  indications: { type: "string" },
                  usage_instructions: { type: "string" }
                }
              }
            }
          }
        }
      });

      setMedicationSuggestions(response.medications || []);
    } catch (error) {
      console.error('Erro ao buscar medicamentos:', error);
    }
    setSearchingMedication(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (medicationSearch) {
        searchMedications(medicationSearch);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [medicationSearch]);

  const addItem = (suggestion = null) => {
    const newItem = suggestion ? {
      type: suggestion.type || "medicamento",
      name: suggestion.name || "",
      active_ingredient: suggestion.active_ingredient || "",
      dosage: suggestion.dosage || "",
      quantity: "",
      instructions: suggestion.usage_instructions || ""
    } : {
      type: "medicamento",
      name: "",
      active_ingredient: "",
      dosage: "",
      quantity: "",
      instructions: ""
    };

    setFormData({
      ...formData,
      items: [...formData.items, newItem]
    });
    setMedicationSearch("");
    setMedicationSuggestions([]);
  };

  const updateItem = (index, updatedItem) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = updatedItem;
    setFormData({ ...formData, items: updatedItems });
  };

  const removeItem = (index) => {
    const updatedItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: updatedItems });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if ((!(formData.patient_id || formData.patient_name)) || (!(formData.professional_id || formData.professional_name)) || formData.items.length === 0) {
      alert('Preencha paciente (ou nome), profissional (ou nome) e adicione pelo menos 1 item.');
      return;
    }

    setSaving(true);
    try {
      if (prescription) {
        await base44.entities.Prescription.update(prescription.id, formData);
      } else {
        await base44.entities.Prescription.create(formData);
      }
      onSave();
    } catch (error) {
      console.error('Erro ao salvar receita:', error);
      alert('Erro ao salvar receita.');
    }
    setSaving(false);
  };

  if (loading) {
    return <div className="text-center py-8">Carregando...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Seleção de Paciente e Profissional */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="patient">Paciente *</Label>
          <Select value={formData.patient_id} onValueChange={(value) => setFormData({ ...formData, patient_id: value, patient_name: '' })}>
            <SelectTrigger id="patient">
              <SelectValue placeholder="Selecione o paciente" />
            </SelectTrigger>
            <SelectContent>
              {patients.map(p => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="mt-2">
            <Input
              placeholder="Ou digite o nome completo do paciente"
              value={formData.patient_name}
              onChange={(e) => setFormData({ ...formData, patient_name: e.target.value, patient_id: '' })}
            />
            <p className="text-xs text-slate-500 mt-1">Opcional: preencha o nome diretamente se o paciente ainda não estiver cadastrado.</p>
          </div>
        </div>

        <div>
          <Label htmlFor="professional">Profissional *</Label>
          <Select value={formData.professional_id} onValueChange={(value) => setFormData({ ...formData, professional_id: value, professional_name: '' })}>
            <SelectTrigger id="professional">
              <SelectValue placeholder="Selecione o profissional" />
            </SelectTrigger>
            <SelectContent>
              {professionals.map(p => (
                <SelectItem key={p.id} value={p.id}>{p.name} - {p.license_number}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="mt-2">
            <Input
              placeholder="Ou digite o nome do profissional"
              value={formData.professional_name}
              onChange={(e) => setFormData({ ...formData, professional_name: e.target.value, professional_id: '' })}
            />
            <p className="text-xs text-slate-500 mt-1">Opcional: preencha o nome diretamente se o profissional não estiver cadastrado.</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="date">Data da Prescrição</Label>
          <Input
            id="date"
            type="date"
            value={formData.prescription_date}
            onChange={(e) => setFormData({ ...formData, prescription_date: e.target.value })}
          />
        </div>


      </div>

      <div>
        <Label htmlFor="diagnosis">Diagnóstico/Indicação</Label>
        <Input
          id="diagnosis"
          value={formData.diagnosis}
          onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
          placeholder="Ex: Pós-procedimento laser CO2 fracionado"
        />
      </div>

      {/* Itens da Receita */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <Label className="text-lg font-semibold">Itens da Receita *</Label>
          <Button type="button" variant="outline" size="sm" onClick={() => addItem()}>
            <Plus className="w-4 h-4 mr-1" />
            Adicionar Item
          </Button>
        </div>

        {/* Busca IA */}
        <div className="mb-4">
          <Label className="text-sm font-medium text-slate-700 mb-2 block">
            🔍 Busca Inteligente de Medicamentos/Produtos
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Digite nome do produto, princípio ativo ou indicação (ex: cicatrizante, paracetamol, ácido hialurônico)..."
              value={medicationSearch}
              onChange={(e) => setMedicationSearch(e.target.value)}
              className="pl-10 h-10 text-base"
            />
            {searchingMedication && (
              <Loader2 className="absolute right-3 top-3 w-5 h-5 text-emerald-600 animate-spin" />
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            A IA pesquisa automaticamente enquanto você digita (mín. 3 letras)
          </p>

          {medicationSuggestions.length > 0 && (
            <Card className="mt-3 max-h-96 overflow-y-auto shadow-lg border-emerald-200">
              <CardContent className="p-2">
                <div className="text-xs font-semibold text-emerald-700 px-3 py-2 bg-emerald-50 rounded-t-lg mb-1">
                  {medicationSuggestions.length} resultados encontrados - Clique para adicionar
                </div>
                {medicationSuggestions.map((med, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => addItem(med)}
                    className="w-full text-left p-4 hover:bg-emerald-50 rounded-lg transition-colors border-b border-slate-100 last:border-0"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-slate-900 text-base">{med.name}</span>
                          <Badge className="text-xs" variant="outline">
                            {med.type}
                          </Badge>
                        </div>
                        <div className="text-sm text-slate-600 mb-1">
                          <strong>Princípio Ativo:</strong> {med.active_ingredient}
                        </div>
                        <div className="text-sm text-slate-600 mb-1">
                          <strong>Dosagem:</strong> {med.dosage}
                        </div>
                        {med.indications && (
                          <div className="text-sm text-emerald-700 bg-emerald-50 px-2 py-1 rounded mt-2">
                            <strong>💡 Indicações:</strong> {med.indications}
                          </div>
                        )}
                        {med.usage_instructions && (
                          <div className="text-xs text-slate-500 italic mt-1">
                            {med.usage_instructions}
                          </div>
                        )}
                      </div>
                      <Plus className="w-5 h-5 text-emerald-600 shrink-0 mt-1" />
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {formData.items.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-lg">
            <p className="text-slate-500">Nenhum item adicionado. Clique em "Adicionar Item" ou busque medicamentos acima.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {formData.items.map((item, index) => (
              <PrescriptionItemEditor
                key={index}
                item={item}
                index={index}
                onUpdate={updateItem}
                onRemove={removeItem}
              />
            ))}
          </div>
        )}
      </div>

      <div>
        <Label htmlFor="observations">Observações Gerais</Label>
        <Textarea
          id="observations"
          value={formData.observations}
          onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
          placeholder="Observações adicionais sobre a prescrição..."
          className="h-24"
        />
      </div>

      {/* Assinatura Digital */}
      <div>
        <Label className="text-lg font-semibold mb-3 block">Assinatura Digital</Label>
        <SignatureCanvas
          signatureData={formData.signature_data}
          onSave={(data) => setFormData({ ...formData, signature_data: data })}
        />
      </div>

      {/* Botões */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={() => onCancel(formData)} disabled={saving}>
          Cancelar
        </Button>
        <Button type="submit" disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">
          {saving ? 'Salvando...' : prescription ? 'Atualizar Receita' : 'Criar Receita'}
        </Button>
      </div>
    </form>
  );
}