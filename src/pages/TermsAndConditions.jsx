import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Gavel, ShieldCheck, AlertTriangle } from 'lucide-react';

export default function TermsAndConditions() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 md:px-6">
      <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
        <div className="p-2 md:p-3 bg-gradient-to-br from-slate-500 to-slate-600 rounded-xl shadow-lg flex-shrink-0">
          <FileText className="w-5 h-5 md:w-6 md:h-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Termos e Condições de Uso</h1>
          <p className="text-slate-600 text-xs sm:text-sm md:text-lg mt-1">Última atualização: 28 de Julho de 2024</p>
        </div>
      </div>

      <div className="space-y-4 md:space-y-6">
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg"><Gavel className="w-5 h-5 flex-shrink-0" />1. Aceitação dos Termos</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm sm:prose-base max-w-none p-4 sm:p-6">
            <p>Ao acessar e utilizar o aplicativo LaserSafe ("Aplicativo"), você ("Usuário") concorda em cumprir e estar vinculado a estes Termos e Condições de Uso ("Termos"). Se você não concordar com estes Termos, não deverá utilizar o Aplicativo.</p>
          </CardContent>
        </Card>

        <Card className="border-amber-300 bg-amber-50">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-amber-900 text-base sm:text-lg"><AlertTriangle className="w-5 h-5 flex-shrink-0" />2. Objeto do Aplicativo e Responsabilidade Profissional</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm sm:prose-base max-w-none p-4 sm:p-6">
            <p>O LaserSafe é uma ferramenta de software designada a servir como um <strong>assistente de cálculo</strong> para parâmetros em procedimentos a laser dermatológicos, utilizando algoritmos e inteligência artificial.</p>
            <p><strong>Fica expressamente claro que o Aplicativo não é profissionalizante, não capacita, não certifica e não habilita qualquer indivíduo a realizar procedimentos.</strong> Ele é uma ferramenta de apoio destinada a profissionais de saúde já qualificados e licenciados.</p>
            <p>A responsabilidade final pela definição dos parâmetros, pela realização do procedimento e por qualquer resultado clínico é <strong>inteira e exclusivamente do profissional de saúde</strong>. O julgamento clínico, a avaliação presencial do paciente e a experiência profissional são soberanos e nunca devem ser substituídos pelas sugestões do Aplicativo.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg"><ShieldCheck className="w-5 h-5 flex-shrink-0" />3. Coleta e Uso de Dados (Conformidade com a LGPD)</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm sm:prose-base max-w-none p-4 sm:p-6">
            <p>Este Aplicativo está em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 - LGPD).</p>
            <ul>
              <li><strong>Dados Coletados:</strong> Coletamos dados fornecidos durante o cadastro (nome, e-mail) e dados inseridos durante o uso do aplicativo (dados de pacientes, profissionais e cálculos).</li>
              <li><strong>Finalidade:</strong> Os dados são utilizados exclusivamente para o funcionamento do Aplicativo, incluindo a personalização da experiência, o armazenamento do histórico de cálculos e a melhoria contínua de nossos algoritmos.</li>
              <li><strong>Dados Sensíveis:</strong> Ao inserir dados de pacientes, o Usuário é o controlador desses dados e é responsável por obter o consentimento necessário. O Aplicativo atua como operador, processando os dados conforme as instruções do Usuário.</li>
            </ul>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">4. Direitos do Titular dos Dados (LGPD)</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm sm:prose-base max-w-none p-4 sm:p-6">
            <p>Como titular dos seus dados pessoais, você tem o direito de solicitar a qualquer momento:</p>
            <ul>
              <li>A confirmação da existência de tratamento;</li>
              <li>O acesso aos seus dados;</li>
              <li>A correção de dados incompletos, inexatos ou desatualizados;</li>
              <li>A anonimização, bloqueio ou eliminação de dados desnecessários ou excessivos;</li>
              <li>A portabilidade dos seus dados a outro fornecedor de serviço ou produto;</li>
              <li>A eliminação dos dados tratados com o seu consentimento.</li>
            </ul>
            <p>Para exercer seus direitos, entre em contato através da nossa página de Suporte.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">5. Segurança e Compartilhamento de Dados</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm sm:prose-base max-w-none p-4 sm:p-6">
            <p>Implementamos medidas de segurança técnicas e organizacionais para proteger seus dados. Não compartilhamos suas informações pessoais com terceiros para fins de marketing. O compartilhamento pode ocorrer apenas com provedores de serviços essenciais (ex: infraestrutura em nuvem) que estão contratualmente obrigados a manter a confidencialidade e segurança dos dados.</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">6. Modificações nos Termos</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm sm:prose-base max-w-none p-4 sm:p-6">
            <p>Reservamo-nos o direito de modificar estes Termos a qualquer momento. Notificaremos os usuários sobre alterações significativas através do Aplicativo ou por e-mail.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}