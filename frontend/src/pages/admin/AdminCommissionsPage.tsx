import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import api from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Toggle } from '../../components/ui/Toggle';

interface Commission {
  id: string;
  name: string;
  targetType: string;
  targetId?: string;
  payInRate: number;
  payOutRate: number;
  isActive: boolean;
}

export function AdminCommissionsPage() {
  const [rates, setRates] = useState<Commission[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', targetType: 'GLOBAL', payInRate: '1.5', payOutRate: '1.0' });
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    api.get('/api/admin/commissions').then((r) => setRates(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/api/admin/commissions', {
      ...form,
      payInRate: parseFloat(form.payInRate),
      payOutRate: parseFloat(form.payOutRate),
    });
    setModalOpen(false);
    fetchData();
  };

  const toggleActive = async (rate: Commission) => {
    await api.patch(`/api/admin/commissions/${rate.id}`, { isActive: !rate.isActive });
    fetchData();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Ставки комиссий</h1>
          <p className="text-sm text-gray-500 mt-1">Pay In / Pay Out % — глобальные или индивидуальные</p>
        </div>
        <Button onClick={() => setModalOpen(true)}><Plus size={18} /> Добавить ставку</Button>
      </div>

      <div className="bg-bg-card rounded-xl border border-gray-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-700 text-gray-400 text-left">
              <th className="px-4 py-3">Название</th>
              <th className="px-4 py-3">Тип</th>
              <th className="px-4 py-3">Pay In %</th>
              <th className="px-4 py-3">Pay Out %</th>
              <th className="px-4 py-3">Активна</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">Загрузка...</td></tr>
            ) : rates.map((r) => (
              <tr key={r.id} className="border-b border-gray-800 hover:bg-gray-800/30">
                <td className="px-4 py-3 text-gray-200">{r.name}</td>
                <td className="px-4 py-3"><span className="px-2 py-0.5 bg-accent/10 text-accent rounded text-xs">{r.targetType}</span></td>
                <td className="px-4 py-3 text-gray-200">{r.payInRate}%</td>
                <td className="px-4 py-3 text-gray-200">{r.payOutRate}%</td>
                <td className="px-4 py-3"><Toggle checked={r.isActive} onChange={() => toggleActive(r)} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Новая ставка">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Название" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <select value={form.targetType} onChange={(e) => setForm({ ...form, targetType: e.target.value })}
            className="w-full px-3 py-2 bg-bg-primary border border-gray-700 rounded-lg text-gray-100">
            <option value="GLOBAL">Глобальная</option>
            <option value="TRADER">Трейдер</option>
            <option value="MERCHANT">Мерчант</option>
          </select>
          <Input label="Pay In (%)" type="number" step="0.1" value={form.payInRate} onChange={(e) => setForm({ ...form, payInRate: e.target.value })} />
          <Input label="Pay Out (%)" type="number" step="0.1" value={form.payOutRate} onChange={(e) => setForm({ ...form, payOutRate: e.target.value })} />
          <Button type="submit" className="w-full">Создать</Button>
        </form>
      </Modal>
    </div>
  );
}
