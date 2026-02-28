import { useEffect } from 'react';
import { base44 } from '@/api/base44Client';

/**
 * LISTENER GLOBAL DE ATUALIZAÇÕES
 * Verifica atualizações agendadas e executa automaticamente
 */
export default function UpdateListener() {
  useEffect(() => {
    // Listener para force reload via localStorage
    const handleStorageChange = (e) => {
      if (e.key === 'forceReload' || e.key === 'forceCacheClear') {
        console.log('🔄 Atualização forçada detectada! Recarregando...');
        setTimeout(() => {
          window.location.reload(true);
        }, 1000);
      }
    };

    // Verificar atualizações agendadas a cada minuto
    const checkScheduledUpdates = async () => {
      try {
        const scheduled = JSON.parse(localStorage.getItem('scheduledUpdates') || '[]');
        const now = new Date();

        // Filtrar atualizações que já passaram do horário
        const pendingUpdates = scheduled.filter(update => {
          const updateTime = new Date(update.dateTime);
          return updateTime <= now && !update.executed;
        });

        if (pendingUpdates.length > 0) {
          console.log(`🔔 ${pendingUpdates.length} atualizações agendadas detectadas!`);
          
          // Marcar como executadas
          const updatedScheduled = scheduled.map(update => {
            const isPending = pendingUpdates.find(p => p.id === update.id);
            return isPending ? { ...update, executed: true, executedAt: new Date().toISOString() } : update;
          });
          localStorage.setItem('scheduledUpdates', JSON.stringify(updatedScheduled));

          // Enviar notificação aos usuários
          try {
            const users = await base44.entities.User.list();
            const emailPromises = users.map(user => {
              if (user.email) {
                return base44.integrations.Core.SendEmail({
                  from_name: "LaserCode - Atualização Programada",
                  to: user.email,
                  subject: "🔄 Atualização do Sistema Implementada",
                  body: `
Olá ${user.full_name || 'Usuário'},

A atualização agendada do LaserCode foi implementada!

Por favor, recarregue a página (F5 ou Ctrl+R) para acessar as novas funcionalidades.

Atenciosamente,
Equipe LaserCode
                  `
                }).catch(err => console.error('Erro ao enviar email:', err));
              }
              return Promise.resolve();
            });
            await Promise.all(emailPromises);
          } catch (error) {
            console.error('Erro ao notificar usuários:', error);
          }

          // Forçar reload após notificar
          setTimeout(() => {
            localStorage.setItem('forceReload', Date.now().toString());
            window.location.reload(true);
          }, 2000);
        }
      } catch (error) {
        console.error('Erro ao verificar atualizações agendadas:', error);
      }
    };

    // Verificar versão do app no banco de dados
    const checkAppVersion = async () => {
      try {
        const configs = await base44.entities.AppConfig.filter({ key: 'app_version' });
        if (configs.length > 0) {
          const serverVersion = configs[0].value;
          const localVersion = localStorage.getItem('app_version');
          
          if (localVersion && localVersion !== serverVersion) {
            console.log(`🆕 Nova versão disponível: ${serverVersion} (atual: ${localVersion})`);
            localStorage.setItem('app_version', serverVersion);
            
            // Mostrar notificação e recarregar
            if (window.confirm(`Nova versão ${serverVersion} disponível! Deseja atualizar agora?`)) {
              window.location.reload(true);
            }
          } else if (!localVersion) {
            localStorage.setItem('app_version', serverVersion);
          }
        }
      } catch (error) {
        console.error('Erro ao verificar versão do app:', error);
      }
    };

    // Adicionar listener de storage
    window.addEventListener('storage', handleStorageChange);

    // Verificar atualizações agendadas a cada 1 minuto
    const scheduleInterval = setInterval(checkScheduledUpdates, 60000);
    
    // Verificar versão do app a cada 5 minutos
    const versionInterval = setInterval(checkAppVersion, 300000);

    // Verificação inicial
    checkScheduledUpdates();
    checkAppVersion();

    // Cleanup
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(scheduleInterval);
      clearInterval(versionInterval);
    };
  }, []);

  return null;
}