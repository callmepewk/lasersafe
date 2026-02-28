import React from "react";
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function PrescriptionViewer({ prescription, patient, professional }) {
  const generatePDF = () => {
    const content = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Receita Médica</title>
        <style>
          @page { margin: 2cm; }
          body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6;
            color: #333;
          }
          .header {
            border-bottom: 2px solid #0ea5e9;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .professional-info {
            margin-bottom: 20px;
          }
          .professional-name {
            font-size: 20px;
            font-weight: bold;
            color: #0f172a;
          }
          .professional-details {
            font-size: 14px;
            color: #64748b;
          }
          .patient-info {
            background-color: #f1f5f9;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 30px;
          }
          .section-title {
            font-size: 16px;
            font-weight: bold;
            color: #0ea5e9;
            margin-top: 30px;
            margin-bottom: 15px;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 5px;
          }
          .prescription-item {
            background-color: #f8fafc;
            padding: 15px;
            margin-bottom: 15px;
            border-left: 3px solid #0ea5e9;
            border-radius: 4px;
          }
          .item-name {
            font-size: 16px;
            font-weight: bold;
            color: #0f172a;
            margin-bottom: 5px;
          }
          .item-details {
            font-size: 14px;
            color: #475569;
            margin: 5px 0;
          }
          .instructions {
            margin-top: 10px;
            padding: 10px;
            background-color: #fff;
            border-radius: 4px;
            font-style: italic;
          }
          .signature-section {
            margin-top: 50px;
            text-align: center;
          }
          .signature-image {
            max-width: 300px;
            margin: 20px auto;
          }
          .date-location {
            margin-top: 50px;
            text-align: right;
            font-size: 14px;
            color: #64748b;
          }
          .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            text-align: center;
            font-size: 12px;
            color: #94a3b8;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="professional-info">
            <div class="professional-name">${professional?.name || 'N/A'}</div>
            <div class="professional-details">
              ${professional?.specialty || ''} | ${professional?.license_number || 'N/A'}<br>
              ${professional?.clinic_name || ''}<br>
              Telefone: ${professional?.phone || ''} | Email: ${professional?.email || ''}
            </div>
          </div>
        </div>

        <div class="patient-info">
          <strong>Paciente:</strong> ${patient?.name || prescription?.patient_name || 'N/A'}<br>
          <strong>CPF:</strong> ${patient?.cpf || 'N/A'}<br>
          <strong>Data de Nascimento:</strong> ${patient?.birth_date ? format(new Date(patient.birth_date), 'dd/MM/yyyy', { locale: ptBR }) : 'N/A'}<br>
          <strong>Telefone:</strong> ${patient?.phone || 'N/A'}
        </div>

        ${prescription.diagnosis ? `
          <div class="section-title">Diagnóstico/Indicação</div>
          <p>${prescription.diagnosis}</p>
        ` : ''}

        <div class="section-title">Prescrição</div>
        
        ${prescription.items?.map((item, index) => `
          <div class="prescription-item">
            <div class="item-name">${index + 1}. ${item.name || 'N/A'}</div>
            ${item.active_ingredient ? `<div class="item-details"><strong>Princípio Ativo:</strong> ${item.active_ingredient}</div>` : ''}
            ${item.dosage ? `<div class="item-details"><strong>Dosagem:</strong> ${item.dosage}</div>` : ''}
            ${item.quantity ? `<div class="item-details"><strong>Quantidade:</strong> ${item.quantity}</div>` : ''}
            ${item.instructions ? `<div class="instructions"><strong>Modo de usar:</strong> ${item.instructions}</div>` : ''}
          </div>
        `).join('') || '<p>Nenhum item prescrito</p>'}

        ${prescription.observations ? `
          <div class="section-title">Observações</div>
          <p>${prescription.observations}</p>
        ` : ''}

        <div class="date-location">
          ${format(new Date(prescription.prescription_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
        </div>

        <div class="signature-section">
          ${prescription.signature_data ? `
            <img src="${prescription.signature_data}" class="signature-image" alt="Assinatura" />
          ` : '<div style="height: 80px; border-bottom: 1px solid #000; width: 300px; margin: 40px auto;"></div>'}
          <div style="margin-top: 10px;">
            <strong>${professional?.name || ''}</strong><br>
            ${professional?.license_number || ''}
          </div>
        </div>

        <div class="footer">
          Este documento foi gerado eletronicamente pelo sistema LaserSafe<br>
          Data de emissão: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  return (
    <div className="space-y-6">
      {/* Preview da Receita */}
      <div className="border-2 border-slate-200 rounded-lg p-6 bg-white">
        {/* Cabeçalho Profissional */}
        <div className="border-b-2 border-blue-500 pb-4 mb-6">
          <h2 className="text-2xl font-bold text-slate-900">{professional?.name || 'N/A'}</h2>
          <p className="text-slate-600">
            {professional?.specialty} | {professional?.license_number}
          </p>
          {professional?.clinic_name && (
            <p className="text-slate-600">{professional.clinic_name}</p>
          )}
          <p className="text-sm text-slate-500">
            Tel: {professional?.phone} | Email: {professional?.email}
          </p>
        </div>

        {/* Dados do Paciente */}
        <div className="bg-slate-50 p-4 rounded-lg mb-6">
          <h3 className="font-semibold text-slate-900 mb-2">Dados do Paciente</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div><strong>Nome:</strong> {patient?.name || prescription?.patient_name || 'N/A'}</div>
            <div><strong>CPF:</strong> {patient?.cpf || 'N/A'}</div>
            <div><strong>Data Nasc:</strong> {patient?.birth_date ? format(new Date(patient.birth_date), 'dd/MM/yyyy') : 'N/A'}</div>
            <div><strong>Telefone:</strong> {patient?.phone || 'N/A'}</div>
          </div>
        </div>

        {/* Diagnóstico */}
        {prescription.diagnosis && (
          <div className="mb-6">
            <h3 className="font-semibold text-blue-600 mb-2">Diagnóstico/Indicação</h3>
            <p className="text-slate-700">{prescription.diagnosis}</p>
          </div>
        )}

        {/* Itens Prescritos */}
        <div className="mb-6">
          <h3 className="font-semibold text-blue-600 mb-3">Prescrição</h3>
          <div className="space-y-4">
            {prescription.items?.map((item, index) => (
              <div key={index} className="bg-slate-50 p-4 rounded-lg border-l-4 border-blue-500">
                <div className="font-semibold text-slate-900 mb-2">
                  {index + 1}. {item.name}
                </div>
                {item.active_ingredient && (
                  <div className="text-sm text-slate-700">
                    <strong>Princípio Ativo:</strong> {item.active_ingredient}
                  </div>
                )}
                {item.dosage && (
                  <div className="text-sm text-slate-700">
                    <strong>Dosagem:</strong> {item.dosage}
                  </div>
                )}
                {item.quantity && (
                  <div className="text-sm text-slate-700">
                    <strong>Quantidade:</strong> {item.quantity}
                  </div>
                )}
                {item.instructions && (
                  <div className="mt-2 p-2 bg-white rounded text-sm italic text-slate-600">
                    <strong>Modo de usar:</strong> {item.instructions}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Observações */}
        {prescription.observations && (
          <div className="mb-6">
            <h3 className="font-semibold text-blue-600 mb-2">Observações</h3>
            <p className="text-slate-700">{prescription.observations}</p>
          </div>
        )}

        {/* Data e Assinatura */}
        <div className="mt-8 pt-6 border-t border-slate-200">
          <div className="text-right mb-8 text-slate-600">
            {format(new Date(prescription.prescription_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </div>

          <div className="text-center">
            {prescription.signature_data ? (
              <img 
                src={prescription.signature_data} 
                alt="Assinatura" 
                className="max-w-xs mx-auto mb-4"
              />
            ) : (
              <div className="h-20 border-b-2 border-slate-300 w-80 mx-auto mb-4"></div>
            )}
            <div className="font-semibold text-slate-900">{professional?.name}</div>
            <div className="text-sm text-slate-600">{professional?.license_number}</div>
          </div>
        </div>
      </div>

      {/* Botões de Ação */}
      <div className="flex gap-3 justify-end">
        <Button variant="outline" onClick={generatePDF}>
          <Printer className="w-4 h-4 mr-2" />
          Imprimir
        </Button>
        <Button onClick={generatePDF} className="bg-emerald-600 hover:bg-emerald-700">
          <Download className="w-4 h-4 mr-2" />
          Baixar PDF
        </Button>
      </div>
    </div>
  );
}