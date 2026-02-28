import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Unlock, AlertTriangle, LockOpen, CalendarClock, Trash2, Clock } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Lista de páginas do sistema que podem ser bloqueadas
const SYSTEM_PAGES = [
  { name: "Dashboard", path: "/Dashboard", displayName: "Dashboard" },
  { name: "Patients", path: "/Patients", displayName: "Pacientes" },
  { name: "Professionals", path: "/Professionals", displayName: "Profissionais" },
  { name: "Calculator", path: "/Calculator", displayName: "Calculadora" },
  { name: "Prescriptions", path: "/Prescriptions", displayName: "Receitas" },
  { name: "History", path: "/History", displayName: "Histórico" },
  { name: "NeoFormulas", path: "/NeoFormulas", displayName: "Fórmulas Neo" },
  { name: "Reference", path: "/Reference", displayName: "Guia de Referência" },
  { name: "Plans", path: "/Plans", displayName: "Planos" },
  { name: "AboutUs", path: "/AboutUs", displayName: "Sobre Nós" },
  { name: "Tutorial", path: "/Tutorial", displayName: "Tutorial" },
  { name: "Support", path: "/Support", displayName: "Suporte" },
  { name: "Profile", path: "/Profile", displayName: "Meu Perfil" },
];

export default function PageBlockManager() {
  const [blockedPages, setBlockedPages] = useState({});
  const [scheduledActions, setScheduledActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Modal de agendamento
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleData, setScheduleData] = useState({
    pageName: "",
    action: "block", // "block" ou "unblock"
    date: "",
    time: ""
  });

  useEffect(() => {
    loadBlockedPages();
    loadScheduledActions();
    
    // Verificar agendamentos a cada minuto
    const interval = setInterval(checkScheduledActions, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadBlockedPages = async () => {
    setLoading(true);
    try {
      const configs = await base44.entities.AppConfig.filter({ key: "blocked_pages" });
      if (configs.length > 0) {
        const blocked = JSON.parse(configs[0].value || "{}");
        setBlockedPages(blocked);
      }
    } catch (error) {
      console.error("Erro ao carregar páginas bloqueadas:", error);
    }
    setLoading(false);
  };

  const loadScheduledActions = async () => {
    try {
      const configs = await base44.entities.AppConfig.filter({ key: "scheduled_page_actions" });
      if (configs.length > 0) {
        const scheduled = JSON.parse(configs[0].value || "[]");
        setScheduledActions(scheduled);
      }
    } catch (error) {
      console.error("Erro ao carregar ações agendadas:", error);
    }
  };

  const saveScheduledActions = async (newScheduled) => {
    try {
      const configs = await base44.entities.AppConfig.filter({ key: "scheduled_page_actions" });
      
      if (configs.length > 0) {
        await base44.entities.AppConfig.update(configs[0].id, {
          value: JSON.stringify(newScheduled)
        });
      } else {
        await base44.entities.AppConfig.create({
          key: "scheduled_page_actions",
          value: JSON.stringify(newScheduled),
          type: "scheduled_update",
          description: "Ações agendadas para páginas",
          enabled: true
        });
      }
      
      setScheduledActions(newScheduled);
    } catch (error) {
      console.error("Erro ao salvar ações agendadas:", error);
    }
  };

  const checkScheduledActions = async () => {
    const now = new Date();
    let hasChanges = false;
    const newBlockedPages = { ...blockedPages };
    const remainingActions = [];

    for (const action of scheduledActions) {
      const scheduledTime = new Date(action.scheduledFor);
      
      if (scheduledTime <= now) {
        // Executar a ação
        if (action.action === "block") {
          newBlockedPages[action.pageName] = {
            blocked: true,
            blockedAt: now.toISOString()
          };
        } else if (action.action === "unblock") {
          delete newBlockedPages[action.pageName];
        }
        hasChanges = true;
      } else {
        // Manter ações futuras
        remainingActions.push(action);
      }
    }

    if (hasChanges) {
      await saveBlockedPages(newBlockedPages);
      await saveScheduledActions(remainingActions);
    }
  };

  const handleScheduleAction = async () => {
    if (!scheduleData.pageName || !scheduleData.date || !scheduleData.time) {
      alert("Por favor, preencha todos os campos.");
      return;
    }

    const scheduledFor = new Date(`${scheduleData.date}T${scheduleData.time}`);
    
    if (scheduledFor <= new Date()) {
      alert("A data e hora devem ser no futuro.");
      return;
    }

    const newAction = {
      id: Date.now(),
      pageName: scheduleData.pageName,
      action: scheduleData.action,
      scheduledFor: scheduledFor.toISOString(),
      createdAt: new Date().toISOString()
    };

    const newScheduled = [...scheduledActions, newAction];
    await saveScheduledActions(newScheduled);

    setShowScheduleModal(false);
    setScheduleData({ pageName: "", action: "block", date: "", time: "" });
    alert(`Ação agendada com sucesso para ${format(scheduledFor, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`);
  };

  const cancelScheduledAction = async (actionId) => {
    const newScheduled = scheduledActions.filter(a => a.id !== actionId);
    await saveScheduledActions(newScheduled);
  };

  const saveBlockedPages = async (newBlockedPages) => {
    setSaving(true);
    try {
      const configs = await base44.entities.AppConfig.filter({ key: "blocked_pages" });
      
      if (configs.length > 0) {
        await base44.entities.AppConfig.update(configs[0].id, {
          value: JSON.stringify(newBlockedPages)
        });
      } else {
        await base44.entities.AppConfig.create({
          key: "blocked_pages",
          value: JSON.stringify(newBlockedPages),
          type: "config",
          description: "Páginas bloqueadas para manutenção",
          enabled: true
        });
      }
      
      setBlockedPages(newBlockedPages);
    } catch (error) {
      console.error("Erro ao salvar páginas bloqueadas:", error);
      alert("Erro ao salvar configuração. Tente novamente.");
    }
    setSaving(false);
  };

  const togglePageBlock = async (pageName) => {
    const newBlockedPages = { ...blockedPages };
    if (newBlockedPages[pageName]) {
      delete newBlockedPages[pageName];
    } else {
      newBlockedPages[pageName] = {
        blocked: true,
        blockedAt: new Date().toISOString()
      };
    }
    await saveBlockedPages(newBlockedPages);
  };

  const blockAllPages = async () => {
    const newBlockedPages = {};
    SYSTEM_PAGES.forEach(page => {
      newBlockedPages[page.name] = {
        blocked: true,
        blockedAt: new Date().toISOString()
      };
    });
    await saveBlockedPages(newBlockedPages);
  };

  const unblockAllPages = async () => {
    await saveBlockedPages({});
  };

  const isPageBlocked = (pageName) => {
    return !!blockedPages[pageName]?.blocked;
  };

  if (loading) {
    return (
      <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0">
        <CardContent className="p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-600">Carregando configurações...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-red-50 to-orange-50 border-red-200 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-t-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Lock className="w-6 h-6" />
            <CardTitle className="text-xl">Bloqueio de Páginas</CardTitle>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => setShowScheduleModal(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              <CalendarClock className="w-4 h-4 mr-2" />
              Agendar
            </Button>
            <Button
              onClick={unblockAllPages}
              disabled={saving}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Unlock className="w-4 h-4 mr-2" />
              Liberar Todas
            </Button>
            <Button
              onClick={blockAllPages}
              disabled={saving}
              variant="outline"
              className="bg-white/10 border-white/30 text-white hover:bg-white/20"
            >
              <Lock className="w-4 h-4 mr-2" />
              Bloquear Todas
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <Alert className="mb-6 bg-amber-50 border-amber-300">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <strong>Atenção:</strong> Páginas bloqueadas exibirão uma mensagem informando que estão em manutenção. 
            Apenas administradores poderão acessá-las normalmente.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SYSTEM_PAGES.map((page) => {
            const blocked = isPageBlocked(page.name);
            return (
              <div
                key={page.name}
                className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                  blocked 
                    ? "bg-red-50 border-red-200" 
                    : "bg-white border-slate-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  {blocked ? (
                    <Lock className="w-5 h-5 text-red-500" />
                  ) : (
                    <LockOpen className="w-5 h-5 text-green-500" />
                  )}
                  <div>
                    <p className="font-semibold text-slate-900">{page.displayName}</p>
                    <p className="text-sm text-slate-500">{page.path}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge 
                    className={blocked 
                      ? "bg-red-100 text-red-800" 
                      : "bg-green-100 text-green-800"
                    }
                  >
                    {blocked ? "Bloqueada" : "Liberada"}
                  </Badge>
                  <Switch
                    checked={!blocked}
                    onCheckedChange={() => togglePageBlock(page.name)}
                    disabled={saving}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {saving && (
          <div className="mt-4 text-center text-slate-600">
            <div className="animate-spin w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full inline-block mr-2"></div>
            Salvando...
          </div>
        )}

        {/* Lista de Ações Agendadas */}
        {scheduledActions.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-500" />
              Ações Agendadas ({scheduledActions.length})
            </h3>
            <div className="space-y-3">
              {scheduledActions
                .sort((a, b) => new Date(a.scheduledFor) - new Date(b.scheduledFor))
                .map((action) => {
                  const page = SYSTEM_PAGES.find(p => p.name === action.pageName);
                  return (
                    <div
                      key={action.id}
                      className="flex items-center justify-between p-4 bg-white rounded-lg border border-orange-200 shadow-sm"
                    >
                      <div className="flex items-center gap-4">
                        {action.action === "block" ? (
                          <Lock className="w-5 h-5 text-red-500" />
                        ) : (
                          <Unlock className="w-5 h-5 text-green-500" />
                        )}
                        <div>
                          <p className="font-semibold text-slate-900">
                            {action.action === "block" ? "Bloquear" : "Desbloquear"}: {page?.displayName || action.pageName}
                          </p>
                          <p className="text-sm text-slate-500">
                            Agendado para: {format(new Date(action.scheduledFor), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => cancelScheduledAction(action.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </CardContent>

      {/* Modal de Agendamento */}
      <Dialog open={showScheduleModal} onOpenChange={setShowScheduleModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarClock className="w-5 h-5 text-orange-500" />
              Agendar Bloqueio/Desbloqueio
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="schedule-page">Página</Label>
              <Select
                value={scheduleData.pageName}
                onValueChange={(value) => setScheduleData({ ...scheduleData, pageName: value })}
              >
                <SelectTrigger id="schedule-page">
                  <SelectValue placeholder="Selecione a página" />
                </SelectTrigger>
                <SelectContent>
                  {SYSTEM_PAGES.map((page) => (
                    <SelectItem key={page.name} value={page.name}>
                      {page.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="schedule-action">Ação</Label>
              <Select
                value={scheduleData.action}
                onValueChange={(value) => setScheduleData({ ...scheduleData, action: value })}
              >
                <SelectTrigger id="schedule-action">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="block">
                    <span className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-red-500" />
                      Bloquear página
                    </span>
                  </SelectItem>
                  <SelectItem value="unblock">
                    <span className="flex items-center gap-2">
                      <Unlock className="w-4 h-4 text-green-500" />
                      Desbloquear página
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="schedule-date">Data</Label>
                <Input
                  id="schedule-date"
                  type="date"
                  value={scheduleData.date}
                  onChange={(e) => setScheduleData({ ...scheduleData, date: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <Label htmlFor="schedule-time">Horário</Label>
                <Input
                  id="schedule-time"
                  type="time"
                  value={scheduleData.time}
                  onChange={(e) => setScheduleData({ ...scheduleData, time: e.target.value })}
                />
              </div>
            </div>

            <Alert className="bg-blue-50 border-blue-200">
              <AlertDescription className="text-blue-800 text-sm">
                A ação será executada automaticamente na data e hora especificadas.
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowScheduleModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleScheduleAction} className="bg-orange-500 hover:bg-orange-600">
              <CalendarClock className="w-4 h-4 mr-2" />
              Agendar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}