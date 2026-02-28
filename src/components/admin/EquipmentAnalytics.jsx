import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Zap, Users, DollarSign, Search, Eye, TrendingUp, BarChart3, Gauge } from "lucide-react";
import { LaserCalculation } from "@/entities/LaserCalculation";
import { User } from "@/entities/User";

// Preços estimados dos equipamentos (em R$)
const EQUIPMENT_PRICES = {
  "GentleMax Pro": 450000,
  "Vbeam Pro": 380000,
  "eCO2": 320000,
  "Elite+": 420000,
  "PicoSure": 550000,
  "PicoWay": 580000,
  "M22": 350000,
  "Stellar M22": 400000,
  "UltraPulse": 380000,
  "SP Dynamis": 520000,
  "LightWalker": 480000,
  "StarWalker": 500000,
  "Joule": 450000,
  "ProFractional": 280000,
  "excel V": 320000,
  "Enlighten": 480000,
  "Clarity II": 350000,
  "Spectra": 280000,
  "SmartXide DOT": 320000,
  "SmartXide2": 350000,
  "Harmony XL Pro": 380000,
  "Soprano ICE": 250000,
  "Soprano ICE Platinum": 380000,
  "MeDioStar NeXT": 280000,
  "LightSheer Quattro": 320000,
  "SPLENDOR X": 420000,
  "Morpheus8": 180000,
  "Potenza": 200000,
  "Lumecca": 120000,
  "Fraxel": 350000,
  "Thermage": 280000,
  "Fotona4D": 480000,
  "CO2RE": 300000,
  "Broadband Light (BBL)": 280000,
  // Preço padrão para equipamentos não listados
  "default": 200000
};

