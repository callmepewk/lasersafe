import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Trash2, Search, Loader2, Sparkles } from "lucide-react";

export default function PrescriptionItemEditor({ item, index, onUpdate, onRemove }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const searchProducts = async (query, searchType) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }

    setSearching(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Você é um assistente farmacêutico especializado em dermatologia e medicina estética.

Busca (${searchType}): "${query}"

Liste produtos/medicamentos relacionados. A busca é por ${searchType === 'name' ? 'NOME DO PRODUTO' : 'PRINCÍPIO ATIVO'}.

Para cada resultado, forneça:
1. Nome comercial completo (ex: "Bepantol Derma", "Cetaphil Loção Hidratante")
2. Nome genérico se aplicável (ex: "Dexpantenol Creme")
3. Princípio ativo principal (ex: "Dexpantenol", "Ácido Hialurônico")
4. Dosagem/concentração disponível no mercado brasileiro (ex: "5%", "50mg/g", "200mg/mL")
5. Tipo: medicamento, manipulado, dermocosmético ou cosmético
6. Principais indicações (ex: "Cicatrização pós-laser", "Hidratação intensiva")
7. Modo de uso padrão (ex: "Aplicar 2x ao dia", "Uso tópico à noite")
8. Quantidade típica (ex: "1 tubo de 30g", "1 frasco de 100mL")

IMPORTANTE:
- Retorne APENAS produtos que EXISTEM no mercado brasileiro
- Priorize produtos comuns em dermatologia/estética
- Inclua opções manipuladas quando relevante
- Ordene por popularidade/relevância
- Limite a 10 resultados

${searchType === 'active' ? 'Se o princípio ativo tem múltiplas apresentações comerciais, liste as principais.' : ''}`,
        response_json_schema: {
          type: "object",
          properties: {
            products: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  generic_name: { type: "string" },
                  active_ingredient: { type: "string" },
                  dosage: { type: "string" },
                  type: { type: "string" },
                  indications: { type: "string" },
                  usage: { type: "string" },
                  typical_quantity: { type: "string" }
                }
              }
            }
          }
        }
      });

      setSuggestions(response.products || []);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
    }
    setSearching(false);
  };

  const applyItem = (product) => {
    onUpdate(index, {
      ...item,
      name: product.name,
      active_ingredient: product.active_ingredient,
      dosage: product.dosage,
      type: product.type || item.type,
      quantity: product.typical_quantity || item.quantity,
      instructions: product.usage || item.instructions
    });
    setSearchQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleFieldChange = (field, value) => {
    onUpdate(index, { ...item, [field]: value });
  };

  return (
    <Card className="bg-slate-50 border-slate-200">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-4">
          <span className="font-semibold text-slate-700 text-lg">Item {index + 1}</span>
          <Button type="button" variant="ghost" size="sm" onClick={() => onRemove(index)}>
            <Trash2 className="w-4 h-4 text-red-600" />
          </Button>
        </div>

        {/* Busca IA Inteligente */}
        <div className="mb-4 bg-white rounded-lg p-3 border border-emerald-200">
          <Label className="text-sm font-medium text-emerald-700 mb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Busca Assistida por IA
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Digite nome do produto ou princípio ativo (ex: Bepantol, dexpantenol, cicatrizante)..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value.length >= 3) {
                  // Detectar se é nome de produto ou princípio ativo
                  const searchType = /^[A-Z]/.test(e.target.value) ? 'name' : 'active';
                  searchProducts(e.target.value, searchType);
                }
              }}
              className="pl-10"
            />
            {searching && (
              <Loader2 className="absolute right-3 top-3 w-4 h-4 text-emerald-600 animate-spin" />
            )}
          </div>

          {showSuggestions && suggestions.length > 0 && (
            <div className="mt-2 max-h-64 overflow-y-auto border border-slate-200 rounded-lg bg-white">
              <div className="text-xs font-semibold text-emerald-700 px-3 py-2 bg-emerald-50 border-b">
                {suggestions.length} produtos encontrados
              </div>
              {suggestions.map((prod, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => applyItem(prod)}
                  className="w-full text-left p-3 hover:bg-emerald-50 transition-colors border-b last:border-0"
                >
                  <div className="font-semibold text-slate-900 text-sm mb-1">
                    {prod.name}
                    {prod.generic_name && prod.generic_name !== prod.name && (
                      <span className="text-slate-500 font-normal"> ({prod.generic_name})</span>
                    )}
                  </div>
                  <div className="text-xs text-slate-600 space-y-0.5">
                    <div><strong>Ativo:</strong> {prod.active_ingredient}</div>
                    <div><strong>Concentração:</strong> {prod.dosage}</div>
                    <div className="text-emerald-700"><strong>Indicações:</strong> {prod.indications}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Formulário do Item */}
        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <Label>Tipo *</Label>
            <Select value={item.type} onValueChange={(value) => handleFieldChange('type', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="medicamento">💊 Medicamento</SelectItem>
                <SelectItem value="manipulado">⚗️ Manipulado</SelectItem>
                <SelectItem value="cosmético">✨ Cosmético</SelectItem>
                <SelectItem value="dermocosmetico">🧴 Dermocosmético</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Nome do Produto *</Label>
            <Input
              value={item.name}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              placeholder="Ex: Bepantol Derma"
            />
          </div>

          <div>
            <Label>Princípio Ativo</Label>
            <Input
              value={item.active_ingredient}
              onChange={(e) => handleFieldChange('active_ingredient', e.target.value)}
              placeholder="Ex: Dexpantenol"
            />
          </div>

          <div>
            <Label>Dosagem/Concentração</Label>
            <Input
              value={item.dosage}
              onChange={(e) => handleFieldChange('dosage', e.target.value)}
              placeholder="Ex: 5% ou 50mg/g"
            />
          </div>

          <div>
            <Label>Quantidade *</Label>
            <Input
              value={item.quantity}
              onChange={(e) => handleFieldChange('quantity', e.target.value)}
              placeholder="Ex: 1 tubo de 30g"
            />
          </div>

          <div className="md:col-span-2">
            <Label>Modo de Usar *</Label>
            <Textarea
              value={item.instructions}
              onChange={(e) => handleFieldChange('instructions', e.target.value)}
              placeholder="Ex: Aplicar 2x ao dia na área tratada, pela manhã e à noite"
              className="h-20"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}