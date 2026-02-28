import React from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, Clock, Users, Gauge } from "lucide-react";

export default function SEOAnalytics() {
  const [loading, setLoading] = React.useState(true);
  const [events, setEvents] = React.useState([]);
  const [assertiveness, setAssertiveness] = React.useState({ total: 0, ok: 0, rate: 0 });
  const [perPage, setPerPage] = React.useState([]);
  const [uniqueSessions, setUniqueSessions] = React.useState(0);
  const [avgTimeSite, setAvgTimeSite] = React.useState(0);

  React.useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [evts, calcs] = await Promise.all([
          base44.entities.AnalyticsEvent.list('-created_date'),
          base44.entities.LaserCalculation.list('-created_date')
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

        // Taxa de assertividade (IA): % de cálculos não ajustados manualmente
        const recentCalcs = calcs.filter(c => new Date(c.created_date).getTime() >= since);
        const total = recentCalcs.length;
        const ok = recentCalcs.filter(c => !c.is_adjusted).length;
        setAssertiveness({ total, ok, rate: total ? Math.round((ok / total) * 100) : 0 });
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
          <CardTitle className="text-lg font-semibold">Top páginas por tempo médio</CardTitle>
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
    </div>
  );
}