import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import { calcCGPA, getPerformanceLabel, cgpaToPercentage } from '../utils/cgpa'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface-card border border-surface-border rounded-xl px-4 py-3 text-sm">
      <p className="text-gray-400 mb-1">{label}</p>
      <p className="font-mono font-bold text-primary-400">{payload[0].value?.toFixed(2)}</p>
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [semesters, setSemesters] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/semesters')
      .then(res => setSemesters(res.data.semesters))
      .finally(() => setLoading(false))
  }, [])

  const cgpa = calcCGPA(semesters)
  const totalCredits = semesters.reduce((a, s) => a + s.credits, 0)
  const perf = cgpa ? getPerformanceLabel(cgpa) : null
  const bestSem = semesters.length ? semesters.reduce((a, s) => s.gpa > a.gpa ? s : a, semesters[0]) : null
  const chartData = semesters.map(s => ({ name: s.name, GPA: parseFloat(s.gpa.toFixed(2)) }))

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="animate-slide-up space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Hey {user?.name?.split(' ')[0]}, here's your academic overview</p>
      </div>

      {semesters.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-4xl mb-4">◈</p>
          <h2 className="text-white font-semibold text-lg mb-2">No data yet</h2>
          <p className="text-gray-500 text-sm mb-6">Add your past semesters to see your CGPA and trends</p>
          <Link to="/semesters" className="btn-primary">Add semesters</Link>
        </div>
      ) : (
        <>
          {/* Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="metric-card">
              <p className="metric-label">Current CGPA</p>
              <p className="metric-value">{cgpa?.toFixed(2) ?? '—'}</p>
              {perf && <p className={`text-xs font-medium mt-1 ${perf.color}`}>{perf.label}</p>}
            </div>
            <div className="metric-card">
              <p className="metric-label">Equivalent %</p>
              <p className="metric-value">{cgpa ? cgpaToPercentage(cgpa).toFixed(1) + '%' : '—'}</p>
              <p className="text-xs text-gray-600 mt-1">Standard formula</p>
            </div>
            <div className="metric-card">
              <p className="metric-label">Total credits</p>
              <p className="metric-value">{totalCredits}</p>
              <p className="text-xs text-gray-600 mt-1">Across {semesters.length} semesters</p>
            </div>
            <div className="metric-card">
              <p className="metric-label">Best semester</p>
              <p className="metric-value">{bestSem?.gpa.toFixed(2) ?? '—'}</p>
              <p className="text-xs text-gray-600 mt-1 truncate">{bestSem?.name}</p>
            </div>
          </div>

          {/* Target CGPA progress */}
          {user?.targetCGPA && cgpa && (
            <div className="card p-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-white">Progress to target CGPA</p>
                <span className="font-mono text-sm text-primary-400">{cgpa.toFixed(2)} / {user.targetCGPA}</span>
              </div>
              <div className="w-full bg-surface rounded-full h-2">
                <div
                  className="bg-primary-500 h-2 rounded-full transition-all duration-700"
                  style={{ width: `${Math.min((cgpa / user.targetCGPA) * 100, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-600 mt-2">
                {cgpa >= user.targetCGPA
                  ? '🎉 You have reached your target CGPA!'
                  : `${(user.targetCGPA - cgpa).toFixed(2)} points away from your target`}
              </p>
            </div>
          )}

          {/* Chart */}
          <div className="card p-6">
            <h2 className="text-sm font-semibold text-white mb-6">Semester GPA trend</h2>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a35" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 10]} tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} width={30} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="GPA" stroke="#6366f1" strokeWidth={2.5} dot={{ fill: '#6366f1', r: 4 }} activeDot={{ r: 6, fill: '#818cf8' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { to: '/semesters', icon: '◈', title: 'Manage semesters', desc: 'Add or edit past semester GPAs' },
              { to: '/current',   icon: '◎', title: 'Current semester', desc: 'Project your GPA with subject grades' },
              { to: '/target',    icon: '◉', title: 'Target solver',    desc: 'Calculate what GPA you need' },
            ].map(({ to, icon, title, desc }) => (
              <Link key={to} to={to} className="card p-5 hover:bg-surface-hover transition-colors group">
                <p className="text-2xl mb-3 text-primary-400">{icon}</p>
                <p className="text-sm font-semibold text-white group-hover:text-primary-300 transition-colors">{title}</p>
                <p className="text-xs text-gray-600 mt-1">{desc}</p>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
