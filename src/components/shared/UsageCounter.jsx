import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Calculator, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useTranslation } from '@/components/i18n/TranslationContext';

export default function UsageCounter({ currentUsage, plan, size = 'default', showUpgradeButton = false }) {
    const { t } = useTranslation();
    const limits = {
        'Essencial': 20,
        'Pro': 100,
        'Master': Infinity
    };

    const limit = limits[plan] || 20;
    const isMaster = plan === 'Master';
    const percentage = isMaster ? 100 : Math.min((currentUsage / limit) * 100, 100);
    const isNearLimit = percentage >= 80 && !isMaster;
    const isAtLimit = currentUsage >= limit && !isMaster;

    const getColor = () => {
        if (isMaster) return 'from-purple-500 to-purple-600';
        if (isAtLimit) return 'from-red-500 to-red-600';
        if (isNearLimit) return 'from-orange-500 to-orange-600';
        return 'from-blue-500 to-blue-600';
    };

    const isSmall = size === 'small';

    return (
        <Card className={`bg-white/95 backdrop-blur-sm shadow-lg border-0 ${isSmall ? '' : 'hover:shadow-xl transition-shadow'}`}>
            <CardContent className={isSmall ? "p-3" : "p-4 sm:p-6"}>
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Calculator className={`${isSmall ? 'w-4 h-4' : 'w-5 h-5'} text-slate-600`} />
                        <h3 className={`${isSmall ? 'text-xs' : 'text-sm'} font-semibold text-slate-700`}>
                            {t("usageCounter.monthlyUsage", "Uso Mensal")}
                        </h3>
                    </div>
                    <span className={`${isSmall ? 'text-xs' : 'text-sm'} font-medium text-slate-500`}>
                        {t("usageCounter.plan", "Plano")} {plan}
                    </span>
                </div>

                <div className="space-y-3">
                    <div className="flex items-end justify-between">
                        <div>
                            <p className={`${isSmall ? 'text-xl' : 'text-3xl'} font-bold text-slate-900`}>
                                {currentUsage}
                            </p>
                            <p className={`${isSmall ? 'text-xs' : 'text-sm'} text-slate-500`}>
                                {t("usageCounter.of", "de")} {isMaster ? t("usageCounter.unlimited", "Ilimitado") : limit} {t("usageCounter.calculations", "cálculos")}
                            </p>
                        </div>
                        {!isMaster && (
                            <span className={`${isSmall ? 'text-lg' : 'text-2xl'} font-semibold ${isAtLimit ? 'text-red-600' : 'text-slate-600'}`}>
                                {Math.round(percentage)}%
                            </span>
                        )}
                    </div>

                    {!isMaster && (
                        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                            <div
                                className={`h-full bg-gradient-to-r ${getColor()} transition-all duration-500`}
                                style={{ width: `${percentage}%` }}
                            />
                        </div>
                    )}

                    {isAtLimit && showUpgradeButton && (
                        <div className="pt-2 border-t">
                            <p className="text-xs text-red-600 mb-2">
                                {t("usageCounter.limitReached", "Você atingiu o limite do seu plano!")}
                            </p>
                            <Link to={createPageUrl('Plans')}>
                                <button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-xs py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all">
                                    <TrendingUp className="w-3 h-3" />
                                    {t("usageCounter.upgrade", "Fazer Upgrade")}
                                </button>
                            </Link>
                        </div>
                    )}

                    {isNearLimit && !isAtLimit && showUpgradeButton && (
                        <p className="text-xs text-orange-600 pt-2 border-t">
                            {t("usageCounter.nearLimit", "Você está próximo do limite. Considere fazer upgrade!")}
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}