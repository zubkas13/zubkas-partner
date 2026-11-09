import { useState } from 'react';
import { Plus, Shield, CircleCheck as CheckCircle2, Trash2, Lock, X, Save, Users as UsersIcon } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { SectionHeader, EmptyState } from '@/components/Shared';
import { Modal } from '@/components/Modal';
import { allAdminSections } from '@/data/mockData';
import type { Role, AdminSectionKey } from '@/types';

export function AdminRoles() {
  const { roles, employees, addRole, updateRole, deleteRole } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Role | null>(null);
  const [form, setForm] = useState({ name: '', description: '', permissions: [] as AdminSectionKey[] });

  const employeeCountForRole = (roleId: string) => employees.filter(e => e.roleId === roleId).length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRole) {
      updateRole(editingRole.id, { name: form.name, description: form.description, permissions: form.permissions });
      setEditingRole(null);
    } else {
      addRole({ name: form.name, description: form.description, permissions: form.permissions });
    }
    setForm({ name: '', description: '', permissions: [] });
    setShowAdd(false);
  };

  const startEdit = (role: Role) => {
    setEditingRole(role);
    setForm({ name: role.name, description: role.description, permissions: [...role.permissions] });
    setShowAdd(true);
  };

  const closeModal = () => {
    setShowAdd(false);
    setEditingRole(null);
    setForm({ name: '', description: '', permissions: [] });
  };

  const togglePermission = (key: AdminSectionKey) => {
    setForm(prev => ({
      ...prev,
      permissions: prev.permissions.includes(key)
        ? prev.permissions.filter(p => p !== key)
        : [...prev.permissions, key],
    }));
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Roles & Permissions"
        subtitle="Create roles and control which admin sections employees can access"
        action={<button onClick={() => { setForm({ name: '', description: '', permissions: [] }); setShowAdd(true); }} className="btn-primary"><Plus className="h-4 w-4" /> Create Role</button>}
      />

      {/* Info banner */}
      <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 flex items-start gap-3">
        <Shield className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-blue-800">Role-Based Access Control</p>
          <p className="text-xs text-blue-700 mt-0.5">When an employee logs in, their sidebar and accessible pages are automatically filtered based on their assigned role's permissions. Admins always have full access to all sections.</p>
        </div>
      </div>

      {/* Role cards */}
      {roles.length === 0 ? (
        <EmptyState icon={Shield} title="No roles yet" message="Create your first role to manage employee access" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {roles.map(role => (
            <div key={role.id} className={`card p-5 ${role.isDefault ? 'border-zubkas-200' : ''}`}>
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zubkas-50">
                  <Shield className="h-5 w-5 text-zubkas-700" />
                </div>
                <div className="flex items-center gap-1">
                  {role.isDefault && <span className="badge badge-zubkas">Default</span>}
                  <button onClick={() => startEdit(role)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-zubkas-700 transition-colors" title="Edit role">
                    <Shield className="h-4 w-4" />
                  </button>
                  {!role.isDefault && (
                    <button onClick={() => setDeleteTarget(role)} className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors" title="Delete role">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
              <h3 className="mt-3 font-display font-semibold text-gray-900">{role.name}</h3>
              <p className="mt-1 text-sm text-gray-500">{role.description}</p>
              <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
                <UsersIcon className="h-3.5 w-3.5" />
                {employeeCountForRole(role.id)} employee{employeeCountForRole(role.id) !== 1 ? 's' : ''} assigned
              </div>
              <div className="mt-3 pt-3 border-t border-gray-50">
                <p className="text-xs font-medium text-gray-500 mb-2">{role.permissions.length} of {allAdminSections.length} sections</p>
                <div className="flex flex-wrap gap-1">
                  {role.permissions.slice(0, 6).map(p => {
                    const section = allAdminSections.find(s => s.key === p);
                    return (
                      <span key={p} className="badge badge-neutral">
                        <CheckCircle2 className="h-3 w-3" />
                        {section?.label ?? p}
                      </span>
                    );
                  })}
                  {role.permissions.length > 6 && (
                    <span className="badge badge-neutral">+{role.permissions.length - 6} more</span>
                  )}
                  {role.permissions.length === 0 && (
                    <span className="text-xs text-gray-400">No sections enabled</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Role Modal */}
      <Modal open={showAdd} onClose={closeModal} title={editingRole ? 'Edit Role' : 'Create Role'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-sm font-medium text-gray-700">Role Name</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field mt-1" placeholder="e.g. Team Lead" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Description</label>
            <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field mt-1" placeholder="Brief description of this role's responsibilities" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-3">Section Permissions</label>
            <p className="text-xs text-gray-400 mb-3">Select which admin panel sections employees with this role can access.</p>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {allAdminSections.map(section => {
                const checked = form.permissions.includes(section.key);
                return (
                  <button
                    key={section.key}
                    type="button"
                    onClick={() => togglePermission(section.key)}
                    className={`flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-sm font-medium transition-all ${checked ? 'border-zubkas-700 bg-zubkas-50 text-zubkas-700' : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'}`}
                  >
                    <div className={`flex h-4 w-4 items-center justify-center rounded ${checked ? 'bg-zubkas-700 text-white' : 'border border-gray-300'}`}>
                      {checked && <CheckCircle2 className="h-3 w-3" />}
                    </div>
                    {section.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={closeModal} className="btn-ghost flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1">
              <Save className="h-4 w-4" />
              {editingRole ? 'Update Role' : 'Create Role'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Role" size="sm">
        {deleteTarget && (
          <div className="space-y-4">
            <div className="rounded-lg bg-red-50 border border-red-200 p-4 flex items-start gap-3">
              <Lock className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-900">This action cannot be undone.</p>
                <p className="text-xs text-red-700 mt-1">
                  Role <span className="font-semibold">{deleteTarget.name}</span> will be permanently removed.
                  {employeeCountForRole(deleteTarget.id) > 0 && (
                    <span className="block mt-1">{employeeCountForRole(deleteTarget.id)} employee(s) are currently assigned to this role. They will lose access until reassigned.</span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="btn-ghost flex-1">Cancel</button>
              <button
                onClick={() => { deleteRole(deleteTarget.id); setDeleteTarget(null); }}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-red-700 active:scale-[0.98] flex-1"
              >
                <Trash2 className="h-4 w-4" />
                Delete Role
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
