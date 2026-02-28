import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTranslation } from "@/components/i18n/TranslationContext";

export default function ProfessionalForm({ professional, onSubmit, onCancel }) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: professional?.name || "",
    cpf: professional?.cpf || "",
    phone: professional?.phone || "",
    email: professional?.email || "",
    specialty: professional?.specialty || "",
    license_number: professional?.license_number || "",
    experience_years: professional?.experience_years || "",
    clinic_name: professional?.clinic_name || "",
    notes: professional?.notes || "",
  });

  // Refs para os campos obrigatórios
  const nameRef = useRef(null);
  const cpfRef = useRef(null);
  const phoneRef = useRef(null);
  const emailRef = useRef(null);
  const submitButtonRef = useRef(null);

  useEffect(() => {
    // Auto-focus no primeiro campo ao abrir
    if (nameRef.current && !professional) {
      nameRef.current.focus();
    }
  }, [professional]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  // Função para navegar automaticamente entre campos
  const handleFieldComplete = (currentField, nextRef) => {
    if (currentField && nextRef?.current) {
      nextRef.current.focus();
      // Scroll suave até o próximo campo
      nextRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Verifica se todos os campos obrigatórios estão preenchidos
  const allRequiredFilled = formData.name && formData.cpf && formData.phone && formData.email;

  useEffect(() => {
    // Quando todos os obrigatórios estiverem preenchidos, foca no botão de submit
    if (allRequiredFilled && submitButtonRef.current) {
      submitButtonRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [allRequiredFilled]);

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full max-h-[70vh]">
      <ScrollArea className="flex-1 pr-4">
        <div className="space-y-4 pb-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">{t("professionalForm.fullName", "Nome Completo")} *</Label>
              <Input
                ref={nameRef}
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                onBlur={() => {
                  if (formData.name) handleFieldComplete('name', cpfRef);
                }}
                required
                placeholder={t("professionalForm.enterFullName", "Digite o nome completo")}
              />
            </div>
            <div>
              <Label htmlFor="cpf">CPF *</Label>
              <Input
                ref={cpfRef}
                id="cpf"
                value={formData.cpf}
                onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                onBlur={() => {
                  if (formData.cpf) handleFieldComplete('cpf', phoneRef);
                }}
                placeholder="000.000.000-00"
                required
              />
            </div>
            <div>
              <Label htmlFor="phone">{t("professionalForm.phone", "Telefone")} *</Label>
              <Input
                ref={phoneRef}
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                onBlur={() => {
                  if (formData.phone) handleFieldComplete('phone', emailRef);
                }}
                placeholder="(00) 00000-0000"
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                ref={emailRef}
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                onBlur={() => {
                  if (formData.email && allRequiredFilled && submitButtonRef.current) {
                    submitButtonRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }
                }}
                placeholder="exemplo@email.com"
                required
              />
            </div>
            <div>
              <Label htmlFor="specialty">{t("professionalForm.specialty", "Especialidade")}</Label>
              <Input
                id="specialty"
                value={formData.specialty}
                onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                placeholder={t("professionalForm.specialtyPlaceholder", "Ex: Dermatologia")}
              />
            </div>
            <div>
              <Label htmlFor="license_number">{t("professionalForm.licenseNumber", "Número do Registro")}</Label>
              <Input
                id="license_number"
                value={formData.license_number}
                onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                placeholder={t("professionalForm.licensePlaceholder", "Ex: CRM-SP 123456")}
              />
            </div>
            <div>
              <Label htmlFor="experience_years">{t("professionalForm.experienceYears", "Anos de Experiência")}</Label>
              <Input
                id="experience_years"
                type="number"
                value={formData.experience_years}
                onChange={(e) => setFormData({ ...formData, experience_years: parseInt(e.target.value) || "" })}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="clinic_name">{t("professionalForm.clinicName", "Nome da Clínica")}</Label>
              <Input
                id="clinic_name"
                value={formData.clinic_name}
                onChange={(e) => setFormData({ ...formData, clinic_name: e.target.value })}
                placeholder={t("professionalForm.clinicPlaceholder", "Nome da instituição")}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">{t("professionalForm.observations", "Observações")}</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder={t("professionalForm.observationsPlaceholder", "Informações adicionais sobre o profissional...")}
              className="h-20"
            />
          </div>
        </div>
      </ScrollArea>

      <div className="flex justify-end gap-3 pt-4 border-t mt-4 bg-white">
        <Button type="button" variant="outline" onClick={onCancel}>
          {t("common.cancel", "Cancelar")}
        </Button>
        <Button 
          ref={submitButtonRef}
          type="submit" 
          className="bg-green-600 hover:bg-green-700"
          disabled={!allRequiredFilled}
        >
          {professional ? t("professionalForm.update", "Atualizar") : t("professionalForm.register", "Cadastrar")} {t("professionalForm.professional", "Profissional")}
        </Button>
      </div>
    </form>
  );
}