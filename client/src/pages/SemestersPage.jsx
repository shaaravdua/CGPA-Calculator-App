import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import api from '../utils/api'
import { calcCGPA, getPerformanceLabel } from '../utils/cgpa'

export default function SemestersPage() {
  const [semesters, setSemesters] = useState([])
  const [loading, setLoading] = useState(true)
  const [editId, setEditId] = useState(null)
  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm()

  const fetch = () => api.get('/semesters').then(r => setSemesters(r.data.semesters)).finally(() => setLoading(false))
  useEffect(() => { fetch() }, [])

  const onSubmit = async (data) => {
    try {
      if (editId) {
        const res = await api.patch(`/semesters/${editId}`, data)
        setSemesters(s => s.map(x => x._id === editId ? res.data.semester : x))
        toast.success('Semester updated')
        setEditId(null)
      } else {
        const semNumber = semesters.length + 1
        const res = await api.post('/semesters', { ...data, semNumber, name: data.name || `Semester ${semNumber}` })
        setSemesters(s => [...s, res.data.semester])
        toast.success('Semester added')
      }
      reset()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving semester')
    }
  }

  const startEdit = (sem) => {
    setEditId(sem._id)
    setValue('name', sem.name)
    setValue('gpa', sem.gpa)
    setValue('credits', sem.credits)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const cancelEdit = () => { setEditId(null); reset() }

  const deleteSem = async (id) => {
    if (!confirm('Delete this semester?')) return
    try {
      await api.delete(`/semesters/${id}`)
      setSemesters(s => s.filter(x => x._id !== id))
      toast.success('Semester deleted')
    } catch {
      toast.error('Could not delete')
    }
  }

  const cgpa = calcCGPA(semesters)
  const perf = cgpa ? getPerformanceLabel(cgpa) : null
  const totalCredits = semesters.reduce((a, s) => a + s.credits, 0)

  return (
    <div className="animate-slide-up space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Past Semesters</h1>
        <p className="text-gray-500 text-sm mt-1">Record your completed semester GPAs — credit-weighted CGPA is calculated automatically</p>
      </div>

      {/* Add / Edit form */}
      <div className="card p-6">
        <h2 className="text-sm font-semibold text-white mb-5">{editId ? 'Edit semester' : 'Add semester'}</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="label">Semester name</label>
              <input {...register('name')} className="input" placeholder="e.g. Semester 3" />
            </div>
            <div>
              <label className="label">GPA (0 – 10)</label>
              <input {...register('gpa', { required: 'GPA is required', min: { value: 0, message: 'Min 0' }, max: { value: 10, message: 'Max 10' } })} type="number" step="0.01" className="input" placeholder="e.g. 8.5" />
              {errors.gpa && <p className="text-red-400 text-xs mt-1">{errors.gpa.message}</p>}
            </div>
            <div>
              <label className="label">Credits earned</label>
              <input {...register('credits', { required: 'Credits required', min: { value: 1, message: 'Min 1' } })} type="number" className="input" placeholder="e.g. 22" />
              {errors.credits && <p className="text-red-400 text-xs mt-1">{errors.credits.message}</p>}
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={isSubmitting} className="btn-primary">
              {isSubmitting ? 'Saving...' : editId ? 'Update semester' : 'Add semester'}
            </button>
            {editId && <button type="button" onClick={cancelEdit} className="btn-ghost">Cancel</button>}
          </div>
        </form>
      </div>

      {/* Summary */}
      {semesters.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="metric-card">
            <p className="metric-label">CGPA</p>
            <p className="metric-value">{cgpa?.toFixed(2) ?? '—'}</p>
            {perf && <p className={`text-xs font-medium mt-1 ${perf.color}`}>{perf.label}</p>}
          </div>
          <div className="metric-card">
            <p className="metric-label">Total credits</p>
            <p className="metric-value">{totalCredits}</p>
          </div>
          <div className="metric-card">
            <p className="metric-label">Semesters</p>
            <p className="metric-value">{semesters.length}</p>
          </div>
        </div>
      )}

      {/* Semester list */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : semesters.length === 0 ? (
        <div className="card p-10 text-center text-gray-600">
          <p className="text-3xl mb-3">◈</p>
          <p className="text-sm">No semesters yet. Add your first one above.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-border">
                <th className="text-left px-6 py-3 text-xs text-gray-500 font-medium uppercase tracking-wider">Semester</th>
                <th className="text-right px-6 py-3 text-xs text-gray-500 font-medium uppercase tracking-wider">GPA</th>
                <th className="text-right px-6 py-3 text-xs text-gray-500 font-medium uppercase tracking-wider">Credits</th>
                <th className="text-right px-6 py-3 text-xs text-gray-500 font-medium uppercase tracking-wider">Weight</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {semesters.map((sem, i) => (
                <tr key={sem._id} className={`border-b border-surface-border last:border-0 ${editId === sem._id ? 'bg-primary-600/5' : 'hover:bg-surface-hover'} transition-colors`}>
                  <td className="px-6 py-4 text-sm text-white font-medium">{sem.name}</td>
                  <td className="px-6 py-4 text-right font-mono font-semibold text-primary-400">{sem.gpa.toFixed(2)}</td>
                  <td className="px-6 py-4 text-right text-sm text-gray-400">{sem.credits}</td>
                  <td className="px-6 py-4 text-right text-sm text-gray-600">{totalCredits > 0 ? ((sem.credits / totalCredits) * 100).toFixed(1) + '%' : '—'}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => startEdit(sem)} className="text-xs text-gray-500 hover:text-white px-3 py-1.5 rounded-lg hover:bg-surface-hover transition-colors">Edit</button>
                      <button onClick={() => deleteSem(sem._id)} className="btn-danger">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
