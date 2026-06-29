import { useEffect, useState, useCallback } from 'react';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import api from '../lib/api';
import type { Requisite, Device } from '../types';
import { BANKS } from '../types';
import { Button } from '../components/ui/Button';
import { Input, Select } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Toggle } from '../components/ui/Toggle';
import { formatAmount, formatCardNumber, formatPhone } from '../lib/utils';

const emptyForm = {
  name: '', ownerName: '', bank: 'Тинькофф', currencyCode: 'RUB',
  cardNumber: '', accountNumber: '', phone: '',
  acceptCard: true, acceptAccount: false, acceptSbp: false,
  dailyLimit: '500000', totalLimit: '5000000',
  minOrder: '1000', maxOrder: '100000', maxPaymentsPerDay: '20',
  maxParallelDeals: '3', delayBetweenOrders: '0',
  deviceId: '', useUniqueAmounts: false,
};

export function RequisitesPage() {
  const [requisites, setRequisites] = useState<Requisite[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [tab, setTab] = useState<'active' | 'archived'>('active');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [currencyOptions, setCurrencyOptions] = useState<{ value: string; label: string }[]>([{ value: 'RUB', label: 'RUB' }]);

  useEffect(() => {
    api.get('/api/currencies').then((r) => {
      const fiat = r.data.currencies.filter((c: { code: string; name: string }) => c.code !== 'USDT');
      setCurrencyOptions(fiat.map((c: { code: string; name: string }) => ({ value: c.code, label: `${c.code} — ${c.name}` })));
    }).catch(() => {});
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [reqRes, devRes] = await Promise.all([
        api.get('/api/requisites', { params: { archived: tab === 'archived', search: search || undefined } }),
        api.get('/api/devices'),
      ]);
      setRequisites(reqRes.data);
      setDevices(devRes.data);
    } finally {
      setLoading(false);
    }
  }, [tab, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => {
    setEditId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (req: Requisite) => {
    setEditId(req.id);
    setForm({
      name: req.name, ownerName: req.ownerName, bank: req.bank, currencyCode: req.currencyCode,
      cardNumber: req.cardNumber || '', accountNumber: req.accountNumber || '', phone: req.phone || '',
      acceptCard: req.acceptCard, acceptAccount: req.acceptAccount, acceptSbp: req.acceptSbp,
      dailyLimit: String(req.dailyLimit), totalLimit: String(req.totalLimit),
      minOrder: String(req.minOrder), maxOrder: String(req.maxOrder),
      maxPaymentsPerDay: String(req.maxPaymentsPerDay),
      maxParallelDeals: String(req.maxParallelDeals), delayBetweenOrders: String(req.delayBetweenOrders),
      deviceId: req.deviceId || '', useUniqueAmounts: req.useUniqueAmounts,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form, deviceId: form.deviceId || null };
    if (editId) {
      await api.patch(`/api/requisites/${editId}`, payload);
    } else {
      await api.post('/api/requisites', payload);
    }
    setModalOpen(false);
    fetchData();
  };

  const toggleActive = async (req: Requisite) => {
    await api.patch(`/api/requisites/${req.id}`, { isActive: !req.isActive });
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Архивировать реквизит?')) return;
    await api.delete(`/api/requisites/${id}`);
    fetchData();
  };

  const setField = (key: string, value: unknown) => setForm((f) => ({ ...f, [key]: value }));

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-100">Реквизиты</h1>
        <Button onClick={openCreate}><Plus size={18} /> Добавить реквизит</Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex gap-1 bg-bg-card rounded-lg p-1 border border-gray-700">
          {(['active', 'archived'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                tab === t ? 'bg-accent text-white' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {t === 'active' ? 'Активные' : 'В архиве'}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по названию, ФИО, номеру..."
            className="w-full pl-9 pr-3 py-2 bg-bg-card border border-gray-700 rounded-lg text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-accent"
          />
        </div>
      </div>

      <div className="bg-bg-card rounded-xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700 text-gray-400 text-left">
                <th className="px-4 py-3 font-medium">Активность</th>
                <th className="px-4 py-3 font-medium">Приём</th>
                <th className="px-4 py-3 font-medium">ФИО</th>
                <th className="px-4 py-3 font-medium">Карта/Телефон</th>
                <th className="px-4 py-3 font-medium">Устройство</th>
                <th className="px-4 py-3 font-medium">Лимиты</th>
                <th className="px-4 py-3 font-medium">Ограничения</th>
                <th className="px-4 py-3 font-medium">Пробег</th>
                <th className="px-4 py-3 font-medium">Действия</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-500">Загрузка...</td></tr>
              ) : requisites.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-500">Нет реквизитов</td></tr>
              ) : requisites.map((req) => (
                <tr key={req.id} className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors">
                  <td className="px-4 py-3">
                    <Toggle checked={req.isActive} onChange={() => toggleActive(req)} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {req.acceptCard && <span className="px-1.5 py-0.5 bg-accent/10 text-accent text-xs rounded">Карта</span>}
                      {req.acceptAccount && <span className="px-1.5 py-0.5 bg-accent/10 text-accent text-xs rounded">Счёт</span>}
                      {req.acceptSbp && <span className="px-1.5 py-0.5 bg-accent/10 text-accent text-xs rounded">СБП</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-200">{req.ownerName}</div>
                    <div className="text-xs text-gray-500">{req.name}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-300">
                    {req.cardNumber ? formatCardNumber(req.cardNumber) : formatPhone(req.phone)}
                    <div className="text-xs text-gray-500">{req.bank}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-400">{req.device?.name || '—'}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    <div>Дн: {formatAmount(req.dailyUsed)} / {formatAmount(req.dailyLimit)}</div>
                    <div>Общ: {formatAmount(req.totalUsed)} / {formatAmount(req.totalLimit)}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    <div>{formatAmount(req.minOrder)} — {formatAmount(req.maxOrder)}</div>
                    <div>MAX {req.maxPaymentsPerDay}/день</div>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {req.paymentsToday} платежей
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(req)} className="p-1.5 hover:bg-gray-700 rounded text-gray-400 hover:text-accent"><Pencil size={15} /></button>
                      <button onClick={() => handleDelete(req.id)} className="p-1.5 hover:bg-gray-700 rounded text-gray-400 hover:text-danger"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Редактировать реквизит' : 'Добавить реквизит'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Название карты *" value={form.name} onChange={(e) => setField('name', e.target.value)} required />
            <Input label="Имя владельца *" value={form.ownerName} onChange={(e) => setField('ownerName', e.target.value)} required />
            <Select label="Банк *" value={form.bank} onChange={(e) => setField('bank', e.target.value)}
              options={BANKS.map((b) => ({ value: b, label: b }))} />
            <Select label="Валюта *" value={form.currencyCode} onChange={(e) => setField('currencyCode', e.target.value)}
              options={currencyOptions} />
            <Input label="Номер карты" value={form.cardNumber} onChange={(e) => setField('cardNumber', e.target.value)} placeholder="XXXX XXXX XXXX XXXX" />
            <Input label="Номер счёта" value={form.accountNumber} onChange={(e) => setField('accountNumber', e.target.value)} />
            <Input label="Номер телефона" value={form.phone} onChange={(e) => setField('phone', e.target.value)} placeholder="+7 (999) 123-45-67" />
            <Input label="Дневной лимит (руб)" type="number" value={form.dailyLimit} onChange={(e) => setField('dailyLimit', e.target.value)} />
            <Input label="Общий лимит (руб)" type="number" value={form.totalLimit} onChange={(e) => setField('totalLimit', e.target.value)} />
            <Input label="MIN ордер" type="number" value={form.minOrder} onChange={(e) => setField('minOrder', e.target.value)} />
            <Input label="MAX ордер" type="number" value={form.maxOrder} onChange={(e) => setField('maxOrder', e.target.value)} />
            <Input label="MAX платежей в сутки" type="number" value={form.maxPaymentsPerDay} onChange={(e) => setField('maxPaymentsPerDay', e.target.value)} />
            <Input label="MAX параллельных сделок" type="number" value={form.maxParallelDeals} onChange={(e) => setField('maxParallelDeals', e.target.value)} />
            <Input label="Задержка между ордерами (мин)" type="number" value={form.delayBetweenOrders} onChange={(e) => setField('delayBetweenOrders', e.target.value)} />
            <Select label="Устройство *" value={form.deviceId} onChange={(e) => setField('deviceId', e.target.value)}
              options={[{ value: '', label: '— Выберите —' }, ...devices.map((d) => ({ value: d.id, label: d.name }))]} />
          </div>

          <div className="flex flex-wrap gap-4 pt-2">
            <Toggle checked={form.acceptCard} onChange={(v) => setField('acceptCard', v)} label="Карта" />
            <Toggle checked={form.acceptAccount} onChange={(v) => setField('acceptAccount', v)} label="Счёт" />
            <Toggle checked={form.acceptSbp} onChange={(v) => setField('acceptSbp', v)} label="СБП" />
            <Toggle checked={form.useUniqueAmounts} onChange={(v) => setField('useUniqueAmounts', v)} label="Уникальные суммы" />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Отмена</Button>
            <Button type="submit">{editId ? 'Сохранить' : 'Добавить'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
