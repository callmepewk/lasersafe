import React, { useState, useEffect } from 'react';
import { User } from '@/entities/User';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Trash2, Save, LogOut, KeyRound, Eye, EyeOff, Languages, UserCircle } from 'lucide-react';
import PageBlockChecker from '../components/system/PageBlockChecker';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { checkAndResetMonthlyUsage } from '../components/utils/usageReset';
import { base44 } from "@/api/base44Client";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Profile() {
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({ full_name: '', email: '' });
  const [selectedUserType, setSelectedUserType] = useState('Não definido');
  const [canChangeUserType, setCanChangeUserType] = useState(true);
  const [daysUntilChange, setDaysUntilChange] = useState(0);
  const [passwordData, setPasswordData] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [loading, setLoading] = useState(true);
  const [changingPassword, setChangingPassword] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
    display: false
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        let user = await User.me();
        
        // Verifica e reseta o contador se necessário
        user = await checkAndResetMonthlyUsage(user);
        
        setCurrentUser(user);
        setFormData({ full_name: user.full_name, email: user.email });
        setSelectedUserType(user.user_type || 'Não definido');

        // Verificar se pode alterar tipo de usuário (7 dias desde última mudança)
        if (user.last_user_type_change) {
          const lastChange = new Date(user.last_user_type_change);
          const now = new Date();
          const daysDiff = Math.floor((now - lastChange) / (1000 * 60 * 60 * 24));
          
          if (daysDiff < 7) {
            setCanChangeUserType(false);
            setDaysUntilChange(7 - daysDiff);
          }
        }
      } catch (error) {
        console.error("Erro ao buscar usuário:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!currentUser) return;
    try {
      await User.updateMyUserData({
        full_name: formData.full_name,
        email: formData.email
      });
      alert('Perfil atualizado com sucesso!');
      const user = await User.me();
      setCurrentUser(user);
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      alert('Falha ao atualizar o perfil.');
    }
  };

  const handleUpdateUserType = async () => {
    if (!currentUser || !canChangeUserType) return;
    
    try {
      await base44.auth.updateMe({
        user_type: selectedUserType,
        last_user_type_change: new Date().toISOString().split('T')[0]
      });
      
      alert('Tipo de usuário atualizado com sucesso!');
      const user = await User.me();
      setCurrentUser(user);
      setCanChangeUserType(false);
      setDaysUntilChange(7);
    } catch (error) {
      console.error('Erro ao atualizar tipo de usuário:', error);
      alert('Falha ao atualizar o tipo de usuário.');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.new_password !== passwordData.confirm_password) {
      alert('As senhas não coincidem.');
      return;
    }
    if (passwordData.new_password.length < 6) {
      alert('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setChangingPassword(true);
    try {
      await User.updateMyUserData({
        current_password: passwordData.current_password,
        new_password: passwordData.new_password
      });
      alert('Senha alterada com sucesso!');
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      alert('Falha ao alterar a senha. Verifique se a senha atual está correta.');
    }
    setChangingPassword(false);
  };

  const handleDeleteAccount = async () => {
    if (!currentUser) return;
    try {
      await User.delete(currentUser.id);
      alert('Conta excluída com sucesso.');
      await User.logout();
      window.location.href = '/';
    } catch (error) {
      console.error('Erro ao excluir conta:', error);
      alert('Falha ao excluir a conta.');
    }
  };

  const handleLogout = async () => {
    try {
      await User.logout();
      window.location.href = '/';
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      alert('Erro ao sair da conta.');
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // Simulação da senha atual (em um sistema real, isso viria do banco de dados)
  const currentPasswordDisplay = currentUser ? "••••••••••••" : "";

  if (loading) {
    return <div className="p-4 md:p-6">Carregando perfil...</div>;
  }

  return (
    <PageBlockChecker pageName="Profile">
    <div className="w-full max-w-3xl mx-auto space-y-6 md:space-y-8 px-4 md:px-0">
      <div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Meu Perfil</h1>
        <p className="text-slate-600 text-base md:text-lg mt-1">Gerencie suas informações pessoais e de acesso.</p>
      </div>

      <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg md:text-xl">Informações do Perfil</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <Label htmlFor="full_name">Nome Completo</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit" className="w-full sm:w-auto">
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Alterações
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

      {/* NOVO: Tipo de Usuário */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
            <UserCircle className="w-5 h-5" />
            Tipo de Usuário
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 space-y-4">
          <div>
            <Label htmlFor="user_type">Você é:</Label>
            <Select 
              value={selectedUserType} 
              onValueChange={setSelectedUserType}
              disabled={!canChangeUserType}
            >
              <SelectTrigger>
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

          {!canChangeUserType && (
            <Alert className="bg-amber-50 border-amber-200">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                Você poderá alterar seu tipo de usuário novamente em <strong>{daysUntilChange} dias</strong>. 
                Esta restrição existe para manter a consistência dos dados.
              </AlertDescription>
            </Alert>
          )}

          {canChangeUserType && selectedUserType !== currentUser?.user_type && (
            <Alert className="bg-blue-50 border-blue-200">
              <AlertDescription className="text-blue-800">
                Após confirmar, você só poderá alterar novamente em <strong>7 dias</strong>.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end">
            <Button 
              onClick={handleUpdateUserType}
              disabled={!canChangeUserType || selectedUserType === currentUser?.user_type}
              className="w-full sm:w-auto"
            >
              <UserCircle className="w-4 h-4 mr-2" />
              Confirmar Tipo de Usuário
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                <Languages className="w-5 h-5" />
                Preferências de Idioma
            </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
            <div className="space-y-2">
                <Label htmlFor="language">Idioma do Aplicativo</Label>
                <Select defaultValue="pt-br" disabled>
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="pt-br">Português (Brasil)</SelectItem>
                        <SelectItem value="en-us">English (US)</SelectItem>
                        <SelectItem value="es-es">Español</SelectItem>
                        <SelectItem value="fr-fr">Français</SelectItem>
                    </SelectContent>
                </Select>
                <p className="text-xs text-slate-500">
                    Funcionalidade de tradução automática em desenvolvimento.
                </p>
            </div>
        </CardContent>
      </Card>

        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
              <KeyRound className="w-5 h-5" />
              Gerenciar Senha
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-4 sm:p-6">
            {/* Senha Atual Display */}
            <div>
              <Label htmlFor="display_password">Senha Atual</Label>
              <div className="relative">
                <Input
                  id="display_password"
                  type={showPasswords.display ? "text" : "password"}
                  value={showPasswords.display ? (currentUser?.password || "senha123exemplo") : currentPasswordDisplay}
                  readOnly
                  className="bg-slate-50 pr-10"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('display')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-700"
                >
                  {showPasswords.display ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <hr className="my-6" />

            <form onSubmit={handleChangePassword} className="space-y-4">
              <h4 className="font-semibold text-slate-800">Alterar Senha</h4>

              <div>
                <Label htmlFor="current_password">Senha Atual para Confirmação</Label>
                <div className="relative">
                  <Input
                    id="current_password"
                    type={showPasswords.current ? "text" : "password"}
                    value={passwordData.current_password}
                    onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                    required
                    placeholder="Digite sua senha atual"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('current')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-700"
                  >
                    {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <Label htmlFor="new_password">Nova Senha</Label>
                <div className="relative">
                  <Input
                    id="new_password"
                    type={showPasswords.new ? "text" : "password"}
                    value={passwordData.new_password}
                    onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                    required
                    minLength={6}
                    placeholder="Digite a nova senha (mín. 6 caracteres)"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('new')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-700"
                  >
                    {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <Label htmlFor="confirm_password">Confirmar Nova Senha</Label>
                <div className="relative">
                  <Input
                    id="confirm_password"
                    type={showPasswords.confirm ? "text" : "password"}
                    value={passwordData.confirm_password}
                    onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                    required
                    minLength={6}
                    placeholder="Confirme a nova senha"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('confirm')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-700"
                  >
                    {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={changingPassword} className="w-full sm:w-auto">
                  <KeyRound className="w-4 h-4 mr-2" />
                  {changingPassword ? 'Alterando...' : 'Alterar Senha'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg md:text-xl">Sessão</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex-1">
                <h4 className="font-semibold text-slate-700">Sair da Conta</h4>
                <p className="text-sm text-slate-600 mt-1">Encerrar sua sessão atual no LaserCode.</p>
              </div>
              <Button variant="outline" onClick={handleLogout} className="w-full sm:w-auto">
                <LogOut className="w-4 h-4 mr-2" />
                Sair da Conta
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-red-800 text-lg md:text-xl">Zona de Perigo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex-1">
                <h4 className="font-semibold text-red-700">Excluir Conta</h4>
                <p className="text-sm text-red-600 mt-1">Esta ação é permanente e não pode ser desfeita.</p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full sm:w-auto">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Excluir Minha Conta
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="max-w-md mx-4">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação não pode ser desfeita. Isso excluirá permanentemente sua conta e removerá seus dados de nossos servidores.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteAccount} className="bg-red-600 hover:bg-red-700">
                      Sim, excluir conta
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
    </div>
    </PageBlockChecker>
  );
}