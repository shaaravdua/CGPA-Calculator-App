import { useEffect, useState } from 'react'
import api from '../utils/api'
import { calcCGPA, solveRequiredGPA, getPerformanceLabel } from '../utils/cgpa'

export default function TargetSolverPage() {
  const [semesters, setSemesters] = useState([])
  const [targetCGPA, setTargetCGPA] = useState('')
  const [remainingSems, setRemainingSems] = useState('')
  const [creditsPerSem, setCreditsPerSem] = useState('')

  useEffect(() => { api.get('/semesters').then(r => setSemesters(r.data.semesters)) }, [])

  const currentCGPA = calcCGPA(semesters)
  const totalCredits = semesters.reduce((a, s) => a + s.credits, 0)

  const t = parseFloat(targetCGPA)
  const rs = parseFloat(remainingSems)
  const rc = parseFloat(creditsPerSem)
  const canSolve = !isNaN(t) && !isNaN(rs) && !isNaN(rc) && rs > 0 && rc > 0 && currentCGPA !== null

  const reqGPA = canSolve ? solveRequiredGPA(currentCGPA, totalCredits, t, rs, rc) : null
  const perf = reqGPA !== null && reqGPA >= 0 && reqGPA <= 10 ? getPerformanceLabel(reqGPA) : null

  const getStatusMsg = () => {
    if (!canSolve) return null
    if (totalCredits === 0) return { type: 'warn', msg: 'Add your past semesters first in the Past Semesters tab.' }
    if (reqGPA > 10) return { type: 'error', msg: `Not achievable. You would need a GPA of ${reqGPA.toFixed(2)}, which exceeds the maximum of 10. Consider adjusting your target or the number of remaining semesters.` }
    if (reqGPA < 0) return { type: 'success', msg: `You've already exceeded your target! Even with 0 GPA in all remaining semesters, your CGPA would still be above ${t}.` }
    const difficulty = reqGPA >= 9.5 ? 'extremely challenging better to look for fathers business or a masters degree' : reqGPA >= 9 ? 'very challenging , you have to work hard' : reqGPA >= 8 ? 'ambitious but achievable' : reqGPA >= 7 ? 'achievable with consistent effort' : 'well within reach'
    return { type: 'info', msg: `To reach a CGPA of ${t}, you need an average GPA of ${reqGPA.toFixed(2)} in each of your ${rs} remaining semester(s). That's ${difficulty}.` }
  }

  const status = canSolve ? getStatusMsg() : null

  const styleMap = {
    error: 'bg-red-500/10 border-red-500/30 text-red-300',
    warn: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300',
    success: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
    info: 'bg-primary-600/10 border-primary-500/30 text-primary-300',
  }

  // What-if scenarios
  const scenarios = [7, 7.5, 8, 8.5, 9, 9.5].map(gpa => {
    if (!canSolve || totalCredits === 0) return null
    const futureCredits = rs * rc
    const projCGPA = (currentCGPA * totalCredits + gpa * futureCredits) / (totalCredits + futureCredits)
    return { gpa, projCGPA }
  }).filter(Boolean)

  return (
    <div className="animate-slide-up space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Target Solver</h1>
        <p className="text-gray-500 text-sm mt-1">Find out exactly what GPA you need to hit your CGPA goal</p>
      </div>

      {/* Current status */}
      <div className="grid grid-cols-2 gap-4">
        <div className="metric-card">
          <p className="metric-label">Current CGPA</p>
          <p className="metric-value">{currentCGPA?.toFixed(2) ?? '—'}</p>
          <p className="text-xs text-gray-600 mt-1">
            {semesters.length === 0 ? 'No semesters added yet' : `Over ${semesters.length} semester(s), ${totalCredits} credits`}
          </p>
        </div>
        <div className="metric-card">
          <p className="metric-label">Required GPA per semester</p>
          <p className={`metric-value ${reqGPA !== null && reqGPA > 10 ? 'text-red-400' : reqGPA !== null && reqGPA < 0 ? 'text-emerald-400' : 'text-white'}`}>
            {reqGPA !== null ? (reqGPA > 10 ? '>10' : reqGPA < 0 ? 'Already met' : reqGPA.toFixed(2)) : '—'}
          </p>
          {perf && <p className={`text-xs font-medium mt-1 ${perf.color}`}>{perf.label}</p>}
        </div>
      </div>

      {/* Inputs */}
      <div className="card p-6">
        <h2 className="text-sm font-semibold text-white mb-5">Set your target</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div>
            <label className="label">Target CGPA</label>
            <input type="number" value={targetCGPA} onChange={e => setTargetCGPA(e.target.value)} min="0" max="10" step="0.01" className="input" placeholder="e.g. 8.5" />
          </div>
          <div>
            <label className="label">Remaining semesters</label>
            <input type="number" value={remainingSems} onChange={e => setRemainingSems(e.target.value)} min="1" max="12" className="input" placeholder="e.g. 4" />
          </div>
          <div>
            <label className="label">Credits per semester</label>
            <input type="number" value={creditsPerSem} onChange={e => setCreditsPerSem(e.target.value)} min="1" max="40" className="input" placeholder="e.g. 22" />
          </div>
        </div>
        {status && (
          <div className={`mt-5 p-4 rounded-xl border text-sm leading-relaxed ${styleMap[status.type]}`}>
            {status.msg}
          </div>
        )}
      </div>

      {/* What-if table */}
      {canSolve && totalCredits > 0 && (
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-surface-border">
            <h2 className="text-sm font-semibold text-white">What-if scenarios</h2>
            <p className="text-xs text-gray-500 mt-0.5">Projected CGPA if you score different GPAs across {rs} remaining semester(s)</p>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-border">
                <th className="text-left px-6 py-3 text-xs text-gray-500 font-medium uppercase tracking-wider">If you score GPA</th>
                <th className="text-right px-6 py-3 text-xs text-gray-500 font-medium uppercase tracking-wider">Projected CGPA</th>
                <th className="text-right px-6 py-3 text-xs text-gray-500 font-medium uppercase tracking-wider">Meets target?</th>
              </tr>
            </thead>
            <tbody>
              {scenarios.map(({ gpa, projCGPA }) => {
                const meets = projCGPA >= t
                return (
                  <tr key={gpa} className="border-b border-surface-border last:border-0 hover:bg-surface-hover transition-colors">
                    <td className="px-6 py-3 font-mono font-semibold text-white">{gpa.toFixed(1)}</td>
                    <td className="px-6 py-3 text-right font-mono text-primary-400">{projCGPA.toFixed(2)}</td>
                    <td className="px-6 py-3 text-right">
                      <span className={`tag ${meets ? 'bg-emerald-400/10 text-emerald-400' : 'bg-red-400/10 text-red-400'}`}>
                        {meets ? 'Yes' : 'No'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {semesters.length === 0 && (
        <div className="card p-10 text-center text-gray-600">
          <p className="text-sm">Add your past semesters in the <span className="text-primary-400">Past Semesters</span> tab first to use the solver.</p>
        </div>
      )}
    </div>
  )
}
