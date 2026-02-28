import React, { useState, useEffect } from "react";
import { User } from "@/entities/User";
import { LaserCalculation } from "@/entities/LaserCalculation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Shield, Users, Download, Search, TrendingUp, Activity, Clock, Eye, Trash2, Mail, Phone, Calendar, User as UserIcon, Send, MessageSquare, RefreshCw, Bell, CalendarClock, History, Settings, Image, TestTube, Languages, Zap, Database, FileText, Filter } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { base44 } from "@/api/base44Client";
import FeatureFlagManager from "../components/admin/FeatureFlagManager";
import BannerManager from "../components/admin/BannerManager";
import TrialManager from "../components/admin/TrialManager";
import TranslationManager from "../components/i18n/TranslationManager";
import PageBlockManager from "../components/admin/PageBlockManager";
import EquipmentAnalytics from "../components/admin/EquipmentAnalytics";
import PrescriptionAnalytics from "../components/admin/PrescriptionAnalytics";
import SpreadsheetFilterTool from "../components/admin/SpreadsheetFilterTool";
import { systemUpdateEmail, customNotificationEmail, accountDeletedEmail } from "../components/utils/emailTemplates";

export default function AdminControl() {
  const [users, setUsers] = useState([]);
  const [calculations, setCalculations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [showRoleChangeAlert, setShowRoleChangeAlert] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [pendingRoleChange, setPendingRoleChange] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailRecipient, setEmailRecipient] = useState(null);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  
  const [showForceUpdateAlert, setShowForceUpdateAlert] = useState(false);
  const [showScheduleUpdateModal, setShowScheduleUpdateModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showUpdateHistoryModal, setShowUpdateHistoryModal] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [notificationTitle, setNotificationTitle] = useState("");
  const [notificationMessage, setNotificationMessage] = useState("");
  const [isForcingUpdate, setIsForcingUpdate] = useState(false);
  const [updateHistory, setUpdateHistory] = useState([]);
  const [activeSection, setActiveSection] = useState("features");
  const [isClearingCache, setIsClearingCache] = useState(false);
  
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCalculations: 0,
    averageUsageTime: 0,
    activeUsers: 0
  });

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);
      
      if (user.role !== 'admin') {
        alert('Acesso negado. Apenas administradores podem acessar esta área.');
        window.location.href = '/';
        return;
      }
      
      loadAdminData();
      loadUpdateHistory();
    } catch (error) {
      console.error('Erro ao verificar acesso:', error);
      alert('Erro ao verificar permissões.');
    }
  };

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [allUsers, allCalculations] = await Promise.all([
        User.list(),
        LaserCalculation.list()
      ]);

      const normalUsers = allUsers.filter(u => !u.is_trial);
      
      setUsers(normalUsers);
      setCalculations(allCalculations);

      const totalUsageTime = normalUsers.reduce((sum, u) => sum + (u.total_usage_time_minutes || 0), 0);
      const activeUsers = normalUsers.filter(u => (u.calculations_this_month || 0) > 0).length;
      const totalCalculations = normalUsers.reduce((sum, u) => sum + (u.total_calculations || 0), 0);

      setStats({
        totalUsers: normalUsers.length,
        totalCalculations: totalCalculations,
        averageUsageTime: normalUsers.length > 0 ? Math.round(totalUsageTime / normalUsers.length) : 0,
        activeUsers
      });
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
    setLoading(false);
  };

  const loadUpdateHistory = () => {
    const history = JSON.parse(localStorage.getItem('updateHistory') || '[]');
    setUpdateHistory(history);
  };

  const saveUpdateHistory = (type, details) => {
    const history = JSON.parse(localStorage.getItem('updateHistory') || '[]');
    const newEntry = {
      id: Date.now(),
      type,
      details,
      timestamp: new Date().toISOString(),
      admin: currentUser?.full_name || currentUser?.email
    };
    history.unshift(newEntry);
    localStorage.setItem('updateHistory', JSON.stringify(history.slice(0, 50)));
    setUpdateHistory(history.slice(0, 50));
  };

  const sendEmailsInBatches = async (users, emailGenerator, batchSize = 5, delayMs = 2000) => {
    let sent = 0;
    for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize);
      const promises = batch.map(user => {
        if (user.email) {
          return emailGenerator(user).catch(err => console.error('Erro ao enviar email:', err));
        }
        return Promise.resolve();
      });
      await Promise.all(promises);
      sent += batch.length;
      console.log(`Enviados ${sent}/${users.length} emails`);
      if (i + batchSize < users.length) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  };

  const handleForceUpdate = async () => {
    setIsForcingUpdate(true);
    try {
      const siteUrl = window.location.origin;
      await sendEmailsInBatches(users, (user) => 
        base44.integrations.Core.SendEmail({
          from_name: "LaserCode - Sistema",
          to: user.email,
          subject: "🔄 Atualização do Sistema - Ação Necessária",
          body: systemUpdateEmail(user.full_name || 'Usuário', siteUrl)
        })
      );

      saveUpdateHistory('force', {
        usersNotified: users.length,
        message: 'Atualização imediata forçada'
      });

      localStorage.setItem('forceReload', Date.now().toString());
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'forceReload',
        newValue: Date.now().toString()
      }));

      alert(`Atualização forçada com sucesso! ${users.length} usuários foram notificados por email.`);
      setShowForceUpdateAlert(false);
    } catch (error) {
      console.error('Erro ao forçar atualização:', error);
      alert('Erro ao forçar atualização. Tente novamente.');
    }
    setIsForcingUpdate(false);
  };

  const handleScheduleUpdate = async () => {
    if (!scheduleDate || !scheduleTime) {
      alert('Por favor, selecione uma data e horário.');
      return;
    }

    const scheduledDateTime = new Date(`${scheduleDate}T${scheduleTime}`);
    
    if (scheduledDateTime <= new Date()) {
      alert('A data e hora devem ser no futuro.');
      return;
    }

    const scheduled = JSON.parse(localStorage.getItem('scheduledUpdates') || '[]');
    scheduled.push({
      id: Date.now(),
      dateTime: scheduledDateTime.toISOString(),
      admin: currentUser?.full_name || currentUser?.email,
      createdAt: new Date().toISOString()
    });
    localStorage.setItem('scheduledUpdates', JSON.stringify(scheduled));

    saveUpdateHistory('scheduled', {
      scheduledFor: scheduledDateTime.toISOString(),
      message: `Atualização agendada para ${format(scheduledDateTime, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`
    });

    alert(`Atualização agendada para ${format(scheduledDateTime, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`);
    setShowScheduleUpdateModal(false);
    setScheduleDate('');
    setScheduleTime('');
  };

  const handleSendNotification = async () => {
    if (!notificationTitle || !notificationMessage) {
      alert('Por favor, preencha o título e a mensagem.');
      return;
    }

    try {
      await sendEmailsInBatches(users, (user) =>
        base44.integrations.Core.SendEmail({
          from_name: "LaserCode - Novidades",
          to: user.email,
          subject: `📢 ${notificationTitle}`,
          body: customNotificationEmail(user.full_name || 'Usuário', notificationTitle, notificationMessage)
        })
      );

      saveUpdateHistory('notification', {
        title: notificationTitle,
        message: notificationMessage,
        usersNotified: users.length
      });

      alert(`Notificação enviada com sucesso para ${users.length} usuários!`);
      setShowNotificationModal(false);
      setNotificationTitle('');
      setNotificationMessage('');
    } catch (error) {
      console.error('Erro ao enviar notificação:', error);
      alert('Erro ao enviar notificação. Tente novamente.');
    }
  };

  const handleClearCache = async () => {
    setIsClearingCache(true);
    try {
      // Limpar localStorage (exceto dados críticos do usuário)
      const keysToKeep = ['userLanguage'];
      const keysToRemove = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!keysToKeep.includes(key)) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));

      // Limpar sessionStorage
      sessionStorage.clear();

      // Forçar recarregamento para todos os usuários
      localStorage.setItem('forceCacheClear', Date.now().toString());
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'forceCacheClear',
        newValue: Date.now().toString()
      }));

      saveUpdateHistory('cache_clear', {
        message: 'Limpeza de cache e dados temporários',
        keysRemoved: keysToRemove.length
      });

      alert(`Cache limpo com sucesso! ${keysToRemove.length} itens removidos. Todos os usuários serão notificados para recarregar.`);
    } catch (error) {
      console.error('Erro ao limpar cache:', error);
      alert('Erro ao limpar cache. Tente novamente.');
    }
    setIsClearingCache(false);
  };

  const handlePlanChange = async (userId, newPlan) => {
    try {
      await User.update(userId, { current_plan: newPlan });
      await loadAdminData();
    } catch (error) {
      console.error('Erro ao atualizar plano:', error);
      alert('Erro ao atualizar plano do usuário.');
    }
  };

  const handleUserTypeChange = async (userId, newType) => {
    try {
      await User.update(userId, { user_type: newType });
      await loadAdminData();
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error);
      alert('Erro ao atualizar categoria do usuário.');
    }
  };

  const handleRoleChangeRequest = (userId, newRole) => {
    setPendingRoleChange({ userId, newRole });
    setShowRoleChangeAlert(true);
  };

  const confirmRoleChange = async () => {
    if (!pendingRoleChange) return;
    
    try {
      await User.update(pendingRoleChange.userId, { role: pendingRoleChange.newRole });
      await loadAdminData();
      setShowRoleChangeAlert(false);
      setPendingRoleChange(null);
    } catch (error) {
      console.error('Erro ao atualizar função:', error);
      alert('Erro ao atualizar função do usuário.');
    }
  };

  const handleDeleteRequest = (user) => {
    setUserToDelete(user);
    setShowDeleteAlert(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    
    setIsDeleting(true);
    try {
      // Enviar email com template HTML
      await base44.integrations.Core.SendEmail({
        from_name: "LaserCode - Sistema",
        to: userToDelete.email,
        subject: "Conta Encerrada - LaserCode",
        body: accountDeletedEmail(
          userToDelete.full_name || 'Usuário',
          userToDelete.email,
          format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
        )
      });

      await User.delete(userToDelete.id);
      await loadAdminData();
      
      setShowDeleteAlert(false);
      setUserToDelete(null);
      
      alert('Usuário excluído com sucesso e notificação enviada por email.');
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      alert('Erro ao excluir usuário. Verifique se todas as dependências foram removidas.');
    }
    setIsDeleting(false);
  };

  const viewUserDetails = (user) => {
    setSelectedUser(user);
    setShowUserDetails(true);
  };

  const openWhatsApp = (phone) => {
    if (!phone) return;
    const cleanPhone = phone.replace(/\D/g, '');
    window.open(`https://wa.me/55${cleanPhone}`, '_blank');
  };

  const openEmailModal = (user) => {
    setEmailRecipient(user);
    setEmailSubject('');
    setEmailBody('');
    setShowEmailModal(true);
  };

  const sendEmail = async () => {
    if (!emailRecipient || !emailSubject || !emailBody) {
      alert('Por favor, preencha todos os campos.');
      return;
    }

    setIsSendingEmail(true);
    try {
      await base44.integrations.Core.SendEmail({
        from_name: "LaserCode - Administração",
        to: emailRecipient.email,
        subject: emailSubject,
        body: emailBody
      });

      alert('Email enviado com sucesso!');
      setShowEmailModal(false);
      setEmailRecipient(null);
      setEmailSubject('');
      setEmailBody('');
    } catch (error) {
      console.error('Erro ao enviar email:', error);
      alert('Erro ao enviar email. Tente novamente.');
    }
    setIsSendingEmail(false);
  };

  const filteredUsers = users.filter(user => 
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPlanColor = (plan) => {
    const colors = {
      'Essencial': 'bg-slate-100 text-slate-800',
      'Pro': 'bg-blue-100 text-blue-800',
      'Master': 'bg-purple-100 text-purple-800'
    };
    return colors[plan] || 'bg-slate-100 text-slate-800';
  };

  const getUserTypeColor = (type) => {
    const colors = {
      'Paciente': 'bg-green-100 text-green-800',
      'Profissional': 'bg-indigo-100 text-indigo-800',
      'Ambos': 'bg-purple-100 text-purple-800',
      'Não definido': 'bg-slate-100 text-slate-600'
    };
    return colors[type] || 'bg-slate-100 text-slate-600';
  };

  const generatePDFReport = () => {
    const reportContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Relatório Geral - LaserCode</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; }
          h1 { color: #1e293b; border-bottom: 3px solid #3b82f6; padding-bottom: 10px; }
          h2 { color: #475569; margin-top: 30px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #e2e8f0; padding: 12px; text-align: left; }
          th { background-color: #f1f5f9; font-weight: bold; }
          .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin: 30px 0; }
          .stat-card { background: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; }
          .stat-value { font-size: 28px; font-weight: bold; color: #1e293b; }
          .stat-label { color: #64748b; font-size: 14px; margin-top: 5px; }
          .footer { margin-top: 40px; text-align: center; color: #64748b; font-size: 12px; }
        </style>
      </head>
      <body>
        <h1>📊 Relatório Geral do LaserCode</h1>
        <p><strong>Data de Geração:</strong> ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
        
        <h2>Estatísticas Gerais</h2>
        <div class="stats">
          <div class="stat-card">
            <div class="stat-value">${stats.totalUsers}</div>
            <div class="stat-label">Total de Usuários</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${stats.activeUsers}</div>
            <div class="stat-label">Usuários Ativos (mês)</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${stats.totalCalculations}</div>
            <div class="stat-label">Total de Cálculos (Todos)</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${stats.averageUsageTime} min</div>
            <div class="stat-label">Tempo Médio de Uso</div>
          </div>
        </div>

        <h2>Lista Detalhada de Usuários</h2>
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Email</th>
              <th>Telefone</th>
              <th>Categoria</th>
              <th>Plano</th>
              <th>Função</th>
              <th>Cálculos (mês)</th>
              <th>Total Cálculos</th>
              <th>Tempo de Uso</th>
              <th>Cadastro</th>
            </tr>
          </thead>
          <tbody>
            ${users.map(user => `
              <tr>
                <td>${user.full_name || 'N/A'}</td>
                <td>${user.email}</td>
                <td>${user.phone || 'N/A'}</td>
                <td>${user.user_type || 'Não definido'}</td>
                <td>${user.current_plan || 'Essencial'}</td>
                <td>${user.role === 'admin' ? 'Administrador' : 'Usuário'}</td>
                <td>${user.calculations_this_month || 0}</td>
                <td>${user.total_calculations || 0}</td>
                <td>${user.total_usage_time_minutes || 0} min</td>
                <td>${user.created_date ? format(new Date(user.created_date), 'dd/MM/yyyy') : 'N/A'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          <p>© ${new Date().getFullYear()} LaserCode - Sistema de Cálculo de Parâmetros Laser</p>
          <p>Relatório gerado automaticamente pelo painel administrativo</p>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(reportContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Activity className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Carregando dados administrativos...</p>
        </div>
      </div>
    );
  }

  const sections = [
    { id: 'features', name: 'Funcionalidades', icon: Settings },
    { id: 'banners', name: 'Banners', icon: Image },
    { id: 'trial', name: 'Contas Trial', icon: TestTube },
    { id: 'translations', name: 'Traduções', icon: Languages },
    { id: 'pageblock', name: 'Bloqueio de Páginas', icon: Shield },
    { id: 'equipment', name: 'Equipamentos', icon: Zap },
    { id: 'prescriptions', name: 'Receitas', icon: FileText },
    { id: 'files', name: 'Filtragem de Planilhas', icon: Filter },
    { id: 'updates', name: 'Atualizações', icon: RefreshCw },
    { id: 'users', name: 'Usuários', icon: Users },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="p-2 md:p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg">
            <Shield className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Painel de Controle</h1>
            <p className="text-slate-600 text-sm md:text-lg">Administração e relatórios gerais</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleClearCache} 
            variant="outline"
            className="border-orange-300 text-orange-700 hover:bg-orange-50"
            disabled={isClearingCache}
          >
            <Database className="w-4 h-4 mr-2" />
            {isClearingCache ? 'Limpando...' : 'Limpar Cache'}
          </Button>
          <Button onClick={generatePDFReport} className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700">
            <Download className="w-4 h-4 mr-2" />
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <Card className="mb-6 bg-white/90 backdrop-blur-sm shadow-lg border-0">
        <CardContent className="p-2">
          <div className="flex flex-wrap gap-1">
            {sections.map((section) => (
              <Button
                key={section.id}
                variant={activeSection === section.id ? "default" : "ghost"}
                className={`flex items-center gap-2 ${
                  activeSection === section.id 
                    ? 'bg-gradient-to-r from-red-500 to-red-600 text-white' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                onClick={() => setActiveSection(section.id)}
              >
                <section.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{section.name}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* CONTROLE DE FUNCIONALIDADES (Feature Flags) */}
      {activeSection === 'features' && <FeatureFlagManager />}

      {/* GESTÃO DE BANNERS */}
      {activeSection === 'banners' && <BannerManager />}

      {/* GESTÃO DE CONTAS TRIAL */}
      {activeSection === 'trial' && <TrialManager />}

      {/* GERENCIADOR DE TRADUÇÕES */}
      {activeSection === 'translations' && <TranslationManager />}

      {/* BLOQUEIO DE PÁGINAS */}
      {activeSection === 'pageblock' && <PageBlockManager />}

      {/* ANALYTICS DE EQUIPAMENTOS */}
      {activeSection === 'equipment' && <EquipmentAnalytics />}

      {/* ANALYTICS DE RECEITAS */}
      {activeSection === 'prescriptions' && <PrescriptionAnalytics />}

      {/* FILTRAGEM DE PLANILHAS */}
      {activeSection === 'files' && <SpreadsheetFilterTool />}

      {/* GESTÃO DE ATUALIZAÇÕES */}
      {activeSection === 'updates' && (
        <Card className="mb-8 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 shadow-xl">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500 rounded-lg">
                <RefreshCw className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl text-purple-900">Gestão de Atualizações</CardTitle>
                <p className="text-sm text-purple-700 mt-1">Envie atualizações e notificações para todos os usuários</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Atualização Imediata */}
              <Card className="bg-white border-red-200 hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="p-4 bg-red-100 rounded-full">
                      <RefreshCw className="w-8 h-8 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 mb-2">⚡ Atualização Imediata</h3>
                      <p className="text-sm text-slate-600">
                        Força o recarregamento do site para todos os usuários online (use com cuidado)
                      </p>
                    </div>
                    <Button 
                      onClick={() => setShowForceUpdateAlert(true)}
                      className="w-full bg-red-500 hover:bg-red-600"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Forçar Agora
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Agendar Atualização */}
              <Card className="bg-white border-orange-200 hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="p-4 bg-orange-100 rounded-full">
                      <CalendarClock className="w-8 h-8 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 mb-2">📅 Agendar Atualização</h3>
                      <p className="text-sm text-slate-600">
                        Programe uma data para forçar atualização automaticamente
                      </p>
                    </div>
                    <Button 
                      onClick={() => setShowScheduleUpdateModal(true)}
                      className="w-full bg-orange-500 hover:bg-orange-600"
                    >
                      <CalendarClock className="w-4 h-4 mr-2" />
                      Agendar
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Notificar Usuários */}
              <Card className="bg-white border-blue-200 hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="p-4 bg-blue-100 rounded-full">
                      <Bell className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 mb-2">🔔 Notificar Usuários</h3>
                      <p className="text-sm text-slate-600">
                        Envie notificações personalizadas sobre novidades e atualizações
                      </p>
                    </div>
                    <Button 
                      onClick={() => setShowNotificationModal(true)}
                      className="w-full bg-blue-500 hover:bg-blue-600"
                    >
                      <Bell className="w-4 h-4 mr-2" />
                      Criar Notificação
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Histórico */}
              <Card className="bg-white border-green-200 hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="p-4 bg-green-100 rounded-full">
                      <History className="w-8 h-8 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 mb-2">📋 Histórico</h3>
                      <p className="text-sm text-slate-600">
                        Visualize todas as atualizações enviadas
                      </p>
                    </div>
                    <Badge className="bg-green-100 text-green-800 text-lg px-4 py-2">
                      {updateHistory.length} atualizações
                    </Badge>
                    <Button 
                      onClick={() => setShowUpdateHistoryModal(true)}
                      className="w-full bg-green-500 hover:bg-green-600"
                    >
                      <History className="w-4 h-4 mr-2" />
                      Ver Histórico
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alert Dialog - Forçar Atualização */}
      <AlertDialog open={showForceUpdateAlert} onOpenChange={setShowForceUpdateAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>⚠️ Forçar Atualização Imediata</AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-3">
                <p className="font-semibold text-orange-600">
                  ATENÇÃO: Esta ação irá notificar TODOS os usuários!
                </p>
                <p>
                  Todos os {users.length} usuários cadastrados receberão um email solicitando que recarreguem a página.
                </p>
                <p className="text-sm text-slate-600">
                  Use esta função apenas quando houver uma atualização crítica que requer ação imediata dos usuários.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isForcingUpdate}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleForceUpdate}
              className="bg-red-600 hover:bg-red-700"
              disabled={isForcingUpdate}
            >
              {isForcingUpdate ? 'Enviando...' : 'Sim, Forçar Atualização'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal - Agendar Atualização */}
      <Dialog open={showScheduleUpdateModal} onOpenChange={setShowScheduleUpdateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarClock className="w-5 h-5 text-orange-600" />
              Agendar Atualização
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="schedule-date">Data da Atualização</Label>
              <Input
                id="schedule-date"
                type="date"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div>
              <Label htmlFor="schedule-time">Horário</Label>
              <Input
                id="schedule-time"
                type="time"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
              />
            </div>
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <p className="text-sm text-orange-800">
                <strong>Nota:</strong> O sistema enviará notificações automaticamente na data e horário agendados.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowScheduleUpdateModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleScheduleUpdate} className="bg-orange-500 hover:bg-orange-600">
              <CalendarClock className="w-4 h-4 mr-2" />
              Agendar Atualização
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal - Notificar Usuários */}
      <Dialog open={showNotificationModal} onOpenChange={setShowNotificationModal}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-600" />
              Criar Notificação para Usuários
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="notification-title">Título da Notificação *</Label>
              <Input
                id="notification-title"
                value={notificationTitle}
                onChange={(e) => setNotificationTitle(e.target.value)}
                placeholder="Ex: Nova funcionalidade disponível!"
              />
            </div>
            <div>
              <Label htmlFor="notification-message">Mensagem *</Label>
              <Textarea
                id="notification-message"
                value={notificationMessage}
                onChange={(e) => setNotificationMessage(e.target.value)}
                placeholder="Digite a mensagem que será enviada para todos os usuários..."
                className="h-48"
              />
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>📧 {users.length} usuários</strong> receberão esta notificação por email.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNotificationModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSendNotification} className="bg-blue-600 hover:bg-blue-700">
              <Send className="w-4 h-4 mr-2" />
              Enviar Notificação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal - Histórico de Atualizações */}
      <Dialog open={showUpdateHistoryModal} onOpenChange={setShowUpdateHistoryModal}>
        <DialogContent className="sm:max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="w-5 h-5 text-green-600" />
              Histórico de Atualizações
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {updateHistory.length === 0 ? (
              <div className="text-center py-12">
                <History className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">Nenhuma atualização enviada ainda.</p>
              </div>
            ) : (
              updateHistory.map((item) => (
                <Card key={item.id} className="bg-slate-50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {item.type === 'force' && <RefreshCw className="w-4 h-4 text-red-600" />}
                          {item.type === 'scheduled' && <CalendarClock className="w-4 h-4 text-orange-600" />}
                          {item.type === 'notification' && <Bell className="w-4 h-4 text-blue-600" />}
                          <Badge variant="outline" className="capitalize">
                            {item.type === 'force' && 'Atualização Imediata'}
                            {item.type === 'scheduled' && 'Agendada'}
                            {item.type === 'notification' && 'Notificação'}
                          </Badge>
                        </div>
                        {item.details.title && (
                          <h4 className="font-semibold text-slate-900 mb-1">{item.details.title}</h4>
                        )}
                        <p className="text-sm text-slate-600 mb-2">{item.details.message}</p>
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <span>Por: {item.admin}</span>
                          <span>•</span>
                          <span>{format(new Date(item.timestamp), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
                          {item.details.usersNotified && (
                            <>
                              <span>•</span>
                              <span>{item.details.usersNotified} usuários notificados</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Seção de Usuários */}
      {activeSection === 'users' && (
      <>
      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
        <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total de Usuários</CardTitle>
            <Users className="w-5 h-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{stats.totalUsers}</div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Usuários Ativos (mês)</CardTitle>
            <Activity className="w-5 h-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{stats.activeUsers}</div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total de Cálculos (Todos)</CardTitle>
            <TrendingUp className="w-5 h-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{stats.totalCalculations}</div>
            <p className="text-xs text-slate-500 mt-1">Somatória de todos os usuários</p>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Tempo Médio de Uso</CardTitle>
            <Clock className="w-5 h-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{stats.averageUsageTime} min</div>
          </CardContent>
        </Card>
      </div>

      {/* Busca */}
      <Card className="mb-6 bg-white/90 backdrop-blur-sm shadow-lg border-0">
        <CardContent className="p-4 sm:p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              placeholder="Buscar por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 text-base"
            />
          </div>
        </CardContent>
      </Card>

      {/* Modal de Envio de Email */}
      <Dialog open={showEmailModal} onOpenChange={setShowEmailModal}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-600" />
              Enviar Email para {emailRecipient?.full_name || 'Usuário'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email-to">Destinatário</Label>
              <Input
                id="email-to"
                value={emailRecipient?.email || ''}
                disabled
                className="bg-slate-50"
              />
            </div>
            <div>
              <Label htmlFor="email-subject">Assunto *</Label>
              <Input
                id="email-subject"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="Digite o assunto do email..."
              />
            </div>
            <div>
              <Label htmlFor="email-body">Mensagem *</Label>
              <Textarea
                id="email-body"
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                placeholder="Digite a mensagem do email..."
                className="h-48"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEmailModal(false)} disabled={isSendingEmail}>
              Cancelar
            </Button>
            <Button onClick={sendEmail} disabled={isSendingEmail} className="bg-blue-600 hover:bg-blue-700">
              {isSendingEmail ? (
                <>Enviando...</>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Enviar Email
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Alert Dialog para Confirmação de Mudança de Função */}
      <AlertDialog open={showRoleChangeAlert} onOpenChange={setShowRoleChangeAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Alteração de Função</AlertDialogTitle>
            <AlertDialogDescription>
              Você está prestes a alterar a função de um usuário. Esta é uma ação sensível que afeta as permissões do usuário no sistema.
              {pendingRoleChange?.newRole === 'admin' && (
                <span className="block mt-2 font-semibold text-orange-600">
                  ⚠️ Este usuário terá acesso total ao sistema como administrador.
                </span>
              )}
              Deseja continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRoleChange} className="bg-red-600 hover:bg-red-700">
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Alert Dialog para Confirmação de Exclusão */}
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>⚠️ Excluir Conta do Usuário</AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-3">
                <p className="font-semibold text-red-600">
                  ATENÇÃO: Esta ação é irreversível!
                </p>
                <p>
                  Você está prestes a excluir permanentemente a conta de:
                </p>
                <div className="bg-slate-100 p-3 rounded-md">
                  <p className="font-semibold">{userToDelete?.full_name || 'Usuário'}</p>
                  <p className="text-sm text-slate-600">{userToDelete?.email}</p>
                  {userToDelete?.phone && (
                    <p className="text-sm text-slate-600">{userToDelete.phone}</p>
                  )}
                </div>
                <p>
                  O usuário será notificado por email sobre o encerramento da conta.
                </p>
                <p className="text-sm text-slate-600">
                  Todos os dados do usuário serão removidos permanentemente.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteUser} 
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? 'Excluindo...' : 'Sim, Excluir Conta'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal de Detalhes do Usuário */}
      <Dialog open={showUserDetails} onOpenChange={setShowUserDetails}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserIcon className="w-5 h-5" />
              Detalhes do Usuário
            </DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              {/* Informações Básicas */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-slate-500">Nome Completo</Label>
                  <p className="font-semibold text-slate-900">{selectedUser.full_name || 'Não informado'}</p>
                </div>
                <div>
                  <Label className="text-xs text-slate-500">Email</Label>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <button
                      onClick={() => openEmailModal(selectedUser)}
                      className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                    >
                      {selectedUser.email}
                    </button>
                  </div>
                </div>
                {selectedUser.phone && (
                  <div>
                    <Label className="text-xs text-slate-500">Telefone / WhatsApp</Label>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <button
                        onClick={() => openWhatsApp(selectedUser.phone)}
                        className="text-green-600 hover:text-green-800 hover:underline cursor-pointer flex items-center gap-1"
                      >
                        {selectedUser.phone}
                        <MessageSquare className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}
                <div>
                  <Label className="text-xs text-slate-500">Categoria</Label>
                  <Badge className={getUserTypeColor(selectedUser.user_type || 'Não definido')}>
                    {selectedUser.user_type || 'Não definido'}
                  </Badge>
                </div>
                <div>
                  <Label className="text-xs text-slate-500">Plano Atual</Label>
                  <Badge className={getPlanColor(selectedUser.current_plan || 'Essencial')}>
                    {selectedUser.current_plan || 'Essencial'}
                  </Badge>
                </div>
                <div>
                  <Label className="text-xs text-slate-500">Função</Label>
                  <Badge variant={selectedUser.role === 'admin' ? 'destructive' : 'outline'}>
                    {selectedUser.role === 'admin' ? 'Administrador' : 'Usuário'}
                  </Badge>
                </div>
              </div>

              {/* Estatísticas de Uso */}
              <div className="border-t pt-4">
                <h4 className="font-semibold text-slate-900 mb-3">Estatísticas de Uso</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-xs text-blue-600 font-medium">Cálculos (mês)</p>
                    <p className="text-2xl font-bold text-blue-900">{selectedUser.calculations_this_month || 0}</p>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <p className="text-xs text-purple-600 font-medium">Total de Cálculos</p>
                    <p className="text-2xl font-bold text-purple-900">{selectedUser.total_calculations || 0}</p>
                  </div>
                  <div className="bg-orange-50 p-3 rounded-lg">
                    <p className="text-xs text-orange-600 font-medium">Tempo de Uso</p>
                    <p className="text-2xl font-bold text-orange-900">{selectedUser.total_usage_time_minutes || 0} min</p>
                  </div>
                </div>
              </div>

              {/* Informações de Cadastro */}
              <div className="border-t pt-4">
                <h4 className="font-semibold text-slate-900 mb-3">Informações de Cadastro</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-slate-500">Data de Cadastro</Label>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <p className="text-slate-900">
                        {selectedUser.created_date ? format(new Date(selectedUser.created_date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }) : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-slate-500">Último Login</Label>
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-slate-400" />
                      <p className="text-slate-900">
                        {selectedUser.last_login ? format(new Date(selectedUser.last_login), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }) : 'Nunca'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ações Administrativas */}
              <div className="border-t pt-4">
                <h4 className="font-semibold text-slate-900 mb-3">Ações Administrativas</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-user-type">Categoria</Label>
                    <Select 
                      value={selectedUser.user_type || 'Não definido'} 
                      onValueChange={(value) => handleUserTypeChange(selectedUser.id, value)}
                    >
                      <SelectTrigger id="edit-user-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Paciente">Paciente</SelectItem>
                        <SelectItem value="Profissional">Profissional</SelectItem>
                        <SelectItem value="Ambos">Ambos</SelectItem>
                        <SelectItem value="Não definido">Não definido</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="edit-plan">Alterar Plano</Label>
                    <Select 
                      value={selectedUser.current_plan || 'Essencial'} 
                      onValueChange={(value) => handlePlanChange(selectedUser.id, value)}
                    >
                      <SelectTrigger id="edit-plan">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Essencial">Essencial</SelectItem>
                        <SelectItem value="Pro">Pro</SelectItem>
                        <SelectItem value="Master">Master</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="edit-role">Alterar Função</Label>
                    <Select 
                      value={selectedUser.role || 'user'} 
                      onValueChange={(value) => handleRoleChangeRequest(selectedUser.id, value)}
                    >
                      <SelectTrigger id="edit-role">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">Usuário</SelectItem>
                        <SelectItem value="admin">Administrador</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {/* Botão de Exclusão */}
                <div className="mt-6 pt-4 border-t border-red-100">
                  <Label className="text-xs text-red-600 font-semibold">Zona de Perigo</Label>
                  <Button 
                    variant="destructive" 
                    className="w-full mt-2"
                    onClick={() => {
                      setShowUserDetails(false);
                      handleDeleteRequest(selectedUser);
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Excluir Conta do Usuário
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Tabela de Usuários */}
      <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0 overflow-hidden">
        <CardHeader>
          <CardTitle className="text-xl">Lista de Usuários Normais ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="text-left p-4 font-semibold text-slate-700">Usuário</th>
                  <th className="text-left p-4 font-semibold text-slate-700">Categoria</th>
                  <th className="text-left p-4 font-semibold text-slate-700">Plano</th>
                  <th className="text-left p-4 font-semibold text-slate-700">Função</th>
                  <th className="text-center p-4 font-semibold text-slate-700">Cálculos (mês)</th>
                  <th className="text-center p-4 font-semibold text-slate-700">Total Cálculos</th>
                  <th className="text-center p-4 font-semibold text-slate-700">Tempo de Uso</th>
                  <th className="text-center p-4 font-semibold text-slate-700">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-slate-900">{user.full_name || 'Sem nome'}</p>
                        <button
                          onClick={() => openEmailModal(user)}
                          className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          {user.email}
                        </button>
                        {user.phone && (
                          <button
                            onClick={() => openWhatsApp(user.phone)}
                            className="text-xs text-green-600 hover:text-green-800 hover:underline flex items-center gap-1 mt-1"
                          >
                            <MessageSquare className="w-3 h-3" />
                            {user.phone}
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <Select 
                        value={user.user_type || 'Não definido'} 
                        onValueChange={(value) => handleUserTypeChange(user.id, value)}
                      >
                        <SelectTrigger className="w-36">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Paciente">Paciente</SelectItem>
                          <SelectItem value="Profissional">Profissional</SelectItem>
                          <SelectItem value="Ambos">Ambos</SelectItem>
                          <SelectItem value="Não definido">Não definido</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-4">
                      <Select 
                        value={user.current_plan || 'Essencial'} 
                        onValueChange={(value) => handlePlanChange(user.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Essencial">Essencial</SelectItem>
                          <SelectItem value="Pro">Pro</SelectItem>
                          <SelectItem value="Master">Master</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-4">
                      <Select 
                        value={user.role || 'user'} 
                        onValueChange={(value) => handleRoleChangeRequest(user.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">Usuário</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-4 text-center">
                      <span className="font-semibold text-slate-900">{user.calculations_this_month || 0}</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="text-slate-700">{user.total_calculations || 0}</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="text-slate-700">{user.total_usage_time_minutes || 0} min</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => viewUserDetails(user)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Ver
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleDeleteRequest(user)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      </>
      )}
    </div>
  );
}