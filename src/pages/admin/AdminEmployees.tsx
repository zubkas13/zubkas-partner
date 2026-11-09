import { useState } from 'react';
import { UserPlus, Shield, Search, Trash2, Pencil, TriangleAlert as AlertTriangle, ChevronDown, Check } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { SectionHeader, EmptyState } from '@/components/Shared';
import { Modal } from '@/components/Modal';
import { formatDate, getInitials } from '@/utils/helpers';
import type { Employee } from '@/types';

export function AdminEmployees() {
  const { employees, roles, addEmployee, updateEmployee, deleteEmployee, assignEmployeeRole } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', whatsapp: '', roleId: roles[0]?.id ?? '' });
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);
  const [editTarget, setEditTarget] = useState<Employee | null>(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '', whatsapp: '', status: 'Active' as Employee['status'] });
  const [roleMenuFor, setRoleMenuFor] = useState<string | null>(null);

  const filtered = employees.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) || e.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const role = roles.find(r => r.id === form.roleId);
    addEmployee({ name: form.name, email: form.email, password: form.password, phone: form.phone, whatsapp: form.whatsapp, role: role?.name ?? 'Employee', roleId: form.roleId, status: 'Active', joinedDate: new Date().toISOString().split('T')[0] });
    setForm({ name: '', email: '', password: '', phone: '', whatsapp: '', roleId: roles[0]?.id ?? '' });
    setShowAdd(false);
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Employee Management"
        subtitle="Add team members and assign role access"
        action={<button onClick={() => setShowAdd(true)} className="btn-primary"><UserPlus className="h-4 w-4" /> Add Employee</button>}
      />

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input type="text" placeholder="Search employees..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-9 sm:max-w-xs" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.length === 0 ? (
          <div className="col-span-full"><EmptyState icon={UserPlus} title="No employees found" message="Add your first team member" /></div>
        ) : (
          filtered.map(e => (
            <div key={e.id} className="card p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-zubkas-700 text-sm font-bold text-white">{getInitials(e.name)}</div>
                  <div>
                    <p className="font-semibold text-gray-900">{e.name}</p>
                    <p className="text-xs text-gray-500">{e.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => { setEditTarget(e); setEditForm({ name: e.name, email: e.email, phone: e.phone ?? '', whatsapp: e.whatsapp ?? '', status: e.status }); }}
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    title="Edit employee"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(e)}
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                    title="Delete employee"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Role</span>
                  <div className="relative">
                    <button
                      onClick={() => setRoleMenuFor(roleMenuFor === e.id ? null : e.id)}
                      className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-700 transition-all hover:border-zubkas-300 hover:bg-zubkas-50"
                    >
                      <Shield className="h-3 w-3 text-zubkas-700" />
                      {roles.find(r => r.id === e.roleId)?.name ?? e.role}
                      <ChevronDown className="h-3 w-3 text-gray-400" />
                    </button>
                    {roleMenuFor === e.id && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setRoleMenuFor(null)} />
                        <div className="absolute right-0 z-50 mt-1 w-56 rounded-xl border border-gray-100 bg-white shadow-xl animate-slide-up py-1 max-h-64 overflow-y-auto">
                          {roles.map(r => (
                            <button
                              key={r.id}
                              onClick={() => { assignEmployeeRole(e.id, r.id); setRoleMenuFor(null); }}
                              className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              <div className="min-w-0">
                                <p className="font-medium truncate">{r.name}</p>
                                <p className="text-[10px] text-gray-400 truncate">{r.permissions.length} sections</p>
                              </div>
                              {e.roleId === r.id && <Check className="h-4 w-4 text-zubkas-700 shrink-0" />}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Sections</span>
                  <span className="font-medium text-gray-900">{roles.find(r => r.id === e.roleId)?.permissions.length ?? 0} enabled</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Joined</span>
                  <span className="font-medium text-gray-900">{formatDate(e.joinedDate)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Status</span>
                  <span className={`badge ${e.status === 'Active' ? 'badge-success' : 'badge-neutral'}`}>{e.status}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Employee">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Full Name</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field mt-1" placeholder="Employee name" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field mt-1" placeholder="employee@zubkas.com" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Password</label>
            <input required minLength={6} type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input-field mt-1" placeholder="At least 6 characters" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-gray-700">Phone</label>
              <input required type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field mt-1" placeholder="Phone number" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">WhatsApp</label>
              <input required type="tel" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} className="input-field mt-1" placeholder="WhatsApp number" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Role / Access Level</label>
            <select value={form.roleId} onChange={(e) => setForm({ ...form, roleId: e.target.value })} className="input-field mt-1">
              {roles.map(r => <option key={r.id} value={r.id}>{r.name} — {r.permissions.length} sections</option>)}
            </select>
            <p className="text-xs text-gray-400 mt-1">You can change this later from the employee card.</p>
          </div>
          <button type="submit" className="btn-primary w-full">Add Employee</button>
        </form>
      </Modal>

      {/* Edit Employee Modal */}
      <Modal open={!!editTarget} onClose={() => setEditTarget(null)} title="Edit Employee">
        {editTarget && (
          <form onSubmit={(e) => {
            e.preventDefault();
            updateEmployee(editTarget.id, { name: editForm.name, email: editForm.email, phone: editForm.phone, whatsapp: editForm.whatsapp, status: editForm.status });
            setEditTarget(null);
          }} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Full Name</label>
              <input required value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="input-field mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <input required type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} className="input-field mt-1" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-gray-700">Phone</label>
                <input value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} className="input-field mt-1" placeholder="Phone number" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">WhatsApp</label>
                <input value={editForm.whatsapp} onChange={(e) => setEditForm({ ...editForm, whatsapp: e.target.value })} className="input-field mt-1" placeholder="WhatsApp number" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Status</label>
              <select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value as Employee['status'] })} className="input-field mt-1">
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>
            <button type="submit" className="btn-primary w-full">Save Changes</button>
          </form>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Employee" size="sm">
        {deleteTarget && (
          <div className="space-y-4">
            <div className="rounded-lg bg-red-50 border border-red-200 p-4 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-900">This action cannot be undone.</p>
                <p className="text-xs text-red-700 mt-1">
                  Employee <span className="font-semibold">{deleteTarget.name}</span> ({deleteTarget.email}) will be permanently removed. They will no longer be able to access the admin panel.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="btn-ghost flex-1">Cancel</button>
              <button
                onClick={() => { deleteEmployee(deleteTarget.id); setDeleteTarget(null); }}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-red-700 active:scale-[0.98] flex-1"
              >
                <Trash2 className="h-4 w-4" />
                Delete Employee
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
