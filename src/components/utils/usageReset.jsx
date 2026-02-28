import { base44 } from '@/api/base44Client';

/**
 * Verifica se o contador mensal precisa ser resetado e executa o reset se necessário
 * @param {Object} user - Objeto do usuário atual
 * @returns {Promise<Object>} - Usuário atualizado ou original
 */
export async function checkAndResetMonthlyUsage(user) {
    if (!user) return user;

    const today = new Date();
    const lastResetDate = user.last_reset_date ? new Date(user.last_reset_date) : null;

    // Se nunca foi resetado, define a data de hoje e mantém o contador
    if (!lastResetDate) {
        await base44.auth.updateMe({
            last_reset_date: today.toISOString().split('T')[0]
        });
        return { ...user, last_reset_date: today.toISOString().split('T')[0] };
    }

    // Verifica se mudou o mês
    const lastResetMonth = lastResetDate.getMonth();
    const lastResetYear = lastResetDate.getFullYear();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    const needsReset = (currentYear > lastResetYear) || 
                       (currentYear === lastResetYear && currentMonth > lastResetMonth);

    if (needsReset) {
        console.log(`🔄 Resetando contador mensal de ${user.email} - Último reset: ${lastResetDate.toLocaleDateString()}`);
        
        await base44.auth.updateMe({
            calculations_this_month: 0,
            last_reset_date: today.toISOString().split('T')[0]
        });

        return {
            ...user,
            calculations_this_month: 0,
            last_reset_date: today.toISOString().split('T')[0]
        };
    }

    return user;
}

/**
 * Hook para usar em componentes que precisam verificar/resetar o uso
 * @returns {Function} - Função para verificar e resetar
 */
export function useUsageReset() {
    return async (user) => {
        return await checkAndResetMonthlyUsage(user);
    };
}