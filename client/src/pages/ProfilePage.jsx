import { useForm } from 'react-hook-form'
import { useEffect } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const { register, handleSubmit, reset, formState: { errors, isSubmitting, isDirty } } = useForm()

  useEffect(() => {
    if (user) reset({ name: user.name, college: user.college || '', targetCGPA: user.targetCGPA || '' })
  }, [user])

  const onSubmit = async (data) => {
    try {
      const res = await api.patch('/auth/profile', { name: data.name, college: data.college, targetCGPA: data.targetCGPA || null })
      updateUser(res.data.user)
      toast.success('Profile updated')
      reset({ name: res.data.user.name, college: res.data.user.college || '', targetCGPA: res.data.user.targetCGPA || '' })
    } catch {
      toast.error('Could not update profile')
    }
  }

  return (
    <div className="animate-slide-up space-y-8 max-w-lg">
      <div>
        <h1 className="text-2xl font-bold text-white">Profile</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your account and set a CGPA target</p>
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-primary-600/30 flex items-center justify-center text-primary-400 font-bold text-2xl">
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <div>
          <p className="text-white font-semibold">{user?.name}</p>
          <p className="text-gray-500 text-sm">{user?.email}</p>
        </div>
      </div>

      <div className="card p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="label">Full name</label>
            <input {...register('name', { required: 'Name is required' })} className="input" />
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="label">Email</label>
            <input value={user?.email} disabled className="input opacity-50 cursor-not-allowed" />
          </div>
          <div>
            <label className="label">College</label>
            <input {...register('college')} className="input" placeholder="Your college" />
          </div>
          <div>
            <label className="label">Target CGPA</label>
            <input {...register('targetCGPA', { min: { value: 0, message: 'Min 0' }, max: { value: 10, message: 'Max 10' } })} type="number" step="0.01" className="input" placeholder="e.g. 9.0" />
            <p className="text-xs text-gray-600 mt-1">Used to show progress on your dashboard</p>
            {errors.targetCGPA && <p className="text-red-400 text-xs mt-1">{errors.targetCGPA.message}</p>}
          </div>
          <button type="submit" disabled={isSubmitting || !isDirty} className="btn-primary">
            {isSubmitting ? 'Saving...' : 'Save changes'}
          </button>
        </form>
      </div>
    </div>
  )
}
