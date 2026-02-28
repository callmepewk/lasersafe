import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calculator, TrendingUp, DollarSign, Clock, Mail, BarChart3, Zap, Share2, Printer, ShieldCheck, ShieldAlert, FileSearch } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { base44 } from "@/api/base44Client";
import { Combobox } from "@/components/ui/combobox";
import { laserDatabase } from "@/components/calculator/laserDatabase";
import { laserTechOptions } from "@/components/calculator/laserTechOptions";
import DeviceIdentifier from "@/components/calculator/DeviceIdentifier";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export default function LaserViabilityCalculator() {
  const [currentUser, setCurrentUser] = useState(null);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [formData, setFormData] = useState({
    // Investimento
    deviceModel: "",
    deviceBrand: "",
    purchaseCost: "",
    additionalCosts: "",
    leasingCost: "",
    maintenanceCost: "",
    lifespanYears: "5",
    taxRate: "10",
    
    // Operação
    sessionPrice: "",
    fixedMonthlyCosts: "",
    sessionsPerHour: "2",
    daysPerMonth: "20",
    hoursPerDay: "6",
    
    // Receita
    avgSessionPrice: "",
    avgDiscount: "15",
  });

  const [results, setResults] = useState({
    netPricePerSession: 0,
    grossMargin: 0,
    grossMarginPercent: 0,
    maxMonthlyCapacity: 0,
    potentialMonthlyRevenue: 0,
    roiMonths: 0,
    viabilityRating: "moderate",
    monthlyProfit: 0,
    annualProfit: 0,
    totalInvestment: 0, // Added to results state
    totalMonthlyCosts: 0, // Added to results state
  });

  // Popup state for manual calc
  const [activeTab, setActiveTab] = useState('investment');
  const [showCalcDialog, setShowCalcDialog] = useState(false);

  // ANVISA check state
  const [anvisaFileUrl, setAnvisaFileUrl] = useState("");
  const [anvisaChecking, setAnvisaChecking] = useState(false);
  const [anvisaResult, setAnvisaResult] = useState(null);
  const [deviceInfo, setDeviceInfo] = useState({});
  const handleDeviceInfoChange = (info) => {
    setDeviceInfo(info);
    if (info.model) handleInputChange("deviceModel", info.model);
    if (info.brand) handleInputChange("deviceBrand", info.brand);
  };

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    calculateViability();
  }, [formData]);

  const loadUserData = async () => {
    try {
      const user = await base44.auth.me();
      setCurrentUser(user);
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
      // Optionally handle error, e.g., redirect to login or show message
    }
  };

  const calculateViability = () => {
    const purchaseCost = parseFloat(formData.purchaseCost) || 0;
    const additionalCosts = parseFloat(formData.additionalCosts) || 0;
    const leasingCost = parseFloat(formData.leasingCost) || 0;
    const maintenanceCost = parseFloat(formData.maintenanceCost) || 0;
    const sessionPrice = parseFloat(formData.sessionPrice) || 0; // Cost per session
    const fixedMonthlyCosts = parseFloat(formData.fixedMonthlyCosts) || 0;
    const sessionsPerHour = parseFloat(formData.sessionsPerHour) || 2;
    const daysPerMonth = parseFloat(formData.daysPerMonth) || 20;
    const hoursPerDay = parseFloat(formData.hoursPerDay) || 6;
    const avgDiscount = parseFloat(formData.avgDiscount) || 0;
    const avgSessionPrice = parseFloat(formData.avgSessionPrice) || 0; // Revenue per session

    // Cálculos
    const totalInvestment = purchaseCost + additionalCosts;
    const netPricePerSession = avgSessionPrice * (1 - avgDiscount / 100); // Revenue after discount
    const maxMonthlyCapacity = sessionsPerHour * hoursPerDay * daysPerMonth;
    const potentialMonthlyRevenue = netPricePerSession * maxMonthlyCapacity;
    const totalMonthlyCosts = fixedMonthlyCosts + leasingCost + (maintenanceCost / 12); // Annual maintenance / 12 for monthly
    const monthlyProfit = potentialMonthlyRevenue - totalMonthlyCosts - (sessionPrice * maxMonthlyCapacity); // Subtract variable costs
    const annualProfit = monthlyProfit * 12;
    
    // Gross margin should be calculated based on net revenue per session vs variable cost per session
    // For a clearer metric, consider profit margin per session = (netPricePerSession - sessionPrice)
    // The current grossMargin calculation is not standard, let's redefine it
    const profitPerSession = netPricePerSession - sessionPrice;
    const grossMargin = profitPerSession; // Renaming to profit per session for clarity
    const grossMarginPercent = netPricePerSession > 0 ? (profitPerSession / netPricePerSession) * 100 : 0;
    
    const roiMonths = monthlyProfit > 0 ? totalInvestment / monthlyProfit : 0;

    let viabilityRating = "low";
    if (roiMonths > 0 && roiMonths < 12) viabilityRating = "high";
    else if (roiMonths >= 12 && roiMonths <= 18) viabilityRating = "moderate";

    setResults({
      netPricePerSession,
      grossMargin, // This now represents profit per session
      grossMarginPercent,
      maxMonthlyCapacity,
      potentialMonthlyRevenue,
      roiMonths,
      viabilityRating,
      monthlyProfit,
      annualProfit,
      totalInvestment, // Added to results
      totalMonthlyCosts, // Added to results
    });
  };

  const handleAnvisaFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const res = await base44.integrations.Core.UploadFile({ file });
    if (res?.file_url) {
      setAnvisaFileUrl(res.file_url);
    }
  };

  const verifyAnvisaRegistration = async () => {
    if (!formData.deviceModel) return;
    setAnvisaChecking(true);
    setAnvisaResult(null);

    const keywords = [
      'LASER','LUZ INTENSA','RADIOFREQUENCIA','ULTRASSOM','CRIOLIPOLISE','IPL','ND:YAG','CO2','DIODO','ALEXANDRITE',
      ...Array.from(new Set(laserDatabase.flatMap(d => [d.type || '', d.wavelength || '', d.name || '']))).filter(Boolean)
    ].slice(0, 200);

    const schema = {
      type: 'object',
      properties: {
        found: { type: 'boolean' },
        confidence: { type: 'number' },
        record_name: { type: 'string' },
        manufacturer: { type: 'string' },
        category: { type: 'string' },
        registration_number: { type: 'string' },
        matched_keywords: { type: 'array', items: { type: 'string' } },
        reasoning: { type: 'string' }
      }
    };

    const prompt = `Você é um assistente regulatório. Verifique em fontes oficiais (ANVISA) e bases públicas se o modelo abaixo está registrado no Brasil.

Modelo: ${formData.deviceModel}
Marca: ${formData.deviceBrand || '(não informada)'}

Instruções:
- Busque por nomes equivalentes/sinônimos e variações de grafia/acentos.
- Priorize palavras-chave: ${keywords.join(', ')}.
- Se houver múltiplas entradas, escolha a mais compatível e retorne o nº de registro.
- Responda estritamente no JSON do schema fornecido.`;

    try {
      // Anexar somente arquivos enviados
      const attachments = anvisaFileUrl ? [anvisaFileUrl] : [];
      const res = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true,
        file_urls: attachments.length ? attachments : undefined,
        response_json_schema: schema
      });
      setAnvisaResult(res);
    } catch (e) {
      console.error('Erro na verificação ANVISA:', e);
      setAnvisaResult({ found: false, confidence: 0, reasoning: 'Erro ao analisar documento.' });
    }
    setAnvisaChecking(false);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getViabilityColor = (rating) => {
    switch (rating) {
      case "high": return "bg-green-500";
      case "moderate": return "bg-yellow-500";
      default: return "bg-red-500";
    }
  };

  const getViabilityLabel = (rating) => {
    switch (rating) {
      case "high": return "🟢 Alta Viabilidade";
      case "moderate": return "🟡 Viabilidade Moderada";
      default: return "🔴 Baixa Viabilidade";
    }
  };

  const generateReportHTML = () => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Relatório de Viabilidade - ${formData.deviceModel || 'Equipamento Laser'}</title>
        <style>
          @page { margin: 1.5cm; }
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6;
            color: #1e293b;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%);
            color: white;
            padding: 30px;
            border-radius: 12px;
            text-align: center;
            margin-bottom: 30px;
          }
          .header h1 { margin: 0 0 10px 0; font-size: 28px; }
          .header p { margin: 0; opacity: 0.9; font-size: 14px; }
          .section {
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            border-left: 4px solid #0ea5e9;
          }
          .section h2 {
            color: #0ea5e9;
            margin-top: 0;
            font-size: 20px;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 10px;
          }
          .info-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
            margin-top: 15px;
          }
          .info-item {
            background: white;
            padding: 12px;
            border-radius: 6px;
            border: 1px solid #e2e8f0;
          }
          .info-label {
            font-size: 12px;
            color: #64748b;
            margin-bottom: 4px;
          }
          .info-value {
            font-size: 18px;
            font-weight: bold;
            color: #1e293b;
          }
          .highlight-box {
            background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%);
            color: white;
            padding: 25px;
            border-radius: 12px;
            text-align: center;
            margin: 30px 0;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          .highlight-box .big-number {
            font-size: 48px;
            font-weight: bold;
            margin: 10px 0;
          }
          .highlight-box .label {
            font-size: 16px;
            opacity: 0.9;
          }
          .viability-badge {
            display: inline-block;
            padding: 12px 24px;
            border-radius: 20px;
            font-weight: bold;
            font-size: 18px;
            margin-top: 15px;
          }
          .viability-high { background: #22c55e; color: white; }
          .viability-moderate { background: #eab308; color: white; }
          .viability-low { background: #ef4444; color: white; }
          .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e2e8f0;
            color: #64748b;
            font-size: 12px;
          }
          .footer strong { color: #0ea5e9; }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
          }
          th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e2e8f0;
          }
          th {
            background: #f1f5f9;
            font-weight: 600;
            color: #475569;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📊 Relatório de Viabilidade de Investimento em Laser</h1>
          <p>Desenvolvido pelo Dr. Jauru Nunes de Freitas - Mapa da Estética</p>
          <p>Gerado em: ${new Date().toLocaleDateString('pt-BR', { 
            day: '2-digit', 
            month: 'long', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</p>
        </div>

        <div class="section">
          <h2>🔹 Dados do Equipamento</h2>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Modelo do Laser</div>
              <div class="info-value">${formData.deviceModel || 'Não especificado'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Marca</div>
              <div class="info-value">${formData.deviceBrand || 'Não especificado'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Custo de Aquisição</div>
              <div class="info-value">${formatCurrency(parseFloat(formData.purchaseCost) || 0)}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Investimento Total</div>
              <div class="info-value">${formatCurrency(results.totalInvestment || 0)}</div>
            </div>
          </div>
        </div>

        <div class="highlight-box">
          <div class="label">⏱️ RETORNO DO INVESTIMENTO (ROI)</div>
          <div class="big-number">${results.roiMonths.toFixed(1)} meses</div>
          <div class="viability-badge viability-${results.viabilityRating}">
            ${getViabilityLabel(results.viabilityRating)}
          </div>
        </div>

        <div class="section">
          <h2>💰 Análise Financeira</h2>
          <table>
            <tr>
              <th>Métrica</th>
              <th>Valor</th>
            </tr>
            <tr>
              <td>Preço Médio por Sessão (Tabela)</td>
              <td><strong>${formatCurrency(parseFloat(formData.avgSessionPrice) || 0)}</strong></td>
            </tr>
            <tr>
              <td>Desconto Aplicado</td>
              <td><strong>${parseFloat(formData.avgDiscount) || 0}%</strong></td>
            </tr>
            <tr>
              <td>Preço Líquido por Sessão (Receita)</td>
              <td><strong>${formatCurrency(results.netPricePerSession)}</strong></td>
            </tr>
            <tr>
              <td>Custo Variável por Procedimento</td>
              <td><strong>${formatCurrency(parseFloat(formData.sessionPrice) || 0)}</strong></td>
            </tr>
            <tr>
              <td>Lucro por Sessão</td>
              <td><strong>${formatCurrency(results.grossMargin)}</strong></td>
            </tr>
            <tr>
              <td>Margem de Lucro por Sessão</td>
              <td><strong>${results.grossMarginPercent.toFixed(1)}%</strong></td>
            </tr>
            <tr>
              <td>Capacidade Máxima Mensal</td>
              <td><strong>${results.maxMonthlyCapacity.toFixed(0)} sessões</strong></td>
            </tr>
            <tr>
              <td>Receita Potencial Mensal</td>
              <td><strong>${formatCurrency(results.potentialMonthlyRevenue)}</strong></td>
            </tr>
            <tr>
              <td>Custos Fixos Mensais da Clínica</td>
              <td><strong>${formatCurrency(parseFloat(formData.fixedMonthlyCosts) || 0)}</strong></td>
            </tr>
            <tr>
              <td>Custos de Leasing/Aluguel Mensal</td>
              <td><strong>${formatCurrency(parseFloat(formData.leasingCost) || 0)}</strong></td>
            </tr>
            <tr>
              <td>Custo de Manutenção Mensal</td>
              <td><strong>${formatCurrency((parseFloat(formData.maintenanceCost) || 0) / 12)}</strong></td>
            </tr>
            <tr>
              <td>Custos Totais Mensais (Fixos + Operacionais)</td>
              <td><strong>${formatCurrency(results.totalMonthlyCosts || 0)}</strong></td>
            </tr>
            <tr>
              <td>Lucro Líquido Mensal</td>
              <td><strong style="color: #22c55e;">${formatCurrency(results.monthlyProfit)}</strong></td>
            </tr>
            <tr>
              <td>Lucro Líquido Anual</td>
              <td><strong style="color: #22c55e;">${formatCurrency(results.annualProfit)}</strong></td>
            </tr>
          </table>
        </div>

        <div class="section">
          <h2>📋 Parâmetros Operacionais</h2>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Sessões por Hora</div>
              <div class="info-value">${formData.sessionsPerHour}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Horas por Dia</div>
              <div class="info-value">${formData.hoursPerDay}h</div>
            </div>
            <div class="info-item">
              <div class="info-label">Dias por Mês</div>
              <div class="info-value">${formData.daysPerMonth} dias</div>
            </div>
            <div class="info-item">
              <div class="info-label">Vida Útil Estimada</div>
              <div class="info-value">${formData.lifespanYears} anos</div>
            </div>
          </div>
        </div>

        <div class="footer">
          <p><strong>Calculadora de Viabilidade de Laser</strong></p>
          <p>Desenvolvida por Dr. Jauru Nunes de Freitas - Mapa da Estética</p>
          <p>© ${new Date().getFullYear()} LaserCode - Ferramenta Exclusiva para Análise de Investimentos</p>
          <p style="margin-top: 10px; font-size: 11px;">
            Este relatório é uma estimativa baseada nos dados fornecidos. 
            Consulte sempre um especialista financeiro antes de tomar decisões de investimento.
          </p>
        </div>
      </body>
      </html>
    `;
  };

  const handleCalculateNow = () => {
    calculateViability();
    setShowCalcDialog(true);
  };

  const exportToPDF = () => {
    const printWindow = window.open('', '_blank');
    const reportHTML = generateReportHTML();
    
    printWindow.document.write(reportHTML);
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  const sendByEmail = async () => {
    if (!currentUser?.email) {
      alert('Email do usuário não encontrado. Faça login novamente ou atualize seu perfil.');
      return;
    }

    setShowEmailDialog(true);
  };

  const confirmSendEmail = async () => {
    setIsSendingEmail(true);
    try {
      const reportHTML = generateReportHTML();
      
      await base44.integrations.Core.SendEmail({
        from_name: "LaserCode - Calculadora de Viabilidade",
        to: currentUser.email,
        subject: `📊 Relatório de Viabilidade - ${formData.deviceModel || 'Equipamento Laser'}`,
        body: `
Olá ${currentUser.full_name || 'Profissional'},

Segue em anexo o relatório completo de viabilidade do equipamento de laser que você analisou na plataforma LaserCode.

📋 RESUMO EXECUTIVO:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔹 Equipamento: ${formData.deviceModel || 'Não especificado'} - ${formData.deviceBrand || 'Não especificado'}
💰 Investimento Total: ${formatCurrency(results.totalInvestment || 0)}
⏱️ ROI Estimado: ${results.roiMonths > 0 ? results.roiMonths.toFixed(1) + ' meses' : 'Não Calculado (Lucro <= 0)'}
📊 Viabilidade: ${getViabilityLabel(results.viabilityRating)}

💵 ANÁLISE FINANCEIRA:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Receita Potencial Mensal: ${formatCurrency(results.potentialMonthlyRevenue)}
• Lucro Líquido Mensal: ${formatCurrency(results.monthlyProfit)}
• Lucro Líquido Anual: ${formatCurrency(results.annualProfit)}
• Margem de Lucro por Sessão: ${results.grossMarginPercent.toFixed(1)}%

📈 CAPACIDADE OPERACIONAL:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Capacidade Máxima Mensal: ${results.maxMonthlyCapacity.toFixed(0)} sessões
• Preço Líquido por Sessão (Receita): ${formatCurrency(results.netPricePerSession)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Para visualizar o relatório completo formatado, abra o link abaixo ou imprima este email em modo paisagem.

---

${reportHTML}

---

Atenciosamente,
Equipe LaserCode
Dr. Jauru Nunes de Freitas - Mapa da Estética

Este é um email automático. Para mais informações, acesse: https://lasercode.app
        `
      });

      alert(`✅ Relatório enviado com sucesso para ${currentUser.email}!`);
      setShowEmailDialog(false);
    } catch (error) {
      console.error('Erro ao enviar email:', error);
      alert('❌ Erro ao enviar email. Tente novamente.');
    }
    setIsSendingEmail(false);
  };

  const shareViaWhatsApp = () => {
    if (!currentUser?.phone) {
      alert('Número de telefone não cadastrado. Atualize seu perfil para usar esta função.');
      return;
    }

    const cleanPhone = currentUser.phone.replace(/\D/g, '');
    
    const message = `
📊 *RELATÓRIO DE VIABILIDADE - EQUIPAMENTO LASER*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔹 *Equipamento:* ${formData.deviceModel || 'Não especificado'}
🏢 *Marca:* ${formData.deviceBrand || 'Não especificado'}

💰 *ANÁLISE FINANCEIRA*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Investimento Total: *${formatCurrency(results.totalInvestment || 0)}*
• Receita Mensal: *${formatCurrency(results.potentialMonthlyRevenue)}*
• Lucro Mensal: *${formatCurrency(results.monthlyProfit)}*
• Lucro Anual: *${formatCurrency(results.annualProfit)}*

⏱️ *ROI: ${results.roiMonths > 0 ? results.roiMonths.toFixed(1) + ' meses' : 'Não Calculado (Lucro <= 0)'}*
📊 *Viabilidade: ${getViabilityLabel(results.viabilityRating)}*

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📱 Gerado pelo LaserCode - Calculadora de Viabilidade
👨‍⚕️ Dr. Jauru Nunes de Freitas - Mapa da Estética
🔗 https://lasercode.app
    `.trim();

    const whatsappURL = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappURL, '_blank');
  };

  // Sugestões combinadas: Tecnologias expostas + todos os modelos do banco (prioriza nacionais)
  const brazilianManufacturers = ["Ibramed","HTM","KLD","MMOptics","DGM","Tone Derm"];
  const techOptions = laserTechOptions.map(t => ({ value: t.value, label: `${t.label} [Tecnologia]` }));
  const modelOptions = laserDatabase.map(d => ({ value: d.name, label: `${d.name} (${d.manufacturer})`, m: d.manufacturer || "" }));
  const modelOptionsSorted = modelOptions.sort((a,b) => {
    const pa = brazilianManufacturers.some(m => a.m?.toLowerCase().includes(m.toLowerCase())) ? 0 : 1;
    const pb = brazilianManufacturers.some(m => b.m?.toLowerCase().includes(m.toLowerCase())) ? 0 : 1;
    if (pa !== pb) return pa - pb;
    return a.label.localeCompare(b.label, 'pt-BR');
  }).map(({m, ...rest}) => rest);
  const combinedOptions = [...techOptions, ...modelOptionsSorted];

  const steps = [
    { key: 'investment', label: 'Investimento' },
    { key: 'operation', label: 'Operação' },
    { key: 'revenue', label: 'Receita' },
  ];

  return (
    <>
      <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-0 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Calculator className="w-6 h-6" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">Calculadora de Viabilidade de Laser</CardTitle>
                <p className="text-blue-100 text-sm mt-1">
                  Desenvolvida pelo <span className="font-semibold">Dr. Jauru Nunes de Freitas</span> - Analise a viabilidade financeira de investir em equipamento de laser para sua clínica
                </p>
              </div>
            </div>
            <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm px-3 py-1">
              Ferramenta Exclusiva
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-4 md:p-6">
          <div className="max-h-[70vh] md:max-h-[75vh] overflow-y-auto pr-1 md:pr-2">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* COLUNA ESQUERDA - INPUTS */}
            <div className="lg:col-span-2">
              <Card className="bg-slate-50 border-slate-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2 text-slate-700">
                    <DollarSign className="w-5 h-5 text-blue-600" />
                    Dados de Entrada
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
  <div className="flex flex-wrap items-center gap-2 mb-4">
    {steps.map((s, i) => (
      <div key={s.key} className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${activeTab === s.key ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${activeTab === s.key ? 'bg-white/20' : 'bg-white text-slate-600'}`}>{i + 1}</span>
        <span className="hidden sm:inline">{s.label}</span>
      </div>
    ))}
  </div>
                    <TabsList className="grid w-full grid-cols-3 mb-6">
                      <TabsTrigger value="investment" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Investimento
                      </TabsTrigger>
                      <TabsTrigger value="operation" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                        <Zap className="w-4 h-4 mr-2" />
                        Operação
                      </TabsTrigger>
                      <TabsTrigger value="revenue" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Receita
                      </TabsTrigger>
                    </TabsList>

                    {/* TAB: INVESTIMENTO */}
                    <TabsContent value="investment" className="space-y-4">
                      <div>
                        <Label htmlFor="deviceModel">Modelo do Laser</Label>
                        <Combobox
                          options={combinedOptions}
                          value={formData.deviceModel}
                          onChange={(val) => {
                            const selected = laserDatabase.find(d => d.name === val);
                            handleInputChange("deviceModel", val);
                            if (selected?.manufacturer) {
                              handleInputChange("deviceBrand", selected.manufacturer);
                            }
                          }}
                          placeholder="Pesquise e selecione o modelo..."
                          emptyText="Nenhum modelo encontrado"
                          pageSize={10}
                        />
                        <div className="mt-2">
                          <Button
                            type="button"
                            onClick={verifyAnvisaRegistration}
                            disabled={!formData.deviceModel || anvisaChecking}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <FileSearch className="w-4 h-4 mr-2" />
                            {anvisaChecking ? 'Verificando...' : 'Verificar registro ANVISA'}
                          </Button>
                        </div>
                        {anvisaResult && (
                          <div className={`mt-3 p-3 rounded-lg border ${anvisaResult.found ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                            <div className="flex items-center gap-2 font-semibold">
                              {anvisaResult.found ? (
                                <><ShieldCheck className="w-4 h-4 text-green-600" /> Registrado pela ANVISA</>
                              ) : (
                                <><ShieldAlert className="w-4 h-4 text-red-600" /> Não encontrado como registrado</>
                              )}
                            </div>
                            <div className="text-sm text-slate-600 mt-1 space-y-1">
                              {anvisaResult.record_name && <p><strong>Entrada:</strong> {anvisaResult.record_name}</p>}
                              {anvisaResult.manufacturer && <p><strong>Fabricante:</strong> {anvisaResult.manufacturer}</p>}
                              {anvisaResult.registration_number && <p><strong>Nº Registro:</strong> {anvisaResult.registration_number}</p>}
                              {anvisaResult.category && <p><strong>Categoria:</strong> {anvisaResult.category}</p>}
                              {Array.isArray(anvisaResult.matched_keywords) && anvisaResult.matched_keywords.length > 0 && (
                                <p><strong>Palavras-chave:</strong> {anvisaResult.matched_keywords.slice(0,6).join(', ')}</p>
                              )}
                              {typeof anvisaResult.confidence === 'number' && <p><strong>Confiança:</strong> {(anvisaResult.confidence * 100).toFixed(0)}%</p>}
                              {anvisaResult.reasoning && <p className="italic">{anvisaResult.reasoning}</p>}
                            </div>
                          </div>
                        )}
                        <div className="mt-4">
                          <DeviceIdentifier deviceInfo={deviceInfo} onDeviceInfoChange={handleDeviceInfoChange} />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="deviceBrand">Marca do Laser</Label>
                        <Input
                          id="deviceBrand"
                          value={formData.deviceBrand}
                          onChange={(e) => handleInputChange("deviceBrand", e.target.value)}
                          placeholder="Ex: Ibramed"
                        />
                      </div>
                      <div>
                        <Label htmlFor="purchaseCost">Custo de Aquisição (Compra)</Label>
                        <Input
                          id="purchaseCost"
                          type="number"
                          value={formData.purchaseCost}
                          onChange={(e) => handleInputChange("purchaseCost", e.target.value)}
                          placeholder="150000"
                        />
                      </div>
                      <div>
                        <Label htmlFor="additionalCosts">Custos Adicionais (Frete, Instalação)</Label>
                        <Input
                          id="additionalCosts"
                          type="number"
                          value={formData.additionalCosts}
                          onChange={(e) => handleInputChange("additionalCosts", e.target.value)}
                          placeholder="5000"
                        />
                      </div>
                      <div>
                        <Label htmlFor="leasingCost">Custo de Aluguel/Leasing Mensal</Label>
                        <Input
                          id="leasingCost"
                          type="number"
                          value={formData.leasingCost}
                          onChange={(e) => handleInputChange("leasingCost", e.target.value)}
                          placeholder="4000"
                        />
                      </div>
                      <div>
                        <Label htmlFor="maintenanceCost">Custo de Manutenção Anual</Label>
                        <Input
                          id="maintenanceCost"
                          type="number"
                          value={formData.maintenanceCost}
                          onChange={(e) => handleInputChange("maintenanceCost", e.target.value)}
                          placeholder="12000"
                        />
                      </div>
                      <div>
                        <Label htmlFor="lifespanYears">Vida Útil Estimada (anos)</Label>
                        <Input
                          id="lifespanYears"
                          type="number"
                          value={formData.lifespanYears}
                          onChange={(e) => handleInputChange("lifespanYears", e.target.value)}
                          placeholder="5"
                        />
                      </div>
                      <div>
                        <Label htmlFor="taxRate">Taxa Renda Fixa (Selic/CDI Anual %)</Label>
                        <Input
                          id="taxRate"
                          type="number"
                          value={formData.taxRate}
                          onChange={(e) => handleInputChange("taxRate", e.target.value)}
                          placeholder="10"
                        />
                      </div>
                    </TabsContent>

                    {/* TAB: OPERAÇÃO */}
                    <TabsContent value="operation" className="space-y-4">
                      <div>
                        <Label htmlFor="sessionPrice">Custo Variável por Procedimento</Label>
                        <Input
                          id="sessionPrice"
                          type="number"
                          value={formData.sessionPrice}
                          onChange={(e) => handleInputChange("sessionPrice", e.target.value)}
                          placeholder="50"
                        />
                      </div>
                      <div>
                        <Label htmlFor="fixedMonthlyCosts">Custos Fixos Atuais da Clínica (Mensal)</Label>
                        <Input
                          id="fixedMonthlyCosts"
                          type="number"
                          value={formData.fixedMonthlyCosts}
                          onChange={(e) => handleInputChange("fixedMonthlyCosts", e.target.value)}
                          placeholder="20000"
                        />
                      </div>
                      <div>
                        <Label htmlFor="sessionsPerHour">Sessões por Hora (Produtividade)</Label>
                        <Input
                          id="sessionsPerHour"
                          type="number"
                          value={formData.sessionsPerHour}
                          onChange={(e) => handleInputChange("sessionsPerHour", e.target.value)}
                          placeholder="2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="daysPerMonth">Dias/Mês Dedicados ao Laser</Label>
                        <Input
                          id="daysPerMonth"
                          type="number"
                          value={formData.daysPerMonth}
                          onChange={(e) => handleInputChange("daysPerMonth", e.target.value)}
                          placeholder="20"
                        />
                      </div>
                      <div>
                        <Label htmlFor="hoursPerDay">Horas/Dia Dedicadas ao Laser</Label>
                        <Input
                          id="hoursPerDay"
                          type="number"
                          value={formData.hoursPerDay}
                          onChange={(e) => handleInputChange("hoursPerDay", e.target.value)}
                          placeholder="6"
                        />
                      </div>
                    </TabsContent>

                    {/* TAB: RECEITA */}
                    <TabsContent value="revenue" className="space-y-4">
                      <div>
                        <Label htmlFor="avgSessionPrice">Preço Médio por Sessão (Tabela)</Label>
                        <Input
                          id="avgSessionPrice"
                          type="number"
                          value={formData.avgSessionPrice}
                          onChange={(e) => handleInputChange("avgSessionPrice", e.target.value)}
                          placeholder="800"
                        />
                      </div>
                      <div>
                        <Label htmlFor="avgDiscount">Desconto Médio em Pacotes (%)</Label>
                        <Input
                          id="avgDiscount"
                          type="number"
                          value={formData.avgDiscount}
                          onChange={(e) => handleInputChange("avgDiscount", e.target.value)}
                          placeholder="15"
                        />
                      </div>
                      <div className="pt-4">
                        <Button 
                          className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg h-12"
                          onClick={calculateViability}
                        >
                          <Calculator className="w-5 h-5 mr-2" />
                          Calcular Viabilidade
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>

            {/* COLUNA DIREITA - PREVIEW/RESULTADOS */}
            <div className="lg:col-span-1">
              <Card className="bg-gradient-to-br from-blue-600 to-cyan-600 text-white shadow-2xl sticky top-4">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <TrendingUp className="w-6 h-6" />
                    Análise de Viabilidade (Preview)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Preço Líquido por Sessão */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                    <p className="text-blue-100 text-sm mb-1">Preço Líquido por Sessão (Receita)</p>
                    <p className="text-3xl font-bold">{formatCurrency(results.netPricePerSession)}</p>
                  </div>

                  {/* Margem Bruta */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                    <p className="text-blue-100 text-sm mb-1">Lucro por Sessão</p>
                    <p className="text-3xl font-bold">{formatCurrency(results.grossMargin)}</p>
                    <p className="text-blue-200 text-sm mt-1">({results.grossMarginPercent.toFixed(1)}%)</p>
                  </div>

                  {/* Capacidade Máxima Mensal */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                    <p className="text-blue-100 text-sm mb-1">Capacidade Máxima Mensal</p>
                    <p className="text-3xl font-bold">{results.maxMonthlyCapacity.toFixed(0)} sessões</p>
                  </div>

                  {/* Receita Potencial Mensal */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                    <p className="text-blue-100 text-sm mb-1">Receita Potencial Mensal</p>
                    <p className="text-3xl font-bold">{formatCurrency(results.potentialMonthlyRevenue)}</p>
                  </div>

                  {/* Lucro Mensal */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                    <p className="text-blue-100 text-sm mb-1">Lucro Líquido Mensal</p>
                    <p className="text-3xl font-bold">{formatCurrency(results.monthlyProfit)}</p>
                  </div>

                  {/* ROI */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                    <p className="text-blue-100 text-sm mb-1">Retorno do Investimento (ROI)</p>
                    <p className="text-3xl font-bold flex items-center gap-2">
                      <Clock className="w-6 h-6" />
                      {results.roiMonths > 0 ? results.roiMonths.toFixed(1) : 'N/A'} meses
                    </p>
                  </div>

                  {/* Viabilidade */}
                  <div className={`${getViabilityColor(results.viabilityRating)} bg-opacity-90 backdrop-blur-sm rounded-lg p-4 border border-white/30`}>
                    <p className="text-white text-lg font-bold text-center">
                      {getViabilityLabel(results.viabilityRating)}
                    </p>
                  </div>

                  <div className="pt-2 text-xs text-blue-100 text-center italic">
                    Pressione as 3 abas acima para ver o relatório completo
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* AÇÕES */}
          <div className="flex flex-wrap gap-3 mt-6 justify-center">
            <Button 
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
              onClick={handleCalculateNow}
            >
              <Calculator className="w-4 h-4 mr-2" />
              Calcular Agora
            </Button>
            <Button 
              variant="outline" 
              className="border-blue-600 text-blue-600 hover:bg-blue-50"
              onClick={exportToPDF}
            >
              <Printer className="w-4 h-4 mr-2" />
              Imprimir / Salvar PDF
            </Button>
            <Button 
              variant="outline" 
              className="border-cyan-600 text-cyan-600 hover:bg-cyan-50"
              onClick={sendByEmail}
            >
              <Mail className="w-4 h-4 mr-2" />
              Enviar por E-mail
            </Button>
            <Button 
              variant="outline" 
              className="border-green-600 text-green-600 hover:bg-green-50"
              onClick={shareViaWhatsApp}
            >
              <Share2 className="w-4 h-4 mr-2" />
              Compartilhar WhatsApp
            </Button>
          </div>

          {/* RODAPÉ */}
          <div className="mt-8 p-6 bg-gradient-to-r from-slate-900 to-blue-900 rounded-xl text-center">
            <p className="text-white font-semibold text-lg mb-2">
              Calculadora desenvolvida por Dr. Jauru Nunes de Freitas
            </p>
            <p className="text-blue-200 text-sm">
              Ferramenta exclusiva do Mapa da Estética - Use para tomar decisões mais inteligentes sobre investimentos em equipamentos
            </p>
          </div>
        </div>
        </CardContent>
        </Card>

        {/* POPUP RESUMO DO CÁLCULO */}
        <Dialog open={showCalcDialog} onOpenChange={setShowCalcDialog}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-blue-600" />
                Resumo do Cálculo
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-slate-50 p-3 rounded-lg">
                <p className="text-xs text-slate-500">Preço Líquido por Sessão</p>
                <p className="text-lg font-semibold">{formatCurrency(results.netPricePerSession)}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg">
                <p className="text-xs text-slate-500">Lucro por Sessão</p>
                <p className="text-lg font-semibold">{formatCurrency(results.grossMargin)} <span className="text-slate-500 text-xs">({results.grossMarginPercent.toFixed(1)}%)</span></p>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg">
                <p className="text-xs text-slate-500">Capacidade Mensal</p>
                <p className="text-lg font-semibold">{results.maxMonthlyCapacity.toFixed(0)} sessões</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg">
                <p className="text-xs text-slate-500">Receita Potencial Mensal</p>
                <p className="text-lg font-semibold">{formatCurrency(results.potentialMonthlyRevenue)}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg">
                <p className="text-xs text-slate-500">Lucro Líquido Mensal</p>
                <p className="text-lg font-semibold">{formatCurrency(results.monthlyProfit)}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg">
                <p className="text-xs text-slate-500">ROI Estimado</p>
                <p className="text-lg font-semibold flex items-center gap-2"><Clock className="w-4 h-4 text-blue-600" /> {results.roiMonths > 0 ? `${results.roiMonths.toFixed(1)} meses` : 'N/A'}</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCalcDialog(false)}>Fechar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* EMAIL CONFIRMATION DIALOG */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-600" />
              Confirmar Envio por Email
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-slate-600">
              O relatório completo de viabilidade será enviado para:
            </p>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="font-semibold text-blue-900">{currentUser?.full_name || 'Usuário'}</p>
              <p className="text-blue-700">{currentUser?.email}</p>
            </div>
            <p className="text-sm text-slate-500">
              O email incluirá todos os dados da análise, gráficos e recomendações.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEmailDialog(false)} disabled={isSendingEmail}>
              Cancelar
            </Button>
            <Button onClick={confirmSendEmail} disabled={isSendingEmail} className="bg-blue-600 hover:bg-blue-700">
              {isSendingEmail ? 'Enviando...' : 'Enviar Email'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}