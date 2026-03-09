import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import PageBlockChecker from '../components/system/PageBlockChecker';
import TutorialVideoHeader from '../components/tutorial/TutorialVideoHeader';
import {
    GraduationCap,
    LayoutDashboard,
    Users,
    UserCheck,
    Calculator,
    FileClock,
    BookOpen,
    FlaskConical,
    LifeBuoy,
    Edit,
    RefreshCw,
    Save,
    SquareArrowOutUpRight, // Changed from SquareArrowDown
    Share2,
    Laptop,
    Smartphone // Added Smartphone icon
} from 'lucide-react';

const tutorialSections = [
    {
        icon: LayoutDashboard,
        title: "Dashboard",
        content: "Seu ponto de partida. Aqui você tem uma visão geral com estatísticas rápidas e atalhos para as ações mais comuns, como cadastrar pacientes ou iniciar um novo cálculo."
    },
    {
        icon: Users,
        title: "Pacientes",
        content: "Gerencie todos os seus pacientes em um só lugar. Você pode adicionar novos pacientes, pesquisar por nome ou CPF, editar informações existentes ou excluir cadastros."
    },
    {
        icon: UserCheck,
        title: "Profissionais",
        content: "Cadastre e gerencie os profissionais da sua clínica. Assim como na aba de pacientes, é possível adicionar, pesquisar, editar e remover profissionais."
    },
    {
        icon: Calculator,
        title: "Calculadora - O Coração do App",
        content: (
            <ol className="list-decimal list-inside space-y-3">
                <li>
                    <strong>Passo 1: Selecionar Paciente</strong>
                    <p className="text-sm text-slate-600 pl-4">Escolha um paciente já cadastrado na lista. A busca facilita encontrar quem você precisa.</p>
                </li>
                <li>
                    <strong>Passo 2: Selecionar Profissional</strong>
                    <p className="text-sm text-slate-600 pl-4">Selecione o profissional que está realizando o procedimento.</p>
                </li>
                <li>
                    <strong>Passo 3: Avaliação Clínica</strong>
                    <p className="text-sm text-slate-600 pl-4">Preencha todos os detalhes clínicos do paciente. Quanto mais precisa a informação, mais seguro e eficaz será o cálculo.</p>
                </li>
                <li>
                    <strong>Passo 4: Resultados e Ajuste Fino</strong>
                    <p className="text-sm text-slate-600 pl-4">Após o cálculo, você verá os parâmetros sugeridos. A partir daqui, você pode:</p>
                    <ul className="list-disc list-inside pl-8 mt-2 space-y-1">
                        <li className="flex items-start gap-2"><Edit className="w-4 h-4 mt-1 text-blue-600 flex-shrink-0" /><span>Clicar em <strong>Ajustar</strong> para editar manualmente um parâmetro (ex: diminuir a fluência).</span></li>
                        <li className="flex items-start gap-2"><RefreshCw className="w-4 h-4 mt-1 text-indigo-600 flex-shrink-0" /><span>Após o ajuste, clicar em <strong>Recalcular com IA</strong>. A IA irá sugerir novos valores para os outros campos, mantendo a segurança.</span></li>
                        <li className="flex items-start gap-2"><Save className="w-4 h-4 mt-1 text-green-600 flex-shrink-0" /><span>Finalizar clicando em <strong>Salvar Procedimento</strong> para guardar tudo no histórico.</span></li>
                    </ul>
                </li>
            </ol>
        )
    },
    {
        icon: FileClock,
        title: "Histórico",
        content: "Todos os cálculos salvos ficam aqui. Você pode pesquisar, visualizar os detalhes completos de cada procedimento, imprimir ou salvar em PDF para seus arquivos."
    },
    {
        icon: BookOpen,
        title: "Guia de Referência",
        content: "Sua biblioteca de consulta rápida. Use-a para tirar dúvidas sobre os diferentes tipos de laser, tecnologias e seus mecanismos de ação."
    },
    {
        icon: FlaskConical,
        title: "Fórmulas Neo",
        content: "Uma seção especial, em breve disponível, com um compêndio de fórmulas magistrais exclusivas da NeoFarma para complementar seus tratamentos."
    },
    {
        icon: SquareArrowOutUpRight, // Updated icon here
        title: "Acesso Rápido: Instale o App",
        content: (
            <div className="space-y-6">
                <p className="text-slate-600">Para uma experiência mais rápida e integrada, adicione o LaserCode à sua tela inicial. Ele funcionará como um aplicativo nativo!</p>

                <div>
                    <h4 className="font-semibold text-lg text-slate-800 mb-3 flex items-center gap-2">
                        <Share2 className="w-5 h-5 text-blue-600" />
                        No Celular (iPhone)
                    </h4>
                    <ol className="list-decimal list-inside space-y-2 pl-2 text-slate-700">
                        <li>Acesse o LaserCode pelo navegador <strong>Safari</strong>.</li>
                        <li>Toque no ícone de <strong>"Compartilhar"</strong> na barra inferior.</li>
                        <li>Role para baixo e selecione a opção <strong>"Adicionar à Tela de Início"</strong>.</li>
                        <li>Confirme o nome e toque em "Adicionar".</li>
                    </ol>
                </div>

                <div>
                    <h4 className="font-semibold text-lg text-slate-800 mb-3 flex items-center gap-2">
                        <Smartphone className="w-5 h-5 text-green-600" /> {/* Changed icon to Smartphone */}
                        No Celular (Android)
                    </h4>
                    <ol className="list-decimal list-inside space-y-2 pl-2 text-slate-700">
                        <li>Acesse o LaserCode pelo navegador <strong>Chrome</strong>.</li>
                        <li>Toque no menu de <strong>três pontos</strong> no canto superior direito.</li>
                        <li>Selecione <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.</li>
                        <li>Siga as instruções para confirmar.</li>
                    </ol>
                </div>

                <div>
                    <h4 className="font-semibold text-lg text-slate-800 mb-3 flex items-center gap-2">
                        <Laptop className="w-5 h-5 text-gray-700" />
                        No Computador (Chrome/Edge)
                    </h4>
                    <ol className="list-decimal list-inside space-y-2 pl-2 text-slate-700">
                        <li>Na barra de endereço, procure por um <strong>ícone de instalação</strong> (geralmente um monitor com uma seta para baixo) no lado direito.</li>
                        <li>Clique neste ícone e depois em <strong>"Instalar"</strong>.</li>
                        <li>O LaserCode será adicionado aos seus aplicativos e você poderá fixá-lo na sua barra de tarefas para acesso rápido.</li>
                    </ol>
                </div>
            </div>
        )
    },
    {
        icon: LifeBuoy,
        title: "Suporte",
        content: "Precisa de ajuda? Fale com nosso assistente virtual com IA para respostas rápidas ou nos envie um email para um contato direto com nossa equipe."
    }
];

