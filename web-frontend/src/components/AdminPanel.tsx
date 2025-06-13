import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Upload,
  Image,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Palette,
  Type,
  Link,
  Grid,
  Monitor
} from 'lucide-react';
import apiService from '../services/api';
import { LandingPageConfig, LandingPageBanner, ServiceShortcut } from '../types';

interface AdminPanelProps {
  onClose?: () => void;
}

type TabType = 'config' | 'banners' | 'shortcuts';

const AdminPanel: React.FC<AdminPanelProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('config');
  const [config, setConfig] = useState<LandingPageConfig | null>(null);
  const [banners, setBanners] = useState<LandingPageBanner[]>([]);
  const [shortcuts, setShortcuts] = useState<ServiceShortcut[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingBanner, setEditingBanner] = useState<LandingPageBanner | null>(null);
  const [editingShortcut, setEditingShortcut] = useState<ServiceShortcut | null>(null);
  const [showBannerForm, setShowBannerForm] = useState(false);
  const [showShortcutForm, setShowShortcutForm] = useState(false);

  useEffect(() => {
    loadData();
  }, []);
  const loadData = async () => {
    try {
      setLoading(true);
      const response = await apiService.getLandingPageConfig();
      
      setConfig(response.config);
      setBanners(response.banners);
      setShortcuts(response.shortcuts);
    } catch (err: any) {
      setError('Data loading error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };
  const saveConfig = async (updatedConfig: Partial<LandingPageConfig>) => {
    try {
      setSaving(true);
      const saved = await apiService.updateLandingPageConfig(updatedConfig);
      setConfig(saved.config);
      setError(null);
    } catch (err: any) {
      setError('Configuration could not be saved: ' + err.message);
    } finally {
      setSaving(false);
    }
  };
  const saveBanner = async (banner: Partial<LandingPageBanner>) => {
    try {
      setSaving(true);
      let savedBanner: LandingPageBanner;
      
      if (banner.id) {
        savedBanner = await apiService.updateLandingPageBanner(banner.id, banner);
        setBanners(prev => prev.map(b => b.id === banner.id ? savedBanner : b));
      } else {
        savedBanner = await apiService.createLandingPageBanner(banner);
        setBanners(prev => [...prev, savedBanner]);
      }
      
      setEditingBanner(null);
      setShowBannerForm(false);
      setError(null);
    } catch (err: any) {
      setError('Banner kaydedilemedi: ' + err.message);
    } finally {
      setSaving(false);
    }
  };
  const saveShortcut = async (shortcut: Partial<ServiceShortcut>) => {
    try {
      setSaving(true);
      let savedShortcut: ServiceShortcut;
      
      if (shortcut.id) {
        savedShortcut = await apiService.updateServiceShortcut(shortcut.id, shortcut);
        setShortcuts(prev => prev.map(s => s.id === shortcut.id ? savedShortcut : s));
      } else {
        savedShortcut = await apiService.createServiceShortcut(shortcut);
        setShortcuts(prev => [...prev, savedShortcut]);
      }
      
      setEditingShortcut(null);
      setShowShortcutForm(false);
      setError(null);    } catch (err: any) {
      setError('Shortcut could not be saved: ' + err.message);
    } finally {
      setSaving(false);
    }
  };
  const deleteBanner = async (id: number) => {
    if (!window.confirm('Bu banner\'ı silmek istediğinizden emin misiniz?')) return;
    
    try {
      await apiService.deleteLandingPageBanner(id);
      setBanners(prev => prev.filter(b => b.id !== id));
    } catch (err: any) {
      setError('Banner silinemedi: ' + err.message);
    }
  };
  const deleteShortcut = async (id: number) => {
    if (!window.confirm('Bu kısayolu silmek istediğinizden emin misiniz?')) return;
    
    try {
      await apiService.deleteServiceShortcut(id);
      setShortcuts(prev => prev.filter(s => s.id !== id));
    } catch (err: any) {
      setError('Kısayol silinemedi: ' + err.message);
    }
  };

  const toggleBannerStatus = async (id: number, active: boolean) => {
    try {
      const updated = await apiService.toggleLandingPageBanner(id, active);
      setBanners(prev => prev.map(b => b.id === id ? updated : b));
    } catch (err: any) {
      setError('Banner durumu değiştirilemedi: ' + err.message);
    }
  };

  const toggleShortcutStatus = async (id: number, active: boolean) => {
    try {
      const updated = await apiService.toggleServiceShortcut(id, active);
      setShortcuts(prev => prev.map(s => s.id === id ? updated : s));
    } catch (err: any) {
      setError('Kısayol durumu değiştirilemedi: ' + err.message);
    }
  };

  const reorderBanners = async (id: number, direction: 'up' | 'down') => {
    try {
      const updated = await apiService.reorderLandingPageBanner(id, direction);
      setBanners(updated);
    } catch (err: any) {
      setError('Banner sıralaması değiştirilemedi: ' + err.message);
    }
  };

  const reorderShortcuts = async (id: number, direction: 'up' | 'down') => {
    try {
      const updated = await apiService.reorderServiceShortcut(id, direction);
      setShortcuts(updated);
    } catch (err: any) {
      setError('Kısayol sıralaması değiştirilemedi: ' + err.message);
    }
  };

  const renderConfigTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-800 flex items-center">
        <Settings className="w-5 h-5 mr-2" />
        Genel Yapılandırma
      </h3>
      
      {config && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Otel Başlığı
            </label>
            <input
              type="text"
              value={config.hotelTitle}
              onChange={(e) => setConfig({ ...config, hotelTitle: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hoş Geldin Başlığı
            </label>
            <input
              type="text"
              value={config.welcomeHeading}
              onChange={(e) => setConfig({ ...config, welcomeHeading: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hoş Geldin Alt Başlığı
            </label>
            <textarea
              value={config.welcomeSubtitle}
              onChange={(e) => setConfig({ ...config, welcomeSubtitle: e.target.value })}
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Asistan Yazısı
            </label>
            <input
              type="text"
              value={config.assistantPrompt}
              onChange={(e) => setConfig({ ...config, assistantPrompt: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Asistan Buton Metni
            </label>
            <input
              type="text"
              value={config.assistantButtonText}
              onChange={(e) => setConfig({ ...config, assistantButtonText: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ana Renk
            </label>
            <div className="flex space-x-2">
              <input
                type="color"
                value={config.primaryColor}
                onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                className="w-12 h-12 border border-gray-300 rounded-lg cursor-pointer"
              />
              <input
                type="text"
                value={config.primaryColor}
                onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              İkincil Renk
            </label>
            <div className="flex space-x-2">
              <input
                type="color"
                value={config.secondaryColor}
                onChange={(e) => setConfig({ ...config, secondaryColor: e.target.value })}
                className="w-12 h-12 border border-gray-300 rounded-lg cursor-pointer"
              />
              <input
                type="text"
                value={config.secondaryColor}
                onChange={(e) => setConfig({ ...config, secondaryColor: e.target.value })}
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      )}
      
      <div className="flex justify-end">
        <button
          onClick={() => config && saveConfig(config)}
          disabled={saving}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Kaydediliyor...' : 'Kaydet'}</span>
        </button>
      </div>
    </div>
  );

  const renderBannersTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <Image className="w-5 h-5 mr-2" />
          Banner Yönetimi
        </h3>
        <button
          onClick={() => setShowBannerForm(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Yeni Banner</span>
        </button>
      </div>
      
      <div className="grid gap-4">
        {banners.map((banner) => (
          <div key={banner.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800">{banner.title}</h4>
                <p className="text-sm text-gray-600">{banner.subtitle}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    banner.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {banner.active ? 'Aktif' : 'Pasif'}
                  </span>
                  <span className="text-xs text-gray-500">
                    Sıra: {banner.displayOrder}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => reorderBanners(banner.id!, 'up')}
                  className="p-1 hover:bg-gray-100 rounded"
                  title="Yukarı taşı"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => reorderBanners(banner.id!, 'down')}
                  className="p-1 hover:bg-gray-100 rounded"
                  title="Aşağı taşı"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>
                <button
                  onClick={() => toggleBannerStatus(banner.id!, !banner.active)}
                  className="p-1 hover:bg-gray-100 rounded"
                  title={banner.active ? 'Gizle' : 'Göster'}
                >
                  {banner.active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setEditingBanner(banner)}
                  className="p-1 hover:bg-blue-100 rounded text-blue-600"
                  title="Düzenle"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteBanner(banner.id!)}
                  className="p-1 hover:bg-red-100 rounded text-red-600"
                  title="Sil"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderShortcutsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <Grid className="w-5 h-5 mr-2" />
          Servis Kısayolları
        </h3>
        <button
          onClick={() => setShowShortcutForm(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Yeni Kısayol</span>
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {shortcuts.map((shortcut) => (
          <div key={shortcut.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${shortcut.colorCode}20` }}
              >
                <span style={{ color: shortcut.colorCode }}>
                  {shortcut.iconName}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => reorderShortcuts(shortcut.id!, 'up')}
                  className="p-1 hover:bg-gray-100 rounded"
                  title="Yukarı taşı"
                >
                  <ArrowUp className="w-3 h-3" />
                </button>
                <button
                  onClick={() => reorderShortcuts(shortcut.id!, 'down')}
                  className="p-1 hover:bg-gray-100 rounded"
                  title="Aşağı taşı"
                >
                  <ArrowDown className="w-3 h-3" />
                </button>
              </div>
            </div>
            
            <h4 className="font-semibold text-gray-800 mb-1">{shortcut.displayName}</h4>
            <p className="text-sm text-gray-600 mb-2">{shortcut.description}</p>
            
            <div className="flex items-center justify-between">
              <span className={`px-2 py-1 rounded text-xs ${
                shortcut.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {shortcut.active ? 'Aktif' : 'Pasif'}
              </span>
              
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => toggleShortcutStatus(shortcut.id!, !shortcut.active)}
                  className="p-1 hover:bg-gray-100 rounded"
                  title={shortcut.active ? 'Gizle' : 'Göster'}
                >
                  {shortcut.active ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                </button>
                <button
                  onClick={() => setEditingShortcut(shortcut)}
                  className="p-1 hover:bg-blue-100 rounded text-blue-600"
                  title="Düzenle"
                >
                  <Edit className="w-3 h-3" />
                </button>
                <button
                  onClick={() => deleteShortcut(shortcut.id!)}
                  className="p-1 hover:bg-red-100 rounded text-red-600"
                  title="Sil"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Monitor className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">Admin Panel</h2>
                <p className="text-blue-100">Landing page yönetimi</p>
              </div>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 m-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex space-x-8 px-6">
            {[
              { key: 'config', label: 'Yapılandırma', icon: Settings },
              { key: 'banners', label: 'Bannerlar', icon: Image },
              { key: 'shortcuts', label: 'Kısayollar', icon: Grid }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as TabType)}
                  className={`
                    flex items-center space-x-2 py-4 px-2 border-b-2 transition-colors
                    ${activeTab === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {activeTab === 'config' && renderConfigTab()}
          {activeTab === 'banners' && renderBannersTab()}
          {activeTab === 'shortcuts' && renderShortcutsTab()}
        </div>
      </motion.div>
    </div>
  );
};

export default AdminPanel;
