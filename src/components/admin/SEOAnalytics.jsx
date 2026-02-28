import React from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, Clock, Users, Gauge, DollarSign, FlaskConical, ListOrdered, Calendar } from "lucide-react";

export default function SEOAnalytics() {
  const [loading, setLoading] = React.useState(true);
  const [events, setEvents] = React.useState([]);
  const [assertiveness, setAssertiveness] = React.useState({ total: 0, ok: 0, rate: 0 });
  const [perPage, setPerPage] = React.useState([]);
  const [uniqueSessions, setUniqueSessions] = React.useState(0);
  const [avgTimeSite, setAvgTimeSite] = React.useState(0);
  const [roi, setRoi] = React.useState({ spend: 0, revenue: 0, roiPct: 0 });
  const [topTech, setTopTech] = React.useState([]);
  const [topProcedures, setTopProcedures] = React.useState([]);
  const [avgAgg, setAvgAgg] = React.useState({ value: 0, label: '-' });
  const [avgPerMonth, setAvgPerMonth] = React.useState(0);

  React.useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [evts, calcs, configs] = await Promise.all([
          base44.entities.AnalyticsEvent.list('-created_date'),
          base44.entities.LaserCalculation.list('-created_date'),
          base44.entities.AppConfig.list()
        ]);

        // Considerar janela de 30 dias
        const since = Date.now() - 30 * 24 * 60 * 60 * 1000;
        const filtered = evts.filter(e => new Date(e.created_date).getTime() >= since);

        setEvents(filtered);

        // Sessões únicas
        const sessions = new Set(filtered.map(e => e.session_id || `${e.user_email || 'anon'}-${new Date(e.created_date).toDateString()}`));
        setUniqueSessions(sessions.size);

        // Tempo por página e tempo total por sessão
        const pageDurMap = {};
        const sessionDurMap = {};
        filtered.forEach(e => {
          const d = Number(e.duration_ms) || 0;
          if (!pageDurMap[e.page]) pageDurMap[e.page] = { total: 0, count: 0 };
          pageDurMap[e.page].total += d;
          pageDurMap[e.page].count += 1;
          const sid = e.session_id || 'anon';
          sessionDurMap[sid] = (sessionDurMap[sid] || 0) + d;
        });

        const perPageArr = Object.entries(pageDurMap)
          .map(([page, v]) => ({ page, avgMs: v.total / Math.max(v.count, 1) }))
          .sort((a, b) => b.avgMs - a.avgMs)
          .slice(0, 10);
        setPerPage(perPageArr);

        // Tempo médio no site por sessão
        const sessionValues = Object.values(sessionDurMap);
        const avg = sessionValues.length ? Math.round(sessionValues.reduce((a, b) => a + b, 0) / sessionValues.length) : 0;
        setAvgTimeSite(avg);

        // Taxa de assertividade (IA) baseada na "confiança" da sugestão quando disponível
        const recentCalcs = calcs.filter(c => new Date(c.created_date).getTime() >= since);
        const total = recentCalcs.length;
        let confTotal = 0; let confOk = 0;
        recentCalcs.forEach(c => {
          const txt = (c.adjustment_reasoning || '').toLowerCase();
          if (txt.includes('confian')) {
            confTotal += 1;
            if (txt.includes('alta')) confOk += 1;
          }
        });
        const fallbackOk = recentCalcs.filter(c => !c.is_adjusted).length;
        const usedOk = confTotal > 0 ? confOk : fallbackOk;
        const usedTotal = confTotal > 0 ? confTotal : total;
        setAssertiveness({ total: usedTotal, ok: usedOk, rate: usedTotal ? Math.round((usedOk / usedTotal) * 100) : 0 });

        // ROI (30d): requer AppConfig com keys roi_marketing_spend e roi_avg_revenue_per_calc
        let spend = 0, avgRev = 0;
        if (Array.isArray(configs)) {
          const getVal = (k) => {
            const item = configs.find(c => c.key === k);
            try { return item ? Number(JSON.parse(item.value)) : 0; } catch { return item ? Number(item.value) : 0; }
          };
          spend = getVal('roi_marketing_spend');
          avgRev = getVal('roi_avg_revenue_per_calc');
        }
        const revenue = total * (avgRev || 0);
        const roiPct = spend > 0 ? Math.round(((revenue - spend) / spend) * 100) : 0;
        setRoi({ spend, revenue, roiPct });

        // Top 10 tecnologias (lasers)
        const techCount = {};
        recentCalcs.forEach(c => {
          const name = (c.laser_type === 'Outro' ? (c.other_laser_type || 'Outro') : (c.laser_type || 'Indefinido')).trim();
          techCount[name] = (techCount[name] || 0) + 1;
        });
        const topTechArr = Object.entries(techCount).map(([name, count]) => ({ name, count }))
          .sort((a,b) => b.count - a.count).slice(0, 10);
        setTopTech(topTechArr);

        // Procedimentos mais realizados
        const procCount = {};
        recentCalcs.forEach(c => {
          const name = (c.procedure_type === 'Outro' ? (c.other_procedure_type || 'Outro') : (c.procedure_type || 'Indefinido')).trim();
          procCount[name] = (procCount[name] || 0) + 1;
        });
        const topProcArr = Object.entries(procCount).map(([name, count]) => ({ name, count }))
          .sort((a,b) => b.count - a.count).slice(0, 10);
        setTopProcedures(topProcArr);

        // Nível de agressividade médio
        const mapAgg = { conservador: 1, moderado: 2, agressivo: 3 };
        const values = recentCalcs.map(c => mapAgg[(c.aggressiveness_level || '').toLowerCase()]).filter(Boolean);
        const avgVal = values.length ? (values.reduce((a,b)=>a+b,0)/values.length) : 0;
        const label = avgVal === 0 ? '-' : (avgVal < 1.5 ? 'Conservador' : (avgVal < 2.5 ? 'Moderado' : 'Agressivo'));
        setAvgAgg({ value: Math.round(avgVal*10)/10, label });

        // Média de cálculos por mês (últimos 6 meses)
        const since6m = Date.now() - 180 * 24 * 60 * 60 * 1000;
        const calcs6m = calcs.filter(c => new Date(c.created_date).getTime() >= since6m);
        const months = new Set();
        calcs6m.forEach(c => {
          const d = new Date(c.created_date);
          months.add(`${d.getFullYear()}-${d.getMonth()+1}`);
        });
        const avgMonth = months.size ? Math.round(calcs6m.length / months.size) : calcs6m.length;
        setAvgPerMonth(avgMonth);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const msToMin = (ms) => Math.round((ms || 0) / 1000 / 60);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Card className="bg-white/90 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-sm text-slate-600 flex items-center gap-2"><Users className="w-4 h-4"/> Visitantes (30d)</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-20"/> : <div className="text-3xl font-bold">{uniqueSessions}</div>}
          </CardContent>
        </Card>
        <Card className="bg-white/90 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-sm text-slate-600 flex items-center gap-2"><Clock className="w-4 h-4"/> Tempo médio no site</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-24"/> : <div className="text-3xl font-bold">{msToMin(avgTimeSite)} min</div>}
          </CardContent>
        </Card>
        <Card className="bg-white/90 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-sm text-slate-600 flex items-center gap-2"><TrendingUp className="w-4 h-4"/> Tempo por página (top 1)</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-full"/>
            ) : perPage[0] ? (
              <div>
                <div className="text-lg font-semibold break-all">{perPage[0].page}</div>
                <div className="text-2xl font-bold">{msToMin(perPage[0].avgMs)} min</div>
              </div>
            ) : (
              <div className="text-slate-500">Sem dados</div>
            )}
          </CardContent>
        </Card>
        <Card className="bg-white/90 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-sm text-slate-600 flex items-center gap-2"><Gauge className="w-4 h-4"/> Taxa de assertividade (IA)</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-24"/> : (
              <div className="flex items-end gap-2">
                <div className="text-3xl font-bold">{assertiveness.rate}%</div>
                <Badge className="bg-emerald-100 text-emerald-800">{assertiveness.ok}/{assertiveness.total} sem ajuste</Badge>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white/90 border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Top páginas por tempo médio (Geral)</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-6 w-full"/> )}</div>
          ) : perPage.length === 0 ? (
            <div className="text-slate-500">Sem dados suficientes.</div>
          ) : (
            <div className="space-y-2">
              {perPage.map((p, idx) => (
                <div key={p.page} className="flex items-center justify-between gap-4 p-2 rounded hover:bg-slate-50">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="w-8 justify-center">{idx + 1}</Badge>
                    <span className="font-mono break-all text-slate-700">{p.page}</span>
                  </div>
                  <span className="font-semibold">{msToMin(p.avgMs)} min</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* KPIs adicionais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mt-4">
        <Card className="bg-white/90 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-sm text-slate-600 flex items-center gap-2"><DollarSign className="w-4 h-4"/> ROI (30 dias)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{roi.roiPct}%</div>
            <div className="text-xs text-slate-500 mt-1">Receita: R${'{'}(roi.revenue||0).toLocaleString('pt-BR'){'}'} • Gasto: R${'{'}(roi.spend||0).toLocaleString('pt-BR'){'}'}</div>
          </CardContent>
        </Card>
        <Card className="bg-white/90 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-sm text-slate-600 flex items-center gap-2"><Calendar className="w-4 h-4"/> Média de cálculos/mês (6m)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{avgPerMonth}</div>
          </CardContent>
        </Card>
        <Card className="bg-white/90 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-sm text-slate-600 flex items-center gap-2"><TrendingUp className="w-4 h-4"/> Nível de agressividade médio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{avgAgg.value || 0}</div>
            <div className="text-xs text-slate-500 mt-1">{avgAgg.label}</div>
          </CardContent>
        </Card>
      </div>

      {/* Listas: Tecnologias e Procedimentos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mt-4">
        <Card className="bg-white/90 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2"><FlaskConical className="w-5 h-5"/> Top 10 Tecnologias (Lasers)</CardTitle>
          </CardHeader>
          <CardContent>
            {topTech.length === 0 ? (
              <div className="text-slate-500">Sem dados suficientes.</div>
            ) : (
              <div className="space-y-2">
                {topTech.map((t, i) => (
                  <div key={t.name + i} className="flex items-center justify-between gap-4 p-2 rounded hover:bg-slate-50">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="w-8 justify-center">{i+1}</Badge>
                      <span className="text-slate-700">{t.name}</span>
                    </div>
                    <span className="font-semibold">{t.count}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="bg-white/90 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2"><ListOrdered className="w-5 h-5"/> Procedimentos mais realizados</CardTitle>
          </CardHeader>
          <CardContent>
            {topProcedures.length === 0 ? (
              <div className="text-slate-500">Sem dados suficientes.</div>
            ) : (
              <div className="space-y-2">
                {topProcedures.map((p, i) => (
                  <div key={p.name + i} className="flex items-center justify-between gap-4 p-2 rounded hover:bg-slate-50">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="w-8 justify-center">{i+1}</Badge>
                      <span className="text-slate-700">{p.name}</span>
                    </div>
                    <span className="font-semibold">{p.count}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}