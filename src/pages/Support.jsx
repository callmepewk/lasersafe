import React, { useState } from "react";
import { User } from "@/entities/User";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MessageSquare, Send, Bot, FileText, Mail, Shield } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import PageBlockChecker from "../components/system/PageBlockChecker";

const faqQuestions = [
  "Como faço para calcular parâmetros de laser?",
  "Quais são os planos disponíveis?",
  "Como atualizar meu cadastro?",
  "Como adicionar um novo paciente?",
  "Como funciona o limite de cálculos?",
];

export default function Support() {
  const [currentUser, setCurrentUser] = useState(null);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { role: "assistant", content: "Olá! Sou o assistente virtual do LaserCode. Como posso ajudá-lo hoje?" }
  ]);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const officialNoticeSentAt = "27/05/2026 00:00 (America/Sao_Paulo)";
  const officialNoticeSubject = "Notificação formal";
  const officialNoticeMessage = `Prezados,

Por meio desta comunicação, informamos formalmente a descontinuação dos serviços tecnológicos relacionados aos sistemas, aplicações e integrações atualmente disponibilizados.

A presente notificação refere-se aos softwares e soluções desenvolvidos sob minha autoria intelectual e responsabilidade técnica, incluindo suas respectivas funcionalidades, integrações e operações associadas.

Esclarece-se que tais sistemas foram concebidos, estruturados e mantidos sob minha titularidade técnica, no que se refere ao desenvolvimento, arquitetura e operação.

A decisão de descontinuação decorre de fatores técnicos, operacionais e estratégicos, envolvendo a reorganização estrutural dos serviços.

Dessa forma, estabelecemos o prazo de 7 dias a partir do recebimento desta notificação para a continuidade temporária dos serviços. Após esse período, poderá ocorrer a desativação integral dos sistemas, incluindo acessos, funcionalidades, integrações e quaisquer serviços relacionados.

Durante o prazo informado, permanece a possibilidade de alinhamento para eventual transição técnica organizada, mediante solicitação prévia.

Recomendamos que as medidas necessárias sejam adotadas dentro do prazo estabelecido, a fim de evitar interrupções inesperadas.

Sem mais para o momento.

Atenciosamente,
Pedro Henrique Brezolin de Freitas`;

  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await User.me();
        setCurrentUser(user);
        setEmailSubject(officialNoticeSubject);
        setEmailMessage(`Data e hora do envio: ${officialNoticeSentAt}

${officialNoticeMessage}`);
      } catch (error) {
        console.error("Erro ao carregar usuário:", error);
      }
    };
    fetchUser();
  }, []);

  const handleSendEmail = async (e) => {
    e.preventDefault();
    if (!emailSubject || !emailMessage) {
      alert("Por favor, preencha o assunto e a mensagem.");
      return;
    }

    setIsSending(true);
    try {
      await base44.integrations.Core.SendEmail({
        from_name: currentUser?.full_name || "Usuário LaserCode",
        to: "suporte@lasercode.app",
        subject: `[Suporte LaserCode] ${emailSubject}`,
        body: `
Usuário: ${currentUser?.full_name || "Não identificado"}
Email: ${currentUser?.email || "Não informado"}

Mensagem:
${emailMessage}
        `,
      });

      alert("Mensagem enviada com sucesso! Nossa equipe entrará em contato em breve.");
      setEmailSubject("");
      setEmailMessage("");
    } catch (error) {
      console.error("Erro ao enviar email:", error);
      alert("Erro ao enviar mensagem. Tente novamente.");
    }
    setIsSending(false);
  };

  const handleAskQuestion = async (question) => {
    setCurrentQuestion("");
    setChatMessages(prev => [...prev, { role: "user", content: question }]);
    setIsLoading(true);

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Você é um assistente de suporte especializado no LaserCode, um aplicativo para cálculo de parâmetros de laser dermatológico.

Contexto do LaserCode:
- Sistema para calcular parâmetros seguros de laser (fluência, duração de pulso, spot size, frequência)
- Usado por dermatologistas e profissionais de estética
- Possui planos: Essencial (20 cálculos/mês), Pro (100 cálculos/mês), Master (ilimitado)
- Funcionalidades: cadastro de pacientes, profissionais, histórico, fórmulas magistrais, guia de referência

Pergunta do usuário: ${question}

Forneça uma resposta útil, clara e profissional. Se a pergunta não for relacionada ao LaserCode, redirecione educadamente para o escopo do app.`,
      });

      setChatMessages(prev => [...prev, { role: "assistant", content: response }]);
    } catch (error) {
      console.error("Erro ao consultar IA:", error);
      setChatMessages(prev => [
        ...prev,
        { role: "assistant", content: "Desculpe, ocorreu um erro ao processar sua pergunta. Por favor, tente novamente." }
      ]);
    }
    setIsLoading(false);
  };

  return (
    <PageBlockChecker pageName="Support">
    <div className="w-full max-w-7xl mx-auto">
      <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
        <div className="p-2 md:p-3 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg">
          <MessageSquare className="w-5 h-5 md:w-6 md:h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Central de Suporte</h1>
          <p className="text-slate-600 text-sm md:text-lg">Estamos aqui para ajudar você</p>
        </div>
      </div>

      <Tabs defaultValue="chatbot" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="chatbot" className="flex items-center gap-2">
            <Bot className="w-4 h-4" />
            Chatbot IA
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Contato Direto
          </TabsTrigger>
          <TabsTrigger value="terms" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Termos
          </TabsTrigger>
        </TabsList>

        {/* CHATBOT IA */}
        <TabsContent value="chatbot">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Chat Area */}
            <Card className="lg:col-span-2 bg-white/90 backdrop-blur-sm shadow-lg border-0">
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Bot className="w-6 h-6 text-indigo-600" />
                  Assistente Virtual
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 flex flex-col h-[600px]">
                <ScrollArea className="flex-1 p-4 space-y-4">
                  {chatMessages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} mb-4`}
                    >
                      <div
                        className={`max-w-[80%] p-4 rounded-lg ${
                          msg.role === "user"
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-100 text-slate-900"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start mb-4">
                      <div className="bg-slate-100 p-4 rounded-lg">
                        <p className="text-sm text-slate-600">Digitando...</p>
                      </div>
                    </div>
                  )}
                </ScrollArea>

                <div className="p-4 border-t">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (currentQuestion.trim()) {
                        handleAskQuestion(currentQuestion);
                      }
                    }}
                    className="flex gap-2"
                  >
                    <Input
                      placeholder="Digite sua pergunta..."
                      value={currentQuestion}
                      onChange={(e) => setCurrentQuestion(e.target.value)}
                      disabled={isLoading}
                      className="flex-1"
                    />
                    <Button
                      type="submit"
                      disabled={isLoading || !currentQuestion.trim()}
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>

            {/* FAQ Rápido */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-lg">Perguntas Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {faqQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full text-left justify-start h-auto py-3 px-4"
                    onClick={() => handleAskQuestion(question)}
                  >
                    <span className="text-sm">{question}</span>
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* CONTATO DIRETO */}
        <TabsContent value="email">
          <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0 max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Mail className="w-6 h-6 text-indigo-600" />
                Envie uma Mensagem Direta
              </CardTitle>
              <p className="text-sm text-slate-600 mt-2">
                A mensagem abaixo foi preparada para envio formal por email com registro de data e hora.
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSendEmail} className="space-y-6">
                <div>
                  <Label htmlFor="email-subject">Assunto *</Label>
                  <Input
                    id="email-subject"
                    placeholder="Ex: Dúvida sobre cálculo de parâmetros"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    required
                    readOnly
                  />
                </div>
                <div>
                  <Label htmlFor="email-message">Mensagem *</Label>
                  <Textarea
                    id="email-message"
                    placeholder="Descreva sua dúvida ou problema..."
                    value={emailMessage}
                    onChange={(e) => setEmailMessage(e.target.value)}
                    required
                    readOnly
                    className="h-72"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isSending}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 h-12"
                >
                  {isSending ? (
                    "Enviando..."
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Enviar Mensagem
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TERMOS E CONDIÇÕES */}
        <TabsContent value="terms">
          <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-100 rounded-lg">
                  <Shield className="w-6 h-6 text-slate-700" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Termos e Condições de Uso</CardTitle>
                  <p className="text-sm text-slate-600 mt-1">Última atualização: Janeiro de 2025</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none">
              <h3>1. Aceitação dos Termos</h3>
              <p>
                Ao utilizar o LaserCode, você concorda com estes termos e condições. 
                Se você não concorda com algum item, não utilize o aplicativo.
              </p>

              <h3>2. Objetivo do Aplicativo</h3>
              <p>
                O LaserCode é uma ferramenta de <strong>apoio à decisão clínica</strong> para 
                profissionais de saúde habilitados. Os cálculos fornecidos são baseados em 
                parâmetros técnicos e literatura científica, mas <strong>não substituem</strong> 
                o julgamento clínico profissional.
              </p>

              <h3>3. Responsabilidade Profissional</h3>
              <p>
                O uso do LaserCode é de <strong>responsabilidade exclusiva do profissional</strong>. 
                Cabe ao médico ou profissional habilitado:
              </p>
              <ul>
                <li>Validar os parâmetros sugeridos</li>
                <li>Ajustar conforme necessário para cada caso específico</li>
                <li>Observar contraindicações e precauções</li>
                <li>Seguir protocolos de segurança estabelecidos</li>
              </ul>

              <h3>4. Coleta e Uso de Dados (LGPD)</h3>
              <p>
                Coletamos e armazenamos dados pessoais apenas para operação do serviço:
              </p>
              <ul>
                <li><strong>Dados cadastrais:</strong> nome, email, telefone</li>
                <li><strong>Dados de uso:</strong> cálculos realizados, histórico de acesso</li>
                <li><strong>Dados de pacientes:</strong> informações clínicas necessárias para os cálculos</li>
              </ul>
              <p>
                <strong>Seus dados NÃO são compartilhados com terceiros</strong> para fins comerciais.
              </p>

              <h3>5. Direitos do Titular dos Dados</h3>
              <p>Conforme a LGPD, você tem direito a:</p>
              <ul>
                <li>Acessar seus dados pessoais</li>
                <li>Corrigir dados incompletos ou desatualizados</li>
                <li>Solicitar exclusão dos dados</li>
                <li>Revogar consentimento</li>
                <li>Portabilidade dos dados</li>
              </ul>

              <h3>6. Segurança dos Dados</h3>
              <p>
                Utilizamos medidas de segurança técnicas e administrativas para proteger 
                seus dados contra acesso não autorizado, perda ou vazamento.
              </p>

              <h3>7. Modificações nos Termos</h3>
              <p>
                Podemos atualizar estes termos periodicamente. Alterações significativas 
                serão comunicadas por email ou notificação no app.
              </p>

              <h3>8. Contato</h3>
              <p>
                Para dúvidas sobre privacidade ou termos de uso, entre em contato através 
                da nossa <strong>Central de Suporte</strong>.
              </p>

              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 mt-8">
                <p className="text-sm text-blue-900 font-semibold mb-2">
                  ⚖️ Isenção de Responsabilidade Legal
                </p>
                <p className="text-sm text-blue-800">
                  O LaserCode é fornecido "como está". Não nos responsabilizamos por 
                  quaisquer danos diretos ou indiretos resultantes do uso do aplicativo. 
                  O profissional de saúde é o único responsável pelas decisões clínicas 
                  e pelos tratamentos realizados.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
    </PageBlockChecker>
  );
}