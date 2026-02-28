import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Image as ImageIcon, Plus, Trash2, Edit2, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function BannerManager() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [bannerToDelete, setBannerToDelete] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  
  const [newBanner, setNewBanner] = useState({
    title: '',
    description: '',
    image_url: '',
    link_url: '',
    enabled: true,
    show_as_popup: false,
    show_in_dashboard: true,
    priority: 0,
    start_date: '',
    end_date: ''
  });

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await base44.entities.Banner.list('-priority', 50);
      setBanners(data);
    } catch (error) {
      console.error('Erro ao carregar banners:', error);
      setError('Não foi possível carregar os banners. Verifique sua conexão.');
      setBanners([]);
    }
    setLoading(false);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setNewBanner(prev => ({ ...prev, image_url: file_url }));
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      alert('Erro ao fazer upload da imagem. Tente novamente.');
    }
    setUploading(false);
  };

  const handleCreateBanner = async () => {
    if (!newBanner.title || !newBanner.image_url) {
      alert('Preencha pelo menos o título e a imagem.');
      return;
    }

    try {
      if (editingBanner) {
        await base44.entities.Banner.update(editingBanner.id, newBanner);
      } else {
        await base44.entities.Banner.create(newBanner);
      }
      
      setShowNewDialog(false);
      setEditingBanner(null);
      setNewBanner({
        title: '',
        description: '',
        image_url: '',
        link_url: '',
        enabled: true,
        show_as_popup: false,
        show_in_dashboard: true,
        priority: 0,
        start_date: '',
        end_date: ''
      });
      loadBanners();
      
      alert('Banner criado com sucesso! Use "Forçar Agora" para notificar usuários.');
    } catch (error) {
      console.error('Erro ao criar banner:', error);
      alert('Erro ao criar banner. Verifique os dados e tente novamente.');
    }
  };

  const handleEditBanner = (banner) => {
    setEditingBanner(banner);
    setNewBanner({
      title: banner.title,
      description: banner.description || '',
      image_url: banner.image_url,
      link_url: banner.link_url || '',
      enabled: banner.enabled,
      show_as_popup: banner.show_as_popup,
      show_in_dashboard: banner.show_in_dashboard,
      priority: banner.priority || 0,
      start_date: banner.start_date || '',
      end_date: banner.end_date || ''
    });
    setShowNewDialog(true);
  };

  const handleDeleteBanner = async () => {
    if (!bannerToDelete) return;
    
    try {
      await base44.entities.Banner.delete(bannerToDelete.id);
      setBannerToDelete(null);
      loadBanners();
    } catch (error) {
      console.error('Erro ao excluir banner:', error);
      alert('Erro ao excluir banner. Tente novamente.');
    }
  };

  const isActiveBanner = (banner) => {
    if (!banner.enabled) return false;
    
    const now = new Date();
    if (banner.start_date && new Date(banner.start_date) > now) return false;
    if (banner.end_date && new Date(banner.end_date) < now) return false;
    
    return true;
  };

  return (
    <Card className="mb-8 bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200 shadow-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500 rounded-lg">
              <ImageIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl text-orange-900">
                Gestão de Banners
              </CardTitle>
              <p className="text-sm text-orange-700 mt-1">
                Crie anúncios que aparecem no Dashboard e como Pop-up
              </p>
            </div>
          </div>
          <Dialog open={showNewDialog} onOpenChange={(open) => {
            setShowNewDialog(open);
            if (!open) {
              setEditingBanner(null);
              setNewBanner({
                title: '',
                description: '',
                image_url: '',
                link_url: '',
                enabled: true,
                show_as_popup: false,
                show_in_dashboard: true,
                priority: 0,
                start_date: '',
                end_date: ''
              });
            }
          }}>
            <DialogTrigger asChild>
              <Button className="bg-orange-600 hover:bg-orange-700">
                <Plus className="w-4 h-4 mr-2" />
                Novo Banner
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingBanner ? 'Editar Banner' : 'Novo Banner'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Título *</Label>
                  <Input
                    value={newBanner.title}
                    onChange={(e) => setNewBanner({...newBanner, title: e.target.value})}
                    placeholder="Ex: Nova Promoção!"
                  />
                </div>
                
                <div>
                  <Label>Descrição</Label>
                  <Textarea
                    value={newBanner.description}
                    onChange={(e) => setNewBanner({...newBanner, description: e.target.value})}
                    placeholder="Descrição do banner..."
                    className="h-20"
                  />
                </div>

                <div>
                  <Label>Imagem do Banner *</Label>
                  <div className="mt-2 space-y-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                    />
                    {uploading && <p className="text-sm text-slate-500">Fazendo upload...</p>}
                    {newBanner.image_url && (
                      <div className="relative w-full h-48 rounded-lg overflow-hidden border">
                        <img 
                          src={newBanner.image_url} 
                          alt="Preview" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <Label>Link de Redirecionamento (opcional)</Label>
                  <Input
                    value={newBanner.link_url}
                    onChange={(e) => setNewBanner({...newBanner, link_url: e.target.value})}
                    placeholder="https://exemplo.com"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Data de Início (opcional)</Label>
                    <Input
                      type="date"
                      value={newBanner.start_date}
                      onChange={(e) => setNewBanner({...newBanner, start_date: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Data de Fim (opcional)</Label>
                    <Input
                      type="date"
                      value={newBanner.end_date}
                      onChange={(e) => setNewBanner({...newBanner, end_date: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <Label>Prioridade (maior = aparece primeiro)</Label>
                  <Input
                    type="number"
                    value={newBanner.priority}
                    onChange={(e) => setNewBanner({...newBanner, priority: parseInt(e.target.value) || 0})}
                  />
                </div>

                <div className="space-y-3 border-t pt-4">
                  <div className="flex items-center justify-between">
                    <Label>Exibir no Dashboard</Label>
                    <Switch
                      checked={newBanner.show_in_dashboard}
                      onCheckedChange={(checked) => setNewBanner({...newBanner, show_in_dashboard: checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Exibir como Pop-up</Label>
                    <Switch
                      checked={newBanner.show_as_popup}
                      onCheckedChange={(checked) => setNewBanner({...newBanner, show_as_popup: checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Banner Ativo</Label>
                    <Switch
                      checked={newBanner.enabled}
                      onCheckedChange={(checked) => setNewBanner({...newBanner, enabled: checked})}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowNewDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateBanner} className="bg-orange-600" disabled={uploading}>
                  {editingBanner ? 'Atualizar' : 'Criar'} Banner
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert className="mb-4 bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="text-center py-8 text-slate-500">
            Carregando banners...
          </div>
        ) : banners.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            Nenhum banner criado ainda. Clique em "Novo Banner" para começar.
          </div>
        ) : (
          <div className="space-y-4">
            {banners.map(banner => (
              <Card key={banner.id} className={`bg-white ${isActiveBanner(banner) ? 'border-orange-200' : 'border-slate-200 opacity-60'}`}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    {/* Preview da Imagem */}
                    <div className="w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden border">
                      <img 
                        src={banner.image_url} 
                        alt={banner.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Informações */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-bold text-slate-900">{banner.title}</h3>
                          {banner.description && (
                            <p className="text-sm text-slate-600 mt-1">{banner.description}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="icon" onClick={() => handleEditBanner(banner)}>
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button variant="destructive" size="icon" onClick={() => setBannerToDelete(banner)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-2">
                        <Badge variant={banner.enabled ? "default" : "secondary"}>
                          {banner.enabled ? 'Ativo' : 'Inativo'}
                        </Badge>
                        {banner.show_in_dashboard && (
                          <Badge className="bg-blue-100 text-blue-800">Dashboard</Badge>
                        )}
                        {banner.show_as_popup && (
                          <Badge className="bg-purple-100 text-purple-800">Pop-up</Badge>
                        )}
                        <Badge variant="outline">Prioridade: {banner.priority}</Badge>
                      </div>

                      {banner.link_url && (
                        <p className="text-xs text-slate-500 mb-2">
                          Link: <a href={banner.link_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{banner.link_url}</a>
                        </p>
                      )}

                      <div className="flex gap-4 text-xs text-slate-500">
                        {banner.start_date && <span>Início: {new Date(banner.start_date).toLocaleDateString()}</span>}
                        {banner.end_date && <span>Fim: {new Date(banner.end_date).toLocaleDateString()}</span>}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
          <p className="text-sm text-orange-800">
            <strong>💡 Como usar:</strong> Crie banners para promover produtos, eventos ou novidades. 
            Após criar, use <strong>"Forçar Agora"</strong> na seção de atualizações para que 
            todos os usuários vejam os novos banners imediatamente.
          </p>
        </div>
      </CardContent>

      {/* Alert de Exclusão */}
      <AlertDialog open={!!bannerToDelete} onOpenChange={() => setBannerToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Banner?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o banner "<strong>{bannerToDelete?.title}</strong>"? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteBanner} className="bg-red-600">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}