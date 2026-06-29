import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import api from '../../lib/api';
import type { Wallet } from '../../types/admin';
import type { AdminUser } from '../../types/admin';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Toggle } from '../../components/ui/Toggle';

export function AdminWalletsPage() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [traders, setTraders] = useState<AdminUser[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ traderId: '', address: '', network: 'TRC20', label: '' });
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    Promise.all([
      api.get('/api/admin/wallets'),
      api.get('/api/admin/users'),
    ]).then(([w, u]) => {
      setWallets(w.data);
      setTraders(u.data.filter((x: AdminUser) => x.role === 'TRADER'));
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/api/admin/wallets', form);
    setModalOpen(false);
    setForm({ traderId: '', address: '', network: 'TRC20', label: '' });
    fetchData();
  };

  const toggleActive = async (wallet: Wallet) => {
    await api.patch(`/api/admin/wallets/${wallet.id}`, { isActive: !wallet.isActive });
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить кошелёк?')) return;
    await api.delete(`/api/admin/wallets/${id}`);
    fetchData();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Кошельки трейдеров</h1>
          <p className="text-sm text-gray-500 mt-1">Только админ назначает USDT-кошельки</p>
        </div>
        <Button onClick={() => setModalOpen(true)}><Plus size={18} /> Назначить кошелёк</Button>
      </div>

      <div className="bg-bg-card rounded-xl border border-gray-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-700 text-gray-400 text-left">
              <th className="px-4 py-3">Трейдер</th>
              <th className="px-4 py-3">Адрес</th>
              <th className="px-4 py-3">Сеть</th>
              <th className="px-4 py-3">Метка</th>
              <th className="px-4 py-3">Активен</th>
              <th className="px-4 py-3">Действия</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">Загрузка...</td></tr>
            ) : wallets.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">Нет кошельков</td></tr>
            ) : wallets.map((w) => (
              <tr key={w.id} className="border-b border-gray-800 hover:bg-gray-800/30">
                <td className="px-4 py-3 text-gray-200">{w.trader?.email || w.traderId.slice(0, 8)}</td>
                <td className="px-4 py-3 font-mono text-xs text-gray-300 break-all">{w.address}</td>
                <td className="px-4 py-3"><span className="px-2 py-0.5 bg-accent/10 text-accent rounded text-xs">{w.network}</span></td>
                <td className="px-4 py-3 text-gray-400">{w.label || '—'}</td>
                <td className="px-4 py-3"><Toggle checked={w.isActive} onChange={() => toggleActive(w)} /></td>
                <td className="px-4 py-3">
                  <button onClick={() => handleDelete(w.id)} className="p-1.5 hover:bg-danger/10 rounded text-danger">
                    <Trash2 size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Назначить кошелёк трейдеру">
        <form onSubmit={handleCreate} className="space-y-4">
          <Select label="Трейдер *" value={form.traderId} onChange={(e) => setForm({ ...form, traderId: e.target.value })}
            options={[{ value: '', label: '— Выберите —' }, ...traders.map((t) => ({ value: t.id, label: t.email }))]} />
          <Input label="USDT адрес *" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required />
          <Select label="Сеть" value={form.network} onChange={(e) => setForm({ ...form, network: e.target.value })}
            options={[{ value: 'TRC20', label: 'TRC20' }, { value: 'ERC20', label: 'ERC20' }, { value: 'BEP20', label: 'BEP20' }]} />
          <Input label="Метка" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="Основной" />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Отмена</Button>
            <Button type="submit">Назначить</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