export default function Tutorial() {
    return (
        <PageBlockChecker pageName="Tutorial">
        <div className="w-full max-w-5xl mx-auto px-4 md:px-6">
            <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
                <div className="p-2 md:p-3 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg flex-shrink-0">
                    <GraduationCap className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight truncate">Tutorial Completo</h1>
                    <p className="text-slate-600 text-sm md:text-lg truncate">Aprenda a usar todas as funcionalidades</p>
                </div>
            </div>

            <div className="mb-6 md:mb-8">
                <TutorialVideoHeader />
            </div>

            <div className="space-y-4 md:space-y-6">
                {tutorialSections.map((section, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                        <Card className="bg-white/95 backdrop-blur-sm shadow-lg border-0 hover:shadow-xl transition-shadow">
                            <CardHeader className="p-4 sm:p-6">
                                <CardTitle className="flex items-center gap-3 text-lg md:text-xl">
                                    <div className="p-2 bg-indigo-50 rounded-lg flex-shrink-0">
                                        <section.icon className="w-5 h-5 md:w-6 md:h-6 text-indigo-600" />
                                    </div>
                                    <span className="flex-1 break-words">{section.title}</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                                <div className="prose prose-sm sm:prose-base max-w-none text-slate-600">
                                    {typeof section.content === 'string' ? (
                                        <p>{section.content}</p>
                                    ) : (
                                        section.content
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </div>
        </PageBlockChecker>
    );
}