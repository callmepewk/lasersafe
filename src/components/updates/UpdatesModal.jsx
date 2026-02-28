
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle, Zap, Printer, History, BookOpen, Sparkles } from 'lucide-react';

export const UPDATE_VERSION = "1.2.0"; // Increment this when you want to show the modal again

const updates = [
    {
        icon: Zap,
        title: "Ajuste Fino de Parâmetros com IA",
        description: "Na tela de resultados, agora você pode editar um parâmetro e a IA recalcula os outros para manter a segurança e eficácia."
    },
    {
        icon: Printer,
        title: "Impressão e Geração de PDF",
        description: "Salve ou imprima facilmente os resultados dos cálculos e os detalhes do histórico para seus registros clínicos."
    },
    {
        icon: History,
        title: "Histórico Mais Detalhado",
        description: "Consulte o resumo completo da avaliação clínica diretamente na janela de detalhes de cada cálculo no histórico."
    },
    {
        icon: BookOpen,
        title: "Guia de Referência Expandido",
        description: "Adicionamos uma seção completa sobre todos os tipos de lasers, radiofrequência e ultrassom para consulta rápida."
    },
];

export default function UpdatesModal({ open, onOpenChange }) {
    const handleDismiss = () => {
        localStorage.setItem('updatesModalSeen', UPDATE_VERSION);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh]">
                <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6">
                    <DialogTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                        <Sparkles className="w-6 h-6 text-blue-600 flex-shrink-0" />
                        Novidades do LaserCode v{UPDATE_VERSION}
                    </DialogTitle>
                    <DialogDescription className="text-sm sm:text-base">
                        Confira as últimas melhorias e funcionalidades adicionadas ao aplicativo.
                    </DialogDescription>
                </DialogHeader>
                
                <ScrollArea className="h-72 sm:h-96 px-4 sm:px-6">
                    <div className="space-y-4 sm:space-y-6 pr-4">
                        {updates.map((update, index) => (
                            <div key={index} className="flex items-start gap-4 p-3 bg-slate-50 rounded-lg">
                                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                                    <update.icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-slate-800">{update.title}</h4>
                                    <p className="text-sm text-slate-600">{update.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>

                <DialogFooter className="px-4 sm:px-6 pb-4 sm:pb-6">
                    <Button onClick={handleDismiss} className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Entendido!
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
