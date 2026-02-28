import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTranslation } from "@/components/i18n/TranslationContext";

export default function PatientForm({ patient, onSubmit, onCancel }) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: patient?.name || "",
    cpf: patient?.cpf || "",
    phone: patient?.phone || "",
    has_no_phone: patient?.has_no_phone || false,
    email: patient?.email || "",
    has_no_email: patient?.has_no_email || false,
    birth_date: patient?.birth_date || "",
    gender: patient?.gender || "",
    phototype: patient?.phototype || "",
    skin_tone: patient?.skin_tone || "",
    ethnic_identity: patient?.ethnic_identity || "",
    skin_sensitivity: patient?.skin_sensitivity || "",
    glogau_scale: patient?.glogau_scale || "",
    acne_scar_classification: patient?.acne_scar_classification || "",
    leeds_acne_scale: patient?.leeds_acne_scale || "",
    medical_history: patient?.medical_history || "",
    medications: patient?.medications || "",
    allergies: patient?.allergies || "",
  });

  // Refs para os campos
  const nameRef = useRef(null);
  const cpfRef = useRef(null);
  const phoneRef = useRef(null);
  const emailRef = useRef(null);
  const submitButtonRef = useRef(null);

  useEffect(() => {
    // Auto-focus no primeiro campo ao abrir
    if (nameRef.current && !patient) {
      nameRef.current.focus();
    }
  }, [patient]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  // Função para navegar automaticamente entre campos obrigatórios
  const handleFieldComplete = (currentField, nextRef) => {
    if (currentField && nextRef?.current) {
      nextRef.current.focus();
      // Scroll suave até o próximo campo
      nextRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Verifica se todos os campos obrigatórios estão preenchidos
  const allRequiredFilled = formData.name && formData.cpf && (formData.phone || formData.has_no_phone);

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
              <Label htmlFor="name">{t("patientForm.fullName", "Nome Completo")} *</Label>
              <Input
                ref={nameRef}
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                onBlur={() => {
                  if (formData.name) handleFieldComplete('name', cpfRef);
                }}
                required
                placeholder={t("patientForm.enterFullName", "Digite o nome completo")}
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
              <Label htmlFor="phone">{t("patientForm.phone", "Telefone")} {!formData.has_no_phone && "*"}</Label>
              <Input
                ref={phoneRef}
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                onBlur={() => {
                  if (formData.phone && formData.name && formData.cpf) {
                    if (submitButtonRef.current) {
                      submitButtonRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                  } else if (formData.phone) {
                    handleFieldComplete('phone', emailRef);
                  }
                }}
                placeholder="(00) 00000-0000"
                disabled={formData.has_no_phone}
                required={!formData.has_no_phone}
              />
              <label className="flex items-center gap-2 mt-1 text-sm text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.has_no_phone}
                  onChange={(e) => setFormData({ ...formData, has_no_phone: e.target.checked, phone: e.target.checked ? "" : formData.phone })}
                  className="rounded"
                />
                {t("patientForm.noPhone", "Paciente sem telefone")}
              </label>
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                ref={emailRef}
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="exemplo@email.com"
                disabled={formData.has_no_email}
              />
              <label className="flex items-center gap-2 mt-1 text-sm text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.has_no_email}
                  onChange={(e) => setFormData({ ...formData, has_no_email: e.target.checked, email: e.target.checked ? "" : formData.email })}
                  className="rounded"
                />
                {t("patientForm.noEmail", "Paciente sem email")}
              </label>
            </div>
            <div>
              <Label htmlFor="birth_date">Data de Nascimento</Label>
              <Input
                id="birth_date"
                type="date"
                value={formData.birth_date}
                onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="gender">{t("patientForm.gender", "Gênero")}</Label>
              <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                <SelectTrigger>
                  <SelectValue placeholder={t("patientForm.select", "Selecione")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="masculino">{t("patientForm.male", "Masculino")}</SelectItem>
                  <SelectItem value="feminino">{t("patientForm.female", "Feminino")}</SelectItem>
                  <SelectItem value="outro">{t("patientForm.other", "Outro")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="phototype">{t("patientForm.phototype", "Fototipo de Fitzpatrick")}</Label>
              <Select value={formData.phototype} onValueChange={(value) => setFormData({ ...formData, phototype: value })}>
                <SelectTrigger>
                  <SelectValue placeholder={t("patientForm.selectPhototype", "Selecione o fototipo")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="I">I - Sempre queima, nunca bronzeia</SelectItem>
                  <SelectItem value="II">II - Sempre queima, bronzeia minimamente</SelectItem>
                  <SelectItem value="III">III - Às vezes queima, bronzeia gradualmente</SelectItem>
                  <SelectItem value="IV">IV - Queima minimamente, bronzeia bem</SelectItem>
                  <SelectItem value="V">V - Raramente queima, bronzeia profundamente</SelectItem>
                  <SelectItem value="VI">VI - Nunca queima, pigmentação escura</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="skin_tone">{t("patientForm.skinTone", "Tonalidade da Pele")}</Label>
              <Select value={formData.skin_tone} onValueChange={(value) => setFormData({ ...formData, skin_tone: value })}>
                <SelectTrigger>
                  <SelectValue placeholder={t("patientForm.selectSkinTone", "Selecione a tonalidade")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="muito_clara">Muito Clara (Porcelana)</SelectItem>
                  <SelectItem value="clara">Clara</SelectItem>
                  <SelectItem value="clara_media">Clara Média</SelectItem>
                  <SelectItem value="media">Média</SelectItem>
                  <SelectItem value="morena_clara">Morena Clara</SelectItem>
                  <SelectItem value="morena">Morena</SelectItem>
                  <SelectItem value="morena_escura">Morena Escura</SelectItem>
                  <SelectItem value="negra_clara">Negra Clara</SelectItem>
                  <SelectItem value="negra">Negra</SelectItem>
                  <SelectItem value="negra_escura">Negra Escura</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="ethnic_identity">{t("patientForm.ethnicIdentity", "Identificação Étnica")} (opcional)</Label>
              <Select value={formData.ethnic_identity} onValueChange={(value) => setFormData({ ...formData, ethnic_identity: value })}>
                <SelectTrigger>
                  <SelectValue placeholder={t("patientForm.selectEthnicity", "Selecione (opcional)")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="branco">Branco</SelectItem>
                  <SelectItem value="preto">Preto</SelectItem>
                  <SelectItem value="pardo">Pardo</SelectItem>
                  <SelectItem value="amarelo">Amarelo</SelectItem>
                  <SelectItem value="indigena_tupi">Indígena - Tupi</SelectItem>
                  <SelectItem value="indigena_guarani">Indígena - Guarani</SelectItem>
                  <SelectItem value="indigena_yanomami">Indígena - Yanomami</SelectItem>
                  <SelectItem value="indigena_outros">Indígena - Outros</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="skin_sensitivity">{t("patientForm.skinSensitivity", "Sensibilidade da Pele")}</Label>
              <Select value={formData.skin_sensitivity} onValueChange={(value) => setFormData({ ...formData, skin_sensitivity: value })}>
                <SelectTrigger>
                  <SelectValue placeholder={t("patientForm.selectSensitivity", "Selecione a sensibilidade")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="muito_sensível">Muito Sensível</SelectItem>
                  <SelectItem value="sensível">Sensível</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="resistente">Resistente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Classificações Dermatológicas */}
          <div className="border-t pt-4 mt-4">
            <h4 className="font-semibold text-slate-800 mb-3">{t("patientForm.dermatologicalClassifications", "Classificações Dermatológicas")} (opcional)</h4>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="glogau_scale">{t("patientForm.glogauScale", "Escala de Glogau")}</Label>
                <Select value={formData.glogau_scale} onValueChange={(value) => setFormData({ ...formData, glogau_scale: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="I">I - 20-30 anos</SelectItem>
                    <SelectItem value="II">II - 30-40 anos</SelectItem>
                    <SelectItem value="III">III - 40-60 anos</SelectItem>
                    <SelectItem value="IV">IV - 60+ anos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="acne_scar_classification">{t("patientForm.acneScars", "Cicatrizes de Acne")}</Label>
                <Select value={formData.acne_scar_classification} onValueChange={(value) => setFormData({ ...formData, acne_scar_classification: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="leve">Leve</SelectItem>
                    <SelectItem value="moderada">Moderada</SelectItem>
                    <SelectItem value="severa">Severa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="leeds_acne_scale">{t("patientForm.leedsAcneScale", "Escala de Acne (Leeds)")}</Label>
                <Select value={formData.leeds_acne_scale} onValueChange={(value) => setFormData({ ...formData, leeds_acne_scale: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0 - Normal</SelectItem>
                    <SelectItem value="1-2">1-2 - Leve</SelectItem>
                    <SelectItem value="3-4">3-4 - Moderada</SelectItem>
                    <SelectItem value="5-6">5-6 - Severa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="medical_history">{t("patientForm.medicalHistory", "Histórico Médico")}</Label>
            <Textarea
              id="medical_history"
              value={formData.medical_history}
              onChange={(e) => setFormData({ ...formData, medical_history: e.target.value })}
              placeholder={t("patientForm.medicalHistoryPlaceholder", "Doenças, cirurgias, tratamentos anteriores...")}
              className="h-20"
            />
          </div>

          <div>
            <Label htmlFor="medications">{t("patientForm.medications", "Medicações em Uso")}</Label>
            <Textarea
              id="medications"
              value={formData.medications}
              onChange={(e) => setFormData({ ...formData, medications: e.target.value })}
              placeholder={t("patientForm.medicationsPlaceholder", "Liste todas as medicações atuais...")}
              className="h-20"
            />
          </div>

          <div>
            <Label htmlFor="allergies">{t("patientForm.allergies", "Alergias Conhecidas")}</Label>
            <Textarea
              id="allergies"
              value={formData.allergies}
              onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
              placeholder={t("patientForm.allergiesPlaceholder", "Medicamentos, alimentos, substâncias...")}
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
          className="bg-blue-600 hover:bg-blue-700"
          disabled={!allRequiredFilled}
        >
          {patient ? t("patientForm.update", "Atualizar") : t("patientForm.register", "Cadastrar")} {t("patientForm.patient", "Paciente")}
        </Button>
      </div>
    </form>
  );
}