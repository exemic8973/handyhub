'use client'

import { useState, useEffect, useCallback } from 'react'
import { ConfirmDialog } from '@/lib/utils'
import { Modal } from '@/lib/modal'
import { PlusIcon, PencilIcon, TrashIcon } from '@/lib/icons'
import { useToast } from '@/lib/toast'
import type { ServiceItem } from '@/lib/types'

const CATEGORIES = [
  'PLUMBING', 'ELECTRICAL', 'CARPENTRY', 'PAINTING', 'CLEANING',
  'HVAC', 'APPLIANCE_REPAIR', 'LOCKSMITH', 'MOVING', 'GENERAL_REPAIR',
]

const CAT_EMOJI: Record<string, string> = {
  PLUMBING: '🔧', ELECTRICAL: '⚡', CARPENTRY: '🪵', PAINTING: '🎨',
  CLEANING: '✨', HVAC: '🌡️', APPLIANCE_REPAIR: '🔌', LOCKSMITH: '🔑',
  MOVING: '🚚', GENERAL_REPAIR: '🛠️',
}

function formatCat(c: string) { return c.replace(/_/g, ' ').replace(/\b\w/g, (ch) => ch.toUpperCase()) }

export default function AdminServicesPage() {
  const { addToast } = useToast()
  const [services, setServices] = useState<ServiceItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Modal state
  const [createOpen, setCreateOpen] = useState(false)
  const [editService, setEditService] = useState<ServiceItem | null>(null)
  const [deleteService, setDeleteService] = useState<ServiceItem | null>(null)

  // Form state
  const [form, setForm] = useState({ name: '', category: 'PLUMBING', description: '' })

  const fetchServices = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/services')
      if (!res.ok) throw new Error(`Failed (${res.status})`)
      const data = await res.json()
      setServices(data.services ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchServices() }, [fetchServices])

  const resetForm = () => setForm({ name: '', category: 'PLUMBING', description: '' })

  const openCreate = () => { resetForm(); setCreateOpen(true) }
  const openEdit = (s: ServiceItem) => {
    setForm({ name: s.name, category: s.category, description: s.description || '' })
    setEditService(s)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create service')
      }
      addToast('Service created', 'success')
      setCreateOpen(false)
      fetchServices()
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editService) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/services/${editService.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to update')
      }
      addToast('Service updated', 'success')
      setEditService(null)
      fetchServices()
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteService) return
    try {
      const res = await fetch(`/api/services/${deleteService.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to deactivate')
      }
      addToast('Service deactivated', 'success')
      setDeleteService(null)
      fetchServices()
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed', 'error')
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Services</h2>
          <p className="text-sm text-gray-500 mt-1">Manage service categories and listings</p>
        </div>
        <button onClick={openCreate} className="btn btn-primary">
          <PlusIcon className="w-4 h-4 mr-1" />
          Add Service
        </button>
      </div>

      {loading && <div className="flex justify-center py-12"><div className="spinner w-10 h-10" /></div>}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={fetchServices} className="btn btn-primary">Retry</button>
        </div>
      )}

      {!loading && !error && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Handymen</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {services.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No services found.</td></tr>
              ) : (
                services.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{CAT_EMOJI[s.category] || '🔧'}</span>
                        <span className="font-medium text-gray-900">{s.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                        {formatCat(s.category)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{s.description || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{s._count?.handymen ?? 0}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors" title="Edit">
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeleteService(s)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors ml-1" title="Deactivate">
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Service Modal */}
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Add Service">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input type="text" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className="input-field">
              {CATEGORIES.map((c) => <option key={c} value={c}>{formatCat(c)}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="input-field" rows={3} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setCreateOpen(false)} className="btn btn-secondary">Cancel</button>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'Creating...' : 'Create Service'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Service Modal */}
      <Modal isOpen={!!editService} onClose={() => setEditService(null)} title="Edit Service">
        <form onSubmit={handleEdit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input type="text" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className="input-field">
              {CATEGORIES.map((c) => <option key={c} value={c}>{formatCat(c)}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="input-field" rows={3} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setEditService(null)} className="btn btn-secondary">Cancel</button>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteService}
        onClose={() => setDeleteService(null)}
        onConfirm={handleDelete}
        title="Deactivate Service"
        message={`Deactivate "${deleteService?.name}"? It will no longer be available for new bookings.`}
        confirmLabel="Deactivate"
        destructive
      />
    </div>
  )
}
