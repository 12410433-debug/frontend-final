import { useEffect, useMemo, useState } from 'react';
import { Search, Trash2, UserPlus, Users } from 'lucide-react';
import { jsonServerApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Alert from './Alert';
import Badge from './Badge';
import Button from './Button';
import Card, { CardHeader } from './Card';
import Modal from './Modal';

const ROLE_OPTIONS = [
  { id: 'admin', label: 'Admin FILKOM', variant: 'purple' },
  { id: 'bem', label: 'BEM / Panitia', variant: 'blue' },
  { id: 'student', label: 'Mahasiswa FILKOM', variant: 'green' },
];
const EMPTY_USER = { name: '', email: '', password: '', role: 'bem' };

function roleLabel(role) {
  return ROLE_OPTIONS.find((item) => item.id === role)?.label || role;
}

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_USER);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  const { user: currentUser } = useAuth();

  useEffect(() => {
    let active = true;
    jsonServerApi.get('/users')
      .then(({ data }) => { if (active) setUsers(Array.isArray(data) ? data : []); })
      .catch(() => { if (active) setError('Daftar pengguna gagal dimuat dari JSON Server.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const managementUsers = users.filter((user) => ROLE_OPTIONS.some((role) => role.id === user.role));
  const matchingUsers = useMemo(() => managementUsers
    .filter((user) => roleFilter === 'all' || user.role === roleFilter)
    .filter((user) => `${user.name || ''} ${user.email || ''}`.toLowerCase().includes(search.trim().toLowerCase()))
    .sort((a, b) => String(a.name).localeCompare(String(b.name))), [managementUsers, roleFilter, search]);

  const groupedUsers = roleFilter === 'all'
    ? ROLE_OPTIONS.map((role) => ({ ...role, users: matchingUsers.filter((user) => user.role === role.id) }))
    : ROLE_OPTIONS.filter((role) => role.id === roleFilter).map((role) => ({ ...role, users: matchingUsers }));

  const activeAdminCount = users.filter((user) => user.role === 'admin' && user.status === 'active').length;

  const openDelete = (target) => {
    setDeleteError('');
    setDeleteTarget(target);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    if (String(deleteTarget.id) === String(currentUser?.id)) {
      setDeleteError('Akun yang sedang digunakan tidak dapat dihapus.');
      return;
    }
    if (deleteTarget.role === 'admin' && deleteTarget.status === 'active' && activeAdminCount <= 1) {
      setDeleteError('Admin aktif terakhir tidak dapat dihapus. Tambahkan Admin lain terlebih dahulu.');
      return;
    }

    setDeleteError('');
    setDeletingId(deleteTarget.id);
    try {
      await jsonServerApi.delete(`/users/${deleteTarget.id}`);
      setUsers((current) => current.filter((user) => String(user.id) !== String(deleteTarget.id)));
      setSuccess(`Akun ${roleLabel(deleteTarget.role)} untuk ${deleteTarget.name} berhasil dihapus.`);
      setDeleteTarget(null);
    } catch (requestError) {
      setDeleteError(requestError.response?.data?.message || 'Pengguna gagal dihapus dari JSON Server. Pastikan server aktif lalu coba kembali.');
    } finally {
      setDeletingId(null);
    }
  };
  const openCreate = () => {
    setForm({ ...EMPTY_USER, role: roleFilter === 'all' ? 'bem' : roleFilter });
    setError('');
    setModalOpen(true);
  };

  const createUser = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();
    if (!name || !email || !form.password) {
      setError('Nama, email, dan kata sandi wajib diisi.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Masukkan alamat email yang valid.');
      return;
    }
    if (form.password.length < 6) {
      setError('Kata sandi minimal 6 karakter.');
      return;
    }
    if (users.some((user) => user.email?.toLowerCase() === email && user.role === form.role)) {
      setError(`Email tersebut sudah terdaftar untuk role ${roleLabel(form.role)}.`);
      return;
    }
    const id = `user-${globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`}`;
    const payload = {
      id,
      name,
      email,
      password: form.password,
      role: form.role,
      status: 'active',
    };
    try {
      setSaving(true);
      const { data } = await jsonServerApi.post('/users', payload);
      setUsers((current) => [...current, data]);
      setSuccess(`Akun ${roleLabel(data.role)} untuk ${data.name} berhasil dibuat.`);
      setModalOpen(false);
      setForm(EMPTY_USER);
      if (roleFilter !== 'all' && roleFilter !== data.role) setRoleFilter(data.role);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Pengguna gagal disimpan. Pastikan JSON Server aktif.');
    } finally {
      setSaving(false);
    }
  };

  const setField = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  return (
    <section className="space-y-5 text-[#172554]">
      <div className="flex flex-col gap-4 rounded-2xl border border-[#BFDBFE] bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div><p className="text-xs font-bold uppercase tracking-wide text-violet-700">Admin FILKOM</p><h1 className="mt-1 text-xl font-extrabold">Kelola Pengguna</h1><p className="mt-1 text-sm text-blue-900">Kelola akun Admin dan BEM. Profil mahasiswa dicatat saat registrasi event.</p></div>
        <Button icon={UserPlus} onClick={openCreate}>Tambah Pengguna</Button>
      </div>

      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}
      {error && !modalOpen && <Alert type="error" message={error} onClose={() => setError('')} />}

      <Card className="overflow-hidden border border-[#BFDBFE] bg-white">
        <CardHeader className="flex-col items-stretch gap-3 border-b border-[#BFDBFE] sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-800" /><input aria-label="Cari pengguna" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari nama atau email..." className="w-full rounded-xl border border-[#BFDBFE] bg-white py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
          <div className="flex flex-wrap gap-2" aria-label="Filter role pengguna">
            <button type="button" onClick={() => setRoleFilter('all')} className={`rounded-xl px-3 py-2 text-xs font-bold ${roleFilter === 'all' ? 'bg-blue-700 text-white' : 'bg-blue-50 text-blue-800'}`}>Semua ({managementUsers.length})</button>
            {ROLE_OPTIONS.map((role) => <button key={role.id} type="button" onClick={() => setRoleFilter(role.id)} className={`rounded-xl px-3 py-2 text-xs font-bold ${roleFilter === role.id ? 'bg-blue-700 text-white' : 'bg-blue-50 text-blue-800'}`}>{role.label} ({managementUsers.filter((user) => user.role === role.id).length})</button>)}
          </div>
        </CardHeader>
        {loading ? <p className="p-8 text-center text-sm text-blue-800">Memuat pengguna...</p> : groupedUsers.every((group) => group.users.length === 0) ? <p className="p-8 text-center text-sm text-slate-600">Tidak ada pengguna untuk filter ini.</p> : <div className="space-y-5 p-4 sm:p-5">
          {groupedUsers.filter((group) => group.users.length > 0).map((group) => <section key={group.id} className="overflow-hidden rounded-2xl border border-blue-100">
            <div className="flex items-center justify-between bg-[#EFF6FF] px-4 py-3"><h2 className="flex items-center gap-2 text-sm font-extrabold"><Users className="h-4 w-4 text-blue-700" />{group.label}</h2><Badge variant={group.variant} size="sm">{group.users.length} pengguna</Badge></div>
            <div className="overflow-x-auto"><table className="w-full min-w-[640px] text-left text-sm"><thead className="text-xs uppercase tracking-wide text-[#1E3A8A]"><tr><th className="px-4 py-3">Nama</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Aksi</th></tr></thead><tbody className="divide-y divide-blue-100">{group.users.map((user) => <tr key={user.id}><td className="px-4 py-3 font-bold">{user.name}</td><td className="px-4 py-3">{user.email}</td><td className="px-4 py-3"><Badge variant={user.status === 'active' ? 'green' : 'gray'} size="sm" dot>{user.status === 'active' ? 'Aktif' : user.status || 'Tidak aktif'}</Badge></td><td className="px-4 py-3 text-right"><button type="button" aria-label={`Hapus akun ${user.name}`} title={String(user.id) === String(currentUser?.id) ? 'Akun yang sedang digunakan tidak dapat dihapus' : user.role === 'admin' && user.status === 'active' && activeAdminCount <= 1 ? 'Admin aktif terakhir tidak dapat dihapus' : 'Hapus akun'} disabled={deletingId === user.id || String(user.id) === String(currentUser?.id) || (user.role === 'admin' && user.status === 'active' && activeAdminCount <= 1)} onClick={() => openDelete(user)} className="inline-flex rounded-lg p-2 text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40"><Trash2 className="h-4 w-4" /></button></td></tr>)}</tbody></table></div>
          </section>)}
        </div>}
      </Card>

      <Modal isOpen={modalOpen} onClose={() => { if (!saving) setModalOpen(false); }} title="Tambah Pengguna" maxWidth="max-w-xl" footer={<><Button variant="ghost" disabled={saving} onClick={() => setModalOpen(false)}>Batal</Button><Button type="submit" form="create-user-form" icon={UserPlus} isLoading={saving}>Simpan Akun</Button></>}>
        <form id="create-user-form" onSubmit={createUser} className="space-y-4">
          {error && <Alert type="error" message={error} onClose={() => setError('')} />}
          <label className="block text-xs font-bold">Role<select required value={form.role} onChange={setField('role')} className="mt-1.5 w-full rounded-xl border border-[#BFDBFE] bg-white px-3 py-2.5 text-sm">{ROLE_OPTIONS.map((role) => <option key={role.id} value={role.id}>{role.label}</option>)}</select></label>
          <label className="block text-xs font-bold">Nama lengkap<input required maxLength={120} value={form.name} onChange={setField('name')} className="mt-1.5 w-full rounded-xl border border-[#BFDBFE] px-3 py-2.5 text-sm" placeholder="Nama pengguna" /></label>
          <label className="block text-xs font-bold">Email<input required type="email" value={form.email} onChange={setField('email')} className="mt-1.5 w-full rounded-xl border border-[#BFDBFE] px-3 py-2.5 text-sm" placeholder="nama@unklab.ac.id" /></label>
          <label className="block text-xs font-bold">Kata sandi awal<input required minLength={6} type="password" value={form.password} onChange={setField('password')} className="mt-1.5 w-full rounded-xl border border-[#BFDBFE] px-3 py-2.5 text-sm" placeholder="Minimal 6 karakter" /></label>
          <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">Untuk demonstrasi akademik, kata sandi disimpan di JSON Server simulasi. Jangan gunakan kata sandi akun sungguhan.</p>
        </form>
      </Modal>

      <Modal isOpen={!!deleteTarget} onClose={() => { if (!deletingId) setDeleteTarget(null); }} title="Hapus Pengguna" maxWidth="max-w-md" footer={<><Button variant="ghost" disabled={!!deletingId} onClick={() => setDeleteTarget(null)}>Batal</Button><Button variant="danger" icon={Trash2} isLoading={!!deletingId} disabled={!!deletingId} onClick={confirmDelete}>Hapus Pengguna</Button></>}>
        {deleteError && <Alert type="error" message={deleteError} onClose={() => setDeleteError('')} />}
        <p className="text-sm leading-relaxed text-slate-700">Hapus akun <strong>{deleteTarget?.name}</strong> ({deleteTarget?.email})? Pengguna tersebut tidak dapat masuk kembali setelah akunnya dihapus.</p>
      </Modal>
    </section>
  );
}
