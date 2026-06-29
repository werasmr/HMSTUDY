import { useEffect, useState } from 'react';
import { Plus, Ban, CheckCircle, Wallet } from 'lucide-react';
import api from '../../lib/api';
import type { AdminUser } from '../../types/admin';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { formatAmount } from '../../lib/utils';

export function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [balanceModal, setBalanceModal] = useState<AdminUser | null>(null);
  const [form, setForm] = useState({ email: '', password: '', role: 'TRADER', balance: '0', insuranceDeposit: '100' });
  const [balanceForm, setBalanceForm] = useState({ amount: '', type: 'DEPOSIT' });
  const [loading, setLoading] = useState(true);

  const fetchUsers = () => {
    api.get('/api/admin/users').then((r) => setUsers(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/api/admin/users', form);
    setModalOpen(false);
    fetchUsers();
  };

  const toggleActive = async (user: AdminUser) => {
    await api.patch(`/api/admin/users/${user.id}`, { isActive: !user.isActive });
    fetchUsers();
  };

  const adjustBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!balanceModal) return;
    await api.post(`/api/admin/users/${balanceModal.id}/balance`, balanceForm);
    setBalanceModal(null);
    fetchUsers();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-100">Пользователи</h1>
        <Button onClick={() => setModalOpen(true)}><Plus size={18} /> Создать</Button>
      </div>

      <div className="bg-bg-card rounded-xl border border-gray-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-700 text-gray-400 text-left">
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Роль</th>
              <th className="px-4 py-3">Баланс</th>
              <th className="px-4 py-3">Заморожено</th>
              <th className="px-4 py-3">Страховой</th>
              <th className="px-4 py-3">Статус</th>
              <th className="px-4 py-3">Действия</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">Загрузка...</td></tr>
            ) : users.map((u) => (
              <tr key={u.id} className="border-b border-gray-800 hover:bg-gray-800/30">
                <td className="px-4 py-3 text-gray-200">{u.email}</td>
                <td className="px-4 py-3"><span className="px-2 py-0.5 bg-accent/10 text-accent rounded text-xs">{u.role}</span></td>
                <td className="px-4 py-3">{formatAmount(u.balance, 'USDT')}</td>
                <td className="px-4 py-3 text-warning">{formatAmount(u.frozenBalance, 'USDT')}</td>
                <td className="px-4 py-3">{formatAmount(u.insuranceDeposit, 'USDT')}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs ${u.isActive ? 'text-success' : 'text-danger'}`}>
                    {u.isActive ? 'Активен' : 'Заблокирован'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button onClick={() => { setBalanceModal(u); setBalanceForm({ amount: '', type: 'DEPOSIT' }); }}
                      className="p-1.5 hover:bg-accent/10 rounded text-accent" title="Баланс">
                      <Wallet size={15} />
                    </button>
                    <button onClick={() => toggleActive(u)}
                      className="p-1.5 hover:bg-gray-700 rounded text-gray-400" title={u.isActive ? 'Заблокировать' : 'Разблокировать'}>
                      {u.isActive ? <Ban size={15} /> : <CheckCircle size={15} className="text-success" />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Создать пользователя">
        <form onSubmit={createUser} className="space-y-4">
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <Input label="Пароль" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={8} />
          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="w-full px-3 py-2 bg-bg-primary border border-gray-700 rounded-lg text-gray-100">
            <option value="TRADER">Трейдер</option>
            <option value="MERCHANT">Мерчант</option>
          </select>
          <Input label="Начальный баланс USDT" type="number" value={form.balance} onChange={(e) => setForm({ ...form, balance: e.target.value })} />
          <Input label="Страховой депозит" type="number" value={form.insuranceDeposit} onChange={(e) => setForm({ ...form, insuranceDeposit: e.target.value })} />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Отмена</Button>
            <Button type="submit">Создать</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!balanceModal} onClose={() => setBalanceModal(null)} title={`Баланс — ${balanceModal?.email}`}>
        <form onSubmit={adjustBalance} className="space-y-4">
          <select value={balanceForm.type} onChange={(e) => setBalanceForm({ ...balanceForm, type: e.target.value })}
            className="w-full px-3 py-2 bg-bg-primary border border-gray-700 rounded-lg text-gray-100">
            <option value="DEPOSIT">Пополнение</option>
            <option value="WITHDRAWAL">Списание</option>
          </select>
          <Input label="Сумма USDT" type="number" step="0.01" value={balanceForm.amount}
            onChange={(e) => setBalanceForm({ ...balanceForm, amount: e.target.value })} required />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" type="button" onClick={() => setBalanceModal(null)}>Отмена</Button>
            <Button type="submit">Применить</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
