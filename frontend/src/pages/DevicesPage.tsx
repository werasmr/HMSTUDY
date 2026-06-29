import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import api from '../lib/api';
import type { Device } from '../types';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Toggle } from '../components/ui/Toggle';
import { formatDate } from '../lib/utils';

export function DevicesPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchDevices = () => {
    api.get('/api/devices').then((res) => setDevices(res.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchDevices(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/api/devices', { name });
    setName('');
    setModalOpen(false);
    fetchDevices();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить устройство?')) return;
    await api.delete(`/api/devices/${id}`);
    fetchDevices();
  };

  const toggleOnline = async (device: Device) => {
    await api.patch(`/api/devices/${device.id}`, { isOnline: !device.isOnline });
    fetchDevices();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-100">Устройства</h1>
        <Button onClick={() => setModalOpen(true)}><Plus size={18} /> Добавить</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full text-center py-12 text-gray-500">Загрузка...</div>
        ) : devices.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500 bg-bg-card rounded-xl border border-gray-700">
            Нет устройств
          </div>
        ) : devices.map((device) => (
          <div key={device.id} className="bg-bg-card rounded-xl border border-gray-700 p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-medium text-gray-200">{device.name}</h3>
                <p className="text-xs text-gray-500 font-mono mt-1">{device.token.slice(0, 16)}...</p>
              </div>
              <button onClick={() => handleDelete(device.id)} className="text-gray-500 hover:text-danger">
                <Trash2 size={16} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-medium ${device.isOnline ? 'text-success' : 'text-gray-500'}`}>
                {device.isOnline ? 'Онлайн' : 'Оффлайн'}
              </span>
              <Toggle checked={device.isOnline} onChange={() => toggleOnline(device)} />
            </div>
            {device.lastSeen && (
              <p className="text-xs text-gray-600 mt-2">Последний раз: {formatDate(device.lastSeen)}</p>
            )}
          </div>
        ))}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Добавить устройство">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Название" value={name} onChange={(e) => setName(e.target.value)} placeholder="iPhone 15 Pro" required />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Отмена</Button>
            <Button type="submit">Добавить</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
