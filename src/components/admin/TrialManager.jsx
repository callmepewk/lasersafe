
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
import { FlaskConical, Plus, Edit, Trash2, ArrowRight, Calendar, Clock, Mail, Phone } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  welcomeTrialEmail, 
  extendTrialEmail, 
  accountActivatedEmail, 
  accountClosedEmail 
} from "../utils/emailTemplates"; // Assuming this path is correct based on context

export default function TrialManager() {
  const [trialUsers, setTrialUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showTransferAlert, setShowTransferAlert] = useState(false);
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [newTrialData, setNewTrialData] = useState({
    full_name: '',
    email: '',
    password: '',
    phone: '',
    trial_notes: ''
  });

  const [extendDays, setExtendDays] = useState(7);

  useEffect(() => {
    loadTrialUsers();
  }, []);

  const loadTrialUsers = async () => {
    setLoading(true);
    try {
      // Buscar todos os usuários com is_trial = true
      const allUsers = await base44.entities.User.list();
      const trials = allUsers.filter(u => u.is_trial === true);
      setTrialUsers(trials);
    } catch (error) {
      console.error('Erro ao carregar usuários trial:', error);
    }
    setLoading(false);
  };

  const handleCreateTrial = async () => {
    if (!newTrialData.full_name || !newTrialData.email || !newTrialData.password || !newTrialData.phone) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setIsProcessing(true);
    try {
      // Calcular data de término (7 dias a partir de hoje)
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 7);

      await base44.entities.User.create({
        full_name: newTrialData.full_name,
        email: newTrialData.email,
        password: newTrialData.password,
        phone: newTrialData.phone,
        is_trial: true,
        trial_end_date: trialEndDate.toISOString().split('T')[0],
        trial_notes: newTrialData.trial_notes || '',
        current_plan: 'Essencial',
        user_type: 'Não definido',
        calculations_this_month: 0,
        total_calculations: 0,
        terms_accepted: false,
        last_reset_date: new Date().toISOString().split('T')[0],
        last_login: new Date().toISOString(),
        account_created: new Date().toISOString(),
        total_usage_time_minutes: 0
      });

      // Enviar email de boas-vindas com template HTML
      await base44.integrations.Core.SendEmail({
        from_name: "LaserCode - Equipe",
        to: newTrialData.email,
        subject: "🎉 Bem-vindo ao LaserCode - Teste Grátis de 7 Dias",
        body: welcomeTrialEmail(
          newTrialData.full_name,
          newTrialData.email,
          newTrialData.password,
          format(trialEndDate, "dd/MM/yyyy", { locale: ptBR })
        )
      });

      alert('Usuário trial criado com sucesso! Email de boas-vindas enviado.');
      setNewTrialData({ full_name: '', email: '', password: '', phone: '', trial_notes: '' });
      setShowAddModal(false);
      loadTrialUsers();
    } catch (error) {
      console.error('Erro ao criar usuário trial:', error);
      alert('Erro ao criar usuário trial. Tente novamente.');
    }
    setIsProcessing(false);
  };

  const handleUpdateTrial = async () => {
    if (!selectedUser) return;
    
    setIsProcessing(true);
    try {
      await base44.entities.User.update(selectedUser.id, {
        full_name: selectedUser.full_name,
        email: selectedUser.email,
        phone: selectedUser.phone,
        trial_notes: selectedUser.trial_notes
      });

      alert('Usuário trial atualizado com sucesso!');
      setShowEditModal(false);
      setSelectedUser(null);
      loadTrialUsers();
    } catch (error) {
      console.error('Erro ao atualizar usuário trial:', error);
      alert('Erro ao atualizar usuário trial.');
    }
    setIsProcessing(false);
  };

  const handleExtendTrial = async () => {
    if (!selectedUser || !extendDays) return;
    
    setIsProcessing(true);
    try {
      const currentEndDate = new Date(selectedUser.trial_end_date);
      currentEndDate.setDate(currentEndDate.getDate() + extendDays);

      await base44.entities.User.update(selectedUser.id, {
        trial_end_date: currentEndDate.toISOString().split('T')[0]
      });

      // Enviar email com template HTML
      await base44.integrations.Core.SendEmail({
        from_name: "LaserCode - Equipe",
        to: selectedUser.email,
        subject: "⏰ Período de Teste Estendido - LaserCode",
        body: extendTrialEmail(
          selectedUser.full_name,
          extendDays,
          format(currentEndDate, "dd/MM/yyyy", { locale: ptBR })
        )
      });

      alert(`Período de teste estendido por ${extendDays} dias! Email de notificação enviado.`);
      setShowExtendModal(false);
      setSelectedUser(null);
      setExtendDays(7);
      loadTrialUsers();
    } catch (error) {
      console.error('Erro ao estender período trial:', error);
      alert('Erro ao estender período trial.');
    }
    setIsProcessing(false);
  };

  const handleDeleteTrial = async () => {
    if (!selectedUser) return;
    
    setIsProcessing(true);
    try {
      // Enviar email com template HTML
      await base44.integrations.Core.SendEmail({
        from_name: "LaserCode - Equipe",
        to: selectedUser.email,
        subject: "Conta de Teste Encerrada - LaserCode",
        body: accountClosedEmail(selectedUser.full_name)
      });

      await base44.entities.User.delete(selectedUser.id);

      alert('Usuário trial excluído com sucesso! Email de notificação enviado.');
      setShowDeleteAlert(false);
      setSelectedUser(null);
      loadTrialUsers();
    } catch (error) {
      console.error('Erro ao excluir usuário trial:', error);
      alert('Erro ao excluir usuário trial.');
    }
    setIsProcessing(false);
  };

  const handleTransferToNormal = async () => {
    if (!selectedUser) return;
    
    setIsProcessing(true);
    try {
      await base44.entities.User.update(selectedUser.id, {
        is_trial: false,
        trial_end_date: null,
        trial_notes: `Transferido de trial em ${format(new Date(), "dd/MM/yyyy", { locale: ptBR })}. Notas anteriores: ${selectedUser.trial_notes || 'Nenhuma'}`
      });

      // Enviar email com template HTML
      await base44.integrations.Core.SendEmail({
        from_name: "LaserCode - Equipe",
        to: selectedUser.email,
        subject: "🎉 Conta Ativada - LaserCode",
        body: accountActivatedEmail(selectedUser.full_name)
      });

      alert('Usuário transferido para conta normal com sucesso! Email de notificação enviado.');
      setShowTransferAlert(false);
      setSelectedUser(null);
      loadTrialUsers();
    } catch (error) {
      console.error('Erro ao transferir usuário:', error);
      alert('Erro ao transferir usuário.');
    }
    setIsProcessing(false);
  };

  const getDaysRemaining = (endDate) => {
    const today = new Date();
    const end = new Date(endDate);
    const diff = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const getTrialStatus = (endDate) => {
    const daysRemaining = getDaysRemaining(endDate);
    if (daysRemaining < 0) return { label: 'Expirado', color: 'bg-red-100 text-red-800' };
    if (daysRemaining <= 2) return { label: `${daysRemaining}d restantes`, color: 'bg-orange-100 text-orange-800' };
    return { label: `${daysRemaining}d restantes`, color: 'bg-green-100 text-green-800' };
  };

  return (
    <Card className="mb-8 bg-gradient-to-br from-teal-50 to-cyan-50 border-teal-200 shadow-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-500 rounded-lg">
              <FlaskConical className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl text-teal-900">Contas Trial (Teste Grátis)</CardTitle>
              <p className="text-sm text-teal-700 mt-1">Gerencie usuários em período de teste de 7 dias</p>
            </div>
          </div>
          <Button onClick={() => setShowAddModal(true)} className="bg-teal-600 hover:bg-teal-700">
            <Plus className="w-4 h-4 mr-2" />
            Novo Trial
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-center text-teal-700">Carregando usuários trial...</p>
        ) : trialUsers.length === 0 ? (
          <div className="text-center py-12">
            <FlaskConical className="w-12 h-12 text-teal-300 mx-auto mb-3" />
            <p className="text-teal-600">Nenhum usuário trial cadastrado.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {trialUsers.map((user) => {
              const status = getTrialStatus(user.trial_end_date);
              return (
                <Card key={user.id} className="bg-white border-teal-100 hover:shadow-md transition-all">
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-slate-900">{user.full_name}</h3>
                          <Badge className={status.color}>{status.label}</Badge>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-600">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-teal-500" />
                            <span>{user.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-teal-500" />
                            <span>{user.phone}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-teal-500" />
                            <span>Término: {format(new Date(user.trial_end_date), "dd/MM/yyyy", { locale: ptBR })}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-teal-500" />
                            <span>Criado: {format(new Date(user.account_created), "dd/MM/yyyy", { locale: ptBR })}</span>
                          </div>
                        </div>
                        {user.trial_notes && (
                          <p className="text-xs text-slate-500 italic mt-2">📝 {user.trial_notes}</p>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setShowEditModal(true);
                          }}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Editar
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setShowExtendModal(true);
                          }}
                          className="border-orange-200 text-orange-700 hover:bg-orange-50"
                        >
                          <Clock className="w-4 h-4 mr-1" />
                          Estender
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setShowTransferAlert(true);
                          }}
                          className="border-green-200 text-green-700 hover:bg-green-50"
                        >
                          <ArrowRight className="w-4 h-4 mr-1" />
                          Transferir
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setShowDeleteAlert(true);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </CardContent>

      {/* Modal Criar Trial */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-teal-600" />
              Criar Novo Usuário Trial
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="trial_name">Nome Completo *</Label>
              <Input
                id="trial_name"
                value={newTrialData.full_name}
                onChange={(e) => setNewTrialData({ ...newTrialData, full_name: e.target.value })}
                placeholder="Digite o nome completo"
              />
            </div>
            <div>
              <Label htmlFor="trial_email">Email *</Label>
              <Input
                id="trial_email"
                type="email"
                value={newTrialData.email}
                onChange={(e) => setNewTrialData({ ...newTrialData, email: e.target.value })}
                placeholder="email@exemplo.com"
              />
            </div>
            <div>
              <Label htmlFor="trial_password">Senha *</Label>
              <Input
                id="trial_password"
                type="text"
                value={newTrialData.password}
                onChange={(e) => setNewTrialData({ ...newTrialData, password: e.target.value })}
                placeholder="Digite a senha inicial"
              />
            </div>
            <div>
              <Label htmlFor="trial_phone">Telefone *</Label>
              <Input
                id="trial_phone"
                value={newTrialData.phone}
                onChange={(e) => setNewTrialData({ ...newTrialData, phone: e.target.value })}
                placeholder="(00) 00000-0000"
              />
            </div>
            <div>
              <Label htmlFor="trial_notes">Observações</Label>
              <Textarea
                id="trial_notes"
                value={newTrialData.trial_notes}
                onChange={(e) => setNewTrialData({ ...newTrialData, trial_notes: e.target.value })}
                placeholder="Notas internas sobre este usuário trial..."
                className="h-20"
              />
            </div>
            <div className="bg-teal-50 p-3 rounded-lg border border-teal-200">
              <p className="text-sm text-teal-800">
                <strong>ℹ️ Período de teste:</strong> O usuário terá acesso gratuito por 7 dias a partir de hoje.
                Um email com as credenciais será enviado automaticamente.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModal(false)} disabled={isProcessing}>
              Cancelar
            </Button>
            <Button onClick={handleCreateTrial} disabled={isProcessing} className="bg-teal-600 hover:bg-teal-700">
              {isProcessing ? 'Criando...' : 'Criar Trial'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Editar Trial */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5 text-teal-600" />
              Editar Usuário Trial
            </DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit_name">Nome Completo</Label>
                <Input
                  id="edit_name"
                  value={selectedUser.full_name}
                  onChange={(e) => setSelectedUser({ ...selectedUser, full_name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit_email">Email</Label>
                <Input
                  id="edit_email"
                  type="email"
                  value={selectedUser.email}
                  onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit_phone">Telefone</Label>
                <Input
                  id="edit_phone"
                  value={selectedUser.phone}
                  onChange={(e) => setSelectedUser({ ...selectedUser, phone: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit_notes">Observações</Label>
                <Textarea
                  id="edit_notes"
                  value={selectedUser.trial_notes || ''}
                  onChange={(e) => setSelectedUser({ ...selectedUser, trial_notes: e.target.value })}
                  className="h-20"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditModal(false)} disabled={isProcessing}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateTrial} disabled={isProcessing} className="bg-teal-600 hover:bg-teal-700">
              {isProcessing ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Estender Período */}
      <Dialog open={showExtendModal} onOpenChange={setShowExtendModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-600" />
              Estender Período de Teste
            </DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-sm text-slate-700">
                  <strong>Usuário:</strong> {selectedUser.full_name}
                </p>
                <p className="text-sm text-slate-700 mt-1">
                  <strong>Término atual:</strong> {format(new Date(selectedUser.trial_end_date), "dd/MM/yyyy", { locale: ptBR })}
                </p>
              </div>
              <div>
                <Label htmlFor="extend_days">Adicionar Dias</Label>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setExtendDays(7)}
                    className={extendDays === 7 ? 'border-orange-500 bg-orange-50' : ''}
                  >
                    +7 dias
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setExtendDays(14)}
                    className={extendDays === 14 ? 'border-orange-500 bg-orange-50' : ''}
                  >
                    +14 dias
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setExtendDays(30)}
                    className={extendDays === 30 ? 'border-orange-500 bg-orange-50' : ''}
                  >
                    +30 dias
                  </Button>
                </div>
                <Input
                  id="extend_days"
                  type="number"
                  value={extendDays}
                  onChange={(e) => setExtendDays(parseInt(e.target.value) || 0)}
                  className="mt-2"
                  placeholder="Ou digite o número de dias"
                  min="1"
                />
              </div>
              {extendDays > 0 && (
                <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                  <p className="text-sm text-orange-800">
                    <strong>Nova data de término:</strong>{' '}
                    {format(
                      new Date(new Date(selectedUser.trial_end_date).getTime() + extendDays * 24 * 60 * 60 * 1000),
                      "dd/MM/yyyy",
                      { locale: ptBR }
                    )}
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExtendModal(false)} disabled={isProcessing}>
              Cancelar
            </Button>
            <Button onClick={handleExtendTrial} disabled={isProcessing || !extendDays} className="bg-orange-600 hover:bg-orange-700">
              {isProcessing ? 'Estendendo...' : `Estender ${extendDays} dias`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Alert Excluir */}
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Conta Trial</AlertDialogTitle>
            <AlertDialogDescription>
              Você tem certeza que deseja excluir a conta trial de <strong>{selectedUser?.full_name}</strong>?
              Esta ação não pode ser desfeita e o usuário será notificado por email.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTrial} disabled={isProcessing} className="bg-red-600 hover:bg-red-700">
              {isProcessing ? 'Excluindo...' : 'Sim, Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Alert Transferir */}
      <AlertDialog open={showTransferAlert} onOpenChange={setShowTransferAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Transferir para Conta Normal</AlertDialogTitle>
            <AlertDialogDescription>
              Você tem certeza que deseja transferir <strong>{selectedUser?.full_name}</strong> para uma conta normal?
              O usuário deixará de ser trial e terá acesso ilimitado à plataforma. Um email de confirmação será enviado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleTransferToNormal} disabled={isProcessing} className="bg-green-600 hover:bg-green-700">
              {isProcessing ? 'Transferindo...' : 'Sim, Transferir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
