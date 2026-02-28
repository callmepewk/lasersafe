import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader, CheckCircle, Gavel, ShieldCheck, AlertTriangle } from 'lucide-react';

export default function TermsModal({ open, onAccept, loading }) {
    return (
        <Dialog open={open}>
            <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh]" onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
                <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6">
                    <DialogTitle className="text-xl sm:text-2xl font-bold">Termos e Condições de Uso</DialogTitle>
                    <DialogDescription className="text-sm sm:text-base">
                        Para continuar, por favor, leia e aceite nossos termos de serviço.
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="h-72 sm:h-96 px-4 sm:px-6">
                    <div className="space-y-4 sm:space-y-6 text-xs sm:text-sm pr-4">
                        <div className="space-y-2">
                            <h3 className="font-semibold flex items-center gap-2 text-sm sm:text-base"><Gavel size={16} className="flex-shrink-0" />1. Aceitação dos Termos</h3>
                            <p className="leading-relaxed">Ao acessar e utilizar o aplicativo LaserCode ("Aplicativo"), você ("Usuário") concorda em cumprir e estar vinculado a estes Termos e Condições de Uso ("Termos").</p>
                        </div>

                        <div className="space-y-2 p-3 bg-amber-50 border border-amber-200 rounded-md">
                            <h3 className="font-semibold flex items-center gap-2 text-amber-900 text-sm sm:text-base"><AlertTriangle size={16} className="flex-shrink-0" />2. Objeto do Aplicativo e Responsabilidade Profissional</h3>
                            <p className="leading-relaxed">O LaserCode é uma ferramenta de software designada a servir como um <strong>assistente de cálculo</strong> para parâmetros em procedimentos a laser dermatológicos.</p>
                            <p className="leading-relaxed"><strong>Fica expressamente claro que o Aplicativo não é profissionalizante, não capacita, não certifica e não habilita qualquer indivíduo a realizar procedimentos.</strong> Ele é uma ferramenta de apoio destinada a profissionais de saúde já qualificados e licenciados.</p>
                            <p className="leading-relaxed">A responsabilidade final pela definição dos parâmetros, pela realização do procedimento e por qualquer resultado clínico é <strong>inteira e exclusivamente do profissional de saúde</strong>. O julgamento clínico é soberano e nunca deve ser substituído pelas sugestões do Aplicativo.</p>
                        </div>

                        <div className="space-y-2">
                            <h3 className="font-semibold flex items-center gap-2 text-sm sm:text-base"><ShieldCheck size={16} className="flex-shrink-0" />3. Coleta e Uso de Dados (LGPD)</h3>
                            <p className="leading-relaxed">Este Aplicativo está em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 - LGPD).</p>
                            <ul className="list-disc list-inside space-y-1 pl-2">
                              <li><strong>Dados Coletados:</strong> Nome, e-mail e dados inseridos durante o uso.</li>
                              <li><strong>Finalidade:</strong> Funcionamento do app e melhoria contínua.</li>
                              <li><strong>Dados Sensíveis:</strong> Você é o controlador dos dados de pacientes.</li>
                            </ul>
                        </div>

                        <div className="space-y-2">
                            <h3 className="font-semibold text-sm sm:text-base">4. Direitos do Titular (LGPD)</h3>
                            <p className="leading-relaxed">Você tem direito de solicitar confirmação, acesso, correção, eliminação e portabilidade dos seus dados.</p>
                        </div>

                        <div className="space-y-2">
                            <h3 className="font-semibold text-sm sm:text-base">5. Modificações nos Termos</h3>
                            <p className="leading-relaxed">Podemos modificar estes Termos. Você será notificado sobre alterações significativas.</p>
                        </div>
                    </div>
                </ScrollArea>
                <DialogFooter className="px-4 sm:px-6 pb-4 sm:pb-6 flex-col sm:flex-row gap-2">
                    <Button onClick={onAccept} disabled={loading} className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700">
                        {loading ? (
                            <>
                                <Loader className="w-4 h-4 mr-2 animate-spin" />
                                Processando...
                            </>
                        ) : (
                            <>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Eu li e aceito os Termos e Condições
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}