import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Flag, Plus, Settings, Trash2, Save } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

/**
 * GERENCIADOR DE FEATURE FLAGS
 * Permite admin controlar funcionalidades sem deploy
 */
export default function FeatureFlagManager() {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [editingConfig, setEditingConfig] = useState(null);
  
  const [newConfig, setNewConfig] = useState({
    key: '',
    value: '',
    description: '',
    type: 'feature_flag',
    enabled: true
  });

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.AppConfig.list('-created_date');
      setConfigs(data);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
    setLoading(false);
  };

  const handleCreateConfig = async () => {
    if (!newConfig.key || !newConfig.value) {
      alert('Preencha pelo menos a chave e o valor.');
      return;
    }

    try {
      await base44.entities.AppConfig.create(newConfig);
      setShowNewDialog(false);
      setNewConfig({
        key: '',
        value: '',
        description: '',
        type: 'feature_flag',
        enabled: true
      });
      loadConfigs();
      
      // Notificar sobre nova configuração
      alert('Configuração criada com sucesso! Use "Forçar Agora" para aplicar aos usuários.');
    } catch (error) {
      console.error('Erro ao criar configuração:', error);
      alert('Erro ao criar configuração.');
    }
  };

  const handleToggleConfig = async (config) => {
    try {
      await base44.entities.AppConfig.update(config.id, {
        enabled: !config.enabled
      });
      loadConfigs();
    } catch (error) {
      console.error('Erro ao atualizar configuração:', error);
    }
  };

  const handleDeleteConfig = async (configId) => {
    if (!confirm('Tem certeza que deseja excluir esta configuração?')) return;
    
    try {
      await base44.entities.AppConfig.delete(configId);
      loadConfigs();
    } catch (error) {
      console.error('Erro ao excluir configuração:', error);
    }
  };

  const handleUpdateVersion = async () => {
    const newVersion = prompt('Digite a nova versão do app (ex: 1.5.0):');
    if (!newVersion) return;

    try {
      const existingVersions = configs.filter(c => c.key === 'app_version');
      
      if (existingVersions.length > 0) {
        await base44.entities.AppConfig.update(existingVersions[0].id, {
          value: newVersion
        });
      } else {
        await base44.entities.AppConfig.create({
          key: 'app_version',
          value: newVersion,
          description: 'Versão atual do aplicativo',
          type: 'version',
          enabled: true
        });
      }
      
      loadConfigs();
      alert(`Versão atualizada para ${newVersion}! Use "Forçar Agora" para notificar usuários.`);
    } catch (error) {
      console.error('Erro ao atualizar versão:', error);
    }
  };

  const featureFlags = configs.filter(c => c.type === 'feature_flag');
  const generalConfigs = configs.filter(c => c.type === 'config');
  const versionConfigs = configs.filter(c => c.type === 'version');

  return (
    <Card className="mb-8 bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-200 shadow-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500 rounded-lg">
              <Flag className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl text-indigo-900">
                Controle de Funcionalidades
              </CardTitle>
              <p className="text-sm text-indigo-700 mt-1">
                Ative/desative features sem publicar código
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleUpdateVersion} variant="outline" className="border-indigo-300">
              <Settings className="w-4 h-4 mr-2" />
              Atualizar Versão
            </Button>
            <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
              <DialogTrigger asChild>
                <Button className="bg-indigo-600 hover:bg-indigo-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Config
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nova Configuração</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Chave (key) *</Label>
                    <Input
                      value={newConfig.key}
                      onChange={(e) => setNewConfig({...newConfig, key: e.target.value})}
                      placeholder="ex: feature_nova_calculadora"
                    />
                  </div>
                  <div>
                    <Label>Valor (value) *</Label>
                    <Input
                      value={newConfig.value}
                      onChange={(e) => setNewConfig({...newConfig, value: e.target.value})}
                      placeholder="true / false / JSON"
                    />
                  </div>
                  <div>
                    <Label>Descrição</Label>
                    <Textarea
                      value={newConfig.description}
                      onChange={(e) => setNewConfig({...newConfig, description: e.target.value})}
                      placeholder="Descrição da funcionalidade..."
                    />
                  </div>
                  <div>
                    <Label>Tipo</Label>
                    <select
                      value={newConfig.type}
                      onChange={(e) => setNewConfig({...newConfig, type: e.target.value})}
                      className="w-full p-2 border rounded"
                    >
                      <option value="feature_flag">Feature Flag</option>
                      <option value="config">Configuração Geral</option>
                      <option value="version">Versão</option>
                    </select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowNewDialog(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateConfig} className="bg-indigo-600">
                    <Save className="w-4 h-4 mr-2" />
                    Criar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="features" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="features">Feature Flags ({featureFlags.length})</TabsTrigger>
            <TabsTrigger value="configs">Configurações ({generalConfigs.length})</TabsTrigger>
            <TabsTrigger value="version">Versão ({versionConfigs.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="features" className="space-y-4 mt-4">
            {featureFlags.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                Nenhuma feature flag criada ainda.
              </div>
            ) : (
              featureFlags.map(config => (
                <Card key={config.id} className="bg-white">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <code className="bg-slate-100 px-2 py-1 rounded text-sm font-mono">
                            {config.key}
                          </code>
                          <Switch
                            checked={config.enabled}
                            onCheckedChange={() => handleToggleConfig(config)}
                          />
                        </div>
                        <p className="text-sm text-slate-600">{config.description}</p>
                        <p className="text-xs text-slate-400 mt-1">
                          Valor: <code>{config.value}</code>
                        </p>
                      </div>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDeleteConfig(config.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="configs" className="space-y-4 mt-4">
            {generalConfigs.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                Nenhuma configuração geral criada ainda.
              </div>
            ) : (
              generalConfigs.map(config => (
                <Card key={config.id} className="bg-white">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <code className="bg-slate-100 px-2 py-1 rounded text-sm font-mono">
                            {config.key}
                          </code>
                        </div>
                        <p className="text-sm text-slate-600">{config.description}</p>
                        <p className="text-xs text-slate-400 mt-1">
                          Valor: <code>{config.value}</code>
                        </p>
                      </div>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDeleteConfig(config.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="version" className="space-y-4 mt-4">
            {versionConfigs.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-500 mb-4">Nenhuma versão definida.</p>
                <Button onClick={handleUpdateVersion} className="bg-indigo-600">
                  Definir Versão Inicial
                </Button>
              </div>
            ) : (
              versionConfigs.map(config => (
                <Card key={config.id} className="bg-white">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-600 mb-1">Versão Atual do App</p>
                        <p className="text-3xl font-bold text-indigo-600">{config.value}</p>
                      </div>
                      <Button onClick={handleUpdateVersion} className="bg-indigo-600">
                        Atualizar Versão
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>💡 Como usar:</strong> Crie feature flags para controlar funcionalidades. 
            Após criar/modificar, use <strong>"Forçar Agora"</strong> na seção de atualizações 
            para aplicar as mudanças a todos os usuários.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}