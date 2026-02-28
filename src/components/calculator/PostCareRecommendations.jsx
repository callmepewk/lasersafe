import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Plus, ShoppingCart, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function PostCareRecommendations({ assessment, patient, professional }) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    generateRecommendations();
  }, []);

  const generateRecommendations = async () => {
    setLoading(true);
    try {
      const procedure = assessment.procedure_type === 'Outro' ? assessment.other_procedure_type : assessment.procedure_type;
      const laser = assessment.laser_type === 'Outro' ? assessment.other_laser_type : assessment.laser_type;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Você é um dermatologista especializado em cuidados pós-laser.

Com base no procedimento realizado, sugira produtos de cuidado pós-sessão adequados:

PROCEDIMENTO:
- Tipo: ${procedure}
- Laser/Tecnologia: ${laser}
- Região: ${assessment.region}
- Fototipo: ${assessment.phototype}
- Idade: ${assessment.patient_age} anos

Forneça uma lista de 5-8 produtos essenciais incluindo:
- Dermocosméticos (cremes, géis, séruns)
- Medicamentos tópicos (se necessário)
- Fotoprotetores específicos
- Produtos para hidratação
- Compostos manipulados (se aplicável)

Para cada produto, especifique:
- Nome comercial ou genérico
- Princípio ativo
- Concentração/dosagem
- Finalidade específica
- Modo de uso resumido`,
        response_json_schema: {
          type: "object",
          properties: {
            products: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  active_ingredient: { type: "string" },
                  dosage: { type: "string" },
                  purpose: { type: "string" },
                  usage: { type: "string" },
                  type: { type: "string" }
                }
              }
            }
          }
        }
      });

      setRecommendations(response.products || []);
    } catch (error) {
      console.error('Erro ao gerar recomendações:', error);
    }
    setLoading(false);
  };

  const addToPrescription = async (product) => {
    try {
      // Criar uma nova receita ou adicionar a uma existente
      // Por enquanto, vamos navegar para a página de receitas com os dados do produto
      
      // Salvar no localStorage para uso na página de receitas
      const prescriptionDraft = {
        patient_id: patient.id,
        professional_id: professional.id,
        items: [{
          type: product.type === 'medicamento' ? 'medicamento' : 
                 product.type === 'manipulado' ? 'manipulado' : 'dermocosmetico',
          name: product.name,
          active_ingredient: product.active_ingredient,
          dosage: product.dosage,
          quantity: "1",
          instructions: product.usage
        }],
        diagnosis: `Pós-${assessment.procedure_type} - ${assessment.region}`,
        from_calculator: true
      };

      localStorage.setItem('prescriptionDraft', JSON.stringify(prescriptionDraft));
      
      // Navegar para a página de receitas
      navigate(createPageUrl('Prescriptions'));
    } catch (error) {
      console.error('Erro ao adicionar ao receituário:', error);
      alert('Erro ao adicionar produto ao receituário.');
    }
  };

  const getProductTypeColor = (type) => {
    const colors = {
      'medicamento': 'bg-blue-100 text-blue-800',
      'dermocosmetico': 'bg-purple-100 text-purple-800',
      'manipulado': 'bg-orange-100 text-orange-800',
      'fotoprotetor': 'bg-yellow-100 text-yellow-800'
    };
    return colors[type] || 'bg-slate-100 text-slate-800';
  };

  return (
    <Card className="bg-rose-50 border-rose-200 print:shadow-none print:border-none print:bg-rose-50/50 print:border-rose-100">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-rose-900 text-lg">
          <Heart className="w-5 h-5"/> 
          Recomendações de Cuidados Pós-Sessão
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Orientações Gerais */}
        <div className="bg-white rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-rose-900 mb-3">📋 Orientações Gerais</h4>
          <ul className="list-disc list-inside text-rose-800 space-y-2 text-sm">
            <li>Uso obrigatório de protetor solar (FPS 50+) na área tratada.</li>
            <li>Evitar exposição solar direta por 15-30 dias.</li>
            <li>Manter a pele hidratada com produtos suaves e sem álcool.</li>
            <li>Não utilizar esfoliantes ou ácidos na região por pelo menos 7 dias.</li>
            <li>Evitar banhos quentes, saunas e atividades físicas intensas por 48h.</li>
          </ul>
        </div>

        {/* Produtos Recomendados */}
        <div className="bg-white rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-rose-900">💊 Produtos Recomendados</h4>
            {!loading && recommendations.length > 0 && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => navigate(createPageUrl('Prescriptions'))}
                className="border-emerald-600 text-emerald-700 hover:bg-emerald-50"
              >
                <ShoppingCart className="w-4 h-4 mr-1" />
                Ver Receituário
              </Button>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 text-rose-600 animate-spin mr-2" />
              <span className="text-slate-600">Gerando recomendações personalizadas...</span>
            </div>
          ) : (
            <div className="space-y-3">
              {recommendations.map((product, index) => (
                <div key={index} className="bg-slate-50 p-4 rounded-lg border border-slate-200 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h5 className="font-semibold text-slate-900">{product.name}</h5>
                        <Badge className={getProductTypeColor(product.type)} variant="outline">
                          {product.type}
                        </Badge>
                      </div>
                      
                      <div className="space-y-1 text-sm text-slate-700">
                        <p><strong>Ativo:</strong> {product.active_ingredient}</p>
                        {product.dosage && <p><strong>Concentração:</strong> {product.dosage}</p>}
                        <p className="text-rose-700"><strong>Finalidade:</strong> {product.purpose}</p>
                        <p className="text-slate-600 italic">{product.usage}</p>
                      </div>
                    </div>
                    
                    <Button 
                      size="sm"
                      onClick={() => addToPrescription(product)}
                      className="bg-emerald-600 hover:bg-emerald-700 shrink-0 print:hidden"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Receitar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}