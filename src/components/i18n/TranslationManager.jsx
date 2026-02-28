import React, { useState } from 'react';
import { useTranslation } from './TranslationContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Languages, Loader2, CheckCircle, Globe } from 'lucide-react';

export default function TranslationManager() {
  const { supportedLanguages, translateTexts, currentLanguage } = useTranslation();
  const [textsToTranslate, setTextsToTranslate] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationProgress, setTranslationProgress] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleAutoTranslate = async () => {
    if (!textsToTranslate.trim()) {
      alert('Digite os textos para traduzir no formato JSON');
      return;
    }

    try {
      const textsObject = JSON.parse(textsToTranslate);
      setIsTranslating(true);
      setTranslationProgress([]);
      setShowSuccess(false);

      // Traduzir para todos os idiomas (exceto pt-BR)
      const languagesToTranslate = supportedLanguages.filter(l => l.code !== 'pt-BR');
      
      for (let i = 0; i < languagesToTranslate.length; i++) {
        const lang = languagesToTranslate[i];
        setTranslationProgress(prev => [...prev, `Traduzindo para ${lang.name}...`]);
        
        await translateTexts(textsObject, lang.code);
        
        setTranslationProgress(prev => [
          ...prev.slice(0, -1),
          `✅ ${lang.name} concluído`
        ]);

        // Delay entre requisições
        if (i < languagesToTranslate.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    } catch (error) {
      console.error('Erro ao traduzir:', error);
      alert('Erro ao processar JSON. Verifique o formato.');
    }
    setIsTranslating(false);
  };

  const exampleJson = {
    "dashboard.title": "Dashboard",
    "dashboard.welcome": "Bem-vindo ao LaserCode",
    "calculator.title": "Calculadora",
    "patients.title": "Pacientes",
    "professionals.title": "Profissionais"
  };

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500 rounded-lg">
            <Languages className="w-6 h-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl text-purple-900">Gerenciador de Traduções</CardTitle>
            <p className="text-sm text-purple-700 mt-1">Traduza automaticamente textos para todos os idiomas</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">
            Textos para Traduzir (formato JSON)
          </label>
          <Textarea
            value={textsToTranslate}
            onChange={(e) => setTextsToTranslate(e.target.value)}
            placeholder={JSON.stringify(exampleJson, null, 2)}
            className="h-64 font-mono text-sm"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="flex items-center gap-1">
            <Globe className="w-3 h-3" />
            {supportedLanguages.length} idiomas suportados
          </Badge>
        </div>

        {translationProgress.length > 0 && (
          <Alert>
            <AlertDescription>
              <div className="space-y-1 text-sm">
                {translationProgress.map((msg, idx) => (
                  <div key={idx}>{msg}</div>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {showSuccess && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Traduções concluídas e salvas com sucesso!
            </AlertDescription>
          </Alert>
        )}

        <Button
          onClick={handleAutoTranslate}
          disabled={isTranslating || !textsToTranslate.trim()}
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          {isTranslating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Traduzindo...
            </>
          ) : (
            <>
              <Languages className="w-4 h-4 mr-2" />
              Traduzir Automaticamente
            </>
          )}
        </Button>

        <div className="bg-white p-4 rounded-lg border border-purple-200">
          <h4 className="font-semibold text-sm text-purple-900 mb-2">📝 Instruções:</h4>
          <ol className="text-sm text-slate-700 space-y-1 list-decimal list-inside">
            <li>Cole um objeto JSON com as chaves e textos em português</li>
            <li>Clique em "Traduzir Automaticamente"</li>
            <li>O sistema traduzirá para todos os {supportedLanguages.length} idiomas</li>
            <li>As traduções serão salvas no cache do navegador</li>
            <li>Use as chaves no código com a função t()</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}