export default function EquipmentAnalytics() {
  const [loading, setLoading] = useState(true);
  const [calculations, setCalculations] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState(false);

  // Estatísticas gerais
  const [stats, setStats] = useState({
    totalEquipments: 0,
    uniqueEquipments: 0,
    totalInvestment: 0,
    avgAggressiveness: 0,
    topEquipments: [],
    userProfiles: []
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [calcs, allUsers] = await Promise.all([
        LaserCalculation.list(),
        User.list()
      ]);
      
      setCalculations(calcs);
      setUsers(allUsers.filter(u => !u.is_trial));
      
      processStats(calcs, allUsers.filter(u => !u.is_trial));
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
    setLoading(false);
  };

  const getEquipmentPrice = (equipmentName) => {
    if (!equipmentName) return 0;
    return EQUIPMENT_PRICES[equipmentName] || EQUIPMENT_PRICES.default;
  };

  const processStats = (calcs, allUsers) => {
    // Agrupar equipamentos por usuário
    const userEquipments = {};
    const equipmentCounts = {};
    let totalAggressiveness = 0;
    let aggressivenessCount = 0;

    calcs.forEach(calc => {
      const userId = calc.created_by;
      const equipment = calc.laser_type;
      
      if (!userId || !equipment) return;

      // Contagem de equipamentos por usuário
      if (!userEquipments[userId]) {
        userEquipments[userId] = new Set();
      }
      userEquipments[userId].add(equipment);

      // Contagem geral de equipamentos
      equipmentCounts[equipment] = (equipmentCounts[equipment] || 0) + 1;

      // Média de agressividade
      if (calc.aggressiveness_level) {
        const level = { conservador: 1, moderado: 2, agressivo: 3 }[calc.aggressiveness_level] || 2;
        totalAggressiveness += level;
        aggressivenessCount++;
      }
    });

    // Top equipamentos
    const topEquipments = Object.entries(equipmentCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count, price: getEquipmentPrice(name) }));

    // Calcular perfil de cada usuário
    const userProfiles = allUsers.map(user => {
      const userCalcs = calcs.filter(c => c.created_by === user.email);
      const equipments = [...new Set(userCalcs.map(c => c.laser_type).filter(Boolean))];
      
      // Calcular agressividade média do usuário
      let userAggressiveness = 0;
      let userAggCount = 0;
      userCalcs.forEach(calc => {
        if (calc.aggressiveness_level) {
          userAggressiveness += { conservador: 1, moderado: 2, agressivo: 3 }[calc.aggressiveness_level] || 2;
          userAggCount++;
        }
      });
      const avgAgg = userAggCount > 0 ? userAggressiveness / userAggCount : 0;

      // Calcular investimento total
      const totalInvestment = equipments.reduce((sum, eq) => sum + getEquipmentPrice(eq), 0);

      // Determinar perfil
      let profile = "Iniciante";
      if (avgAgg >= 2.5) profile = "Agressivo";
      else if (avgAgg >= 1.8) profile = "Moderado";
      else if (avgAgg > 0) profile = "Conservador";

      return {
        ...user,
        equipments,
        equipmentCount: equipments.length,
        totalInvestment,
        avgAggressiveness: avgAgg,
        profile,
        totalCalculations: userCalcs.length
      };
    }).filter(u => u.equipmentCount > 0);

    // Total de investimento (soma de todos os usuários)
    const totalInvestment = userProfiles.reduce((sum, u) => sum + u.totalInvestment, 0);

    // Total de equipamentos únicos
    const allEquipments = new Set(calcs.map(c => c.laser_type).filter(Boolean));

    setStats({
      totalEquipments: calcs.filter(c => c.laser_type).length,
      uniqueEquipments: allEquipments.size,
      totalInvestment,
      avgAggressiveness: aggressivenessCount > 0 ? (totalAggressiveness / aggressivenessCount).toFixed(2) : 0,
      topEquipments,
      userProfiles: userProfiles.sort((a, b) => b.totalInvestment - a.totalInvestment)
    });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const getProfileColor = (profile) => {
    const colors = {
      "Agressivo": "bg-red-100 text-red-800",
      "Moderado": "bg-yellow-100 text-yellow-800",
      "Conservador": "bg-green-100 text-green-800",
      "Iniciante": "bg-slate-100 text-slate-600"
    };
    return colors[profile] || "bg-slate-100 text-slate-600";
  };

  const filteredProfiles = stats.userProfiles.filter(u => 
    u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0">
        <CardContent className="p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-600">Carregando dados de equipamentos...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
          <div className="flex items-center gap-3">
            <Zap className="w-6 h-6" />
            <CardTitle className="text-xl">Analytics de Equipamentos</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {/* Estatísticas Gerais */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Zap className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Equipamentos Únicos</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.uniqueEquipments}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Investimento Total</p>
                  <p className="text-xl font-bold text-slate-900">{formatCurrency(stats.totalInvestment)}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Usuários com Equipamentos</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.userProfiles.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Gauge className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Agressividade Média</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.avgAggressiveness}/3</p>
                </div>
              </div>
            </div>
          </div>

          {/* Top Equipamentos */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Top 10 Equipamentos Mais Utilizados
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {stats.topEquipments.map((eq, idx) => (
                <div key={eq.name} className="flex items-center justify-between bg-white p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 flex items-center justify-center bg-blue-100 text-blue-700 rounded-full text-sm font-bold">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="font-medium text-slate-900">{eq.name}</p>
                      <p className="text-xs text-slate-500">{formatCurrency(eq.price)}</p>
                    </div>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">
                    {eq.count} usos
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Busca de Usuários */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                placeholder="Buscar profissional por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Lista de Usuários com Equipamentos */}
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {filteredProfiles.map((user) => (
              <div key={user.id} className="flex items-center justify-between bg-white p-4 rounded-lg border hover:shadow-md transition-shadow">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-slate-900">{user.full_name || 'Sem nome'}</p>
                    <Badge className={getProfileColor(user.profile)}>{user.profile}</Badge>
                  </div>
                  <p className="text-sm text-slate-500">{user.email}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <span className="flex items-center gap-1">
                      <Zap className="w-4 h-4 text-blue-500" />
                      {user.equipmentCount} equipamentos
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4 text-green-500" />
                      {formatCurrency(user.totalInvestment)}
                    </span>
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4 text-purple-500" />
                      {user.totalCalculations} cálculos
                    </span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setSelectedUser(user); setShowUserDetails(true); }}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Ver
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modal de Detalhes do Usuário */}
      <Dialog open={showUserDetails} onOpenChange={setShowUserDetails}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-600" />
              Equipamentos de {selectedUser?.full_name}
            </DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-600">Total de Equipamentos</p>
                  <p className="text-2xl font-bold text-blue-900">{selectedUser.equipmentCount}</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-sm text-green-600">Investimento Estimado</p>
                  <p className="text-lg font-bold text-green-900">{formatCurrency(selectedUser.totalInvestment)}</p>
                </div>
              </div>

              <div className="bg-orange-50 p-3 rounded-lg">
                <p className="text-sm text-orange-600">Perfil de Agressividade</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={getProfileColor(selectedUser.profile)}>{selectedUser.profile}</Badge>
                  <span className="text-sm text-orange-700">
                    (Média: {selectedUser.avgAggressiveness.toFixed(2)}/3)
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Equipamentos Utilizados:</h4>
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {selectedUser.equipments.map((eq, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-slate-50 p-2 rounded">
                      <span className="font-medium">{eq}</span>
                      <span className="text-sm text-slate-500">{formatCurrency(getEquipmentPrice(eq))}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}