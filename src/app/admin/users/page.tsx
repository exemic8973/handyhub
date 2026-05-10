'use client'

import { useState, useEffect, useCallback } from 'react'
import { StatusBadge, formatDate, ConfirmDialog } from '@/lib/utils'
import { Modal } from '@/lib/modal'
import { PlusIcon, PencilIcon, TrashIcon } from '@/lib/icons'
import { useToast } from '@/lib/toast'
import type { AdminUser } from '@/lib/types'

const ROLES = ['CUSTOMER', 'HANDYMAN', 'ADMIN']

export default function AdminUsersPage() {
  const { addToast } = useToast()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [roleFilter, setRoleFilter] = useState('')

  // Modal state
  const [createOpen, setCreateOpen] = useState(false)
  const [editUser, setEditUser] = useState<AdminUser | null>(null)
  const [deleteUser, setDeleteUser] = useState<AdminUser | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Form state
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '',
    phone: '', role: 'CUSTOMER', isVerified: true, isActive: true,
  })

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' })
      if (roleFilter) params.set('role', roleFilter)
      const res = await fetch(`/api/users?${params}`)
      if (!res.ok) throw new Error(`Failed (${res.status})`)
      const data = await res.json()
      setUsers(data.users ?? [])
      setTotalPages(data.pagination?.totalPages ?? 1)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }, [page, roleFilter])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const resetForm = () => setForm({
    firstName: '', lastName: '', email: '', password: '',
    phone: '', role: 'CUSTOMER', isVerified: true, isActive: true,
  })

  const openCreate = () => { resetForm(); setCreateOpen(true) }
  const openEdit = (u: AdminUser) => {
    setForm({
      firstName: u.firstName, lastName: u.lastName, email: u.email,
      password: '', phone: u.phone || '', role: u.role,
      isVerified: u.isVerified, isActive: u.isActive,
    })
    setEditUser(u)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create user')
      }
      addToast('User created successfully', 'success')
      setCreateOpen(false)
      fetchUsers()
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editUser) return
    setSubmitting(true)
    try {
      const body: Record<string, unknown> = {
        firstName: form.firstName, lastName: form.lastName,
        phone: form.phone || null,
      }
      // RBAC: admin can change role, verification, active status
      body.role = form.role
      body.isVerified = form.isVerified
      body.isActive = form.isActive

      const res = await fetch(`/api/users/${editUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to update user')
      }
      addToast('User updated', 'success')
      setEditUser(null)
      fetchUsers()
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteUser) return
    try {
      const res = await fetch(`/api/users/${deleteUser.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to delete')
      }
      addToast('User deleted', 'success')
      setDeleteUser(null)
      fetchUsers()
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed', 'error')
    }
  }

  const setField = (field: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Users</h2>
          <p className="text-sm text-gray-500 mt-1">Manage all platform users</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1) }} className="input-field w-auto">
            <option value="">All Roles</option>
            {ROLES.map((r) => <option key={r} value={r}>{r.charAt(0) + r.slice(1).toLowerCase()}</option>)}
          </select>
          <button onClick={openCreate} className="btn btn-primary">
            <PlusIcon className="w-4 h-4 mr-1" />
            Add User
          </button>
        </div>
      </div>

      {loading && <div className="flex justify-center py-12"><div className="spinner w-10 h-10" /></div>}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={fetchUsers} className="btn btn-primary">Retry</button>
        </div>
      )}

      {!loading && !error && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">No users found.</td></tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      {user.firstName} {user.lastName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                        user.role === 'ADMIN' ? 'bg-red-100 text-red-700' :
                        user.role === 'HANDYMAN' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>{user.role}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={user.isActive ? 'CONFIRMED' : 'CANCELLED'} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(user.createdAt)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button onClick={() => openEdit(user)} className="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors" title="Edit">
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeleteUser(user)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors ml-1" title="Delete">
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn btn-secondary btn-sm">Previous</button>
              <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn btn-secondary btn-sm">Next</button>
            </div>
          )}
        </div>
      )}

      {/* Create User Modal */}
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Add User">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input type="text" required value={form.firstName} onChange={(e) => setField('firstName', e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input type="text" required value={form.lastName} onChange={(e) => setField('lastName', e.target.value)} className="input-field" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" required value={form.email} onChange={(e) => setField('email', e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" required minLength={6} value={form.password} onChange={(e) => setField('password', e.target.value)} className="input-field" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input type="text" value={form.phone} onChange={(e) => setField('phone', e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select value={form.role} onChange={(e) => setField('role', e.target.value)} className="input-field">
                {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setCreateOpen(false)} className="btn btn-secondary">Cancel</button>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit User Modal */}
      <Modal isOpen={!!editUser} onClose={() => setEditUser(null)} title="Edit User">
        <form onSubmit={handleEdit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input type="text" required value={form.firstName} onChange={(e) => setField('firstName', e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input type="text" required value={form.lastName} onChange={(e) => setField('lastName', e.target.value)} className="input-field" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" required value={form.email} onChange={(e) => setField('email', e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input type="text" value={form.phone} onChange={(e) => setField('phone', e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select value={form.role} onChange={(e) => setField('role', e.target.value)} className="input-field">
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isVerified} onChange={(e) => setField('isVerified', e.target.checked)} className="checkbox-field" />
              <span className="text-sm text-gray-700">Verified</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isActive} onChange={(e) => setField('isActive', e.target.checked)} className="checkbox-field" />
              <span className="text-sm text-gray-700">Active</span>
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setEditUser(null)} className="btn btn-secondary">Cancel</button>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteUser}
        onClose={() => setDeleteUser(null)}
        onConfirm={handleDelete}
        title="Delete User"
        message={`Are you sure you want to delete ${deleteUser?.firstName} ${deleteUser?.lastName}? This action cannot be undone.`}
        confirmLabel="Delete"
        destructive
      />
    </div>
  )
}
