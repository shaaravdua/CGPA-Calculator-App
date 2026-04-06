import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import api from '../utils/api'
import { GRADE_POINTS, getGradeInfo, calcSGPA, calcProjectedCGPA, getPerformanceLabel } from '../utils/cgpa'

const EMPTY_SUBJECT = () => ({ name: '', credits: 3, expectedGrade: 8, midSemMarks: '', endSemMarks: '' })

export default function CurrentSemPage() {
  const [semesters, setSemesters] = useState([])
  const [subjects, setSubjects] = useState([EMPTY_SUBJECT()])
  const [semLabel, setSemLabel] = useState(`Semester ${new Date().getFullYear()}`)
  const [saving, setSaving] = useState(false)
  const [loadingSubjects, setLoadingSubjects] = useState(true)

  useEffect(() => {
    Promise.all([api.get('/semesters'), api.get('/subjects')])
      .then(([semRes, subRes]) => {
        setSemesters(semRes.data.semesters)
        if (subRes.data.subjects.length > 0) {
          const saved = subRes.data.subjects
          setSemLabel(saved[0].semesterLabel)
          setSubjects(saved.map(s => ({
            _id: s._id, name: s.name, credits: s.credits,
            expectedGrade: s.expectedGrade,
            midSemMarks: s.midSemMarks ?? '',
            endSemMarks: s.endSemMarks ?? '',
          })))
        }
      })
      .finally(() => setLoadingSubjects(false))
  }, [])

  const updateSubject = (i, field, value) => {
    setSubjects(sub => sub.map((s, idx) => idx === i ? { ...s, [field]: value } : s))
  }

  const addSubject = () => setSubjects(s => [...s, EMPTY_SUBJECT()])
  const removeSubject = (i) => setSubjects(s => s.filter((_, idx) => idx !== i))

  const saveSubjects = async () => {
    setSaving(true)
    try {
      const payload = subjects.map(s => ({
        name: s.name || 'Unnamed',
        credits: Number(s.credits) || 3,
        expectedGrade: Number(s.expectedGrade),
        midSemMarks: s.midSemMarks !== '' ? Number(s.midSemMarks) : null,
        endSemMarks: s.endSemMarks !== '' ? Number(s.endSemMarks) : null,
      }))
      const res = await api.post('/subjects/save', { semesterLabel: semLabel, subjects: payload })
      setSubjects(res.data.subjects.map(s => ({ ...s, midSemMarks: s.midSemMarks ?? '', endSemMarks: s.endSemMarks ?? '' })))
      toast.success('Subjects saved')
    } catch {
      toast.error('Could not save subjects')
    } finally {
      setSaving(false)
    }
  }

  const sgpa = calcSGPA(subjects.map(s => ({ ...s, credits: Number(s.credits), expectedGrade: Number(s.expectedGrade) })))
  const projCGPA = calcProjectedCGPA(semesters, subjects.map(s => ({ credits: Number(s.credits), expectedGrade: Number(s.expectedGrade) })))
  const currCredits = subjects.reduce((a, s) => a + (Number(s.credits) || 0), 0)
  const perf = sgpa ? getPerformanceLabel(sgpa) : null

  const marksToGrade = (mid, end) => {
    const vals = [mid, end].filter(v => v !== '' && v !== null && v !== undefined)
    if (vals.length === 0) return null
    const avg = vals.reduce((a, v) => a + Number(v), 0) / vals.length
    if (avg >= 90) return 10; if (avg >= 80) return 9; if (avg >= 70) return 8
    if (avg >= 60) return 7; if (avg >= 50) return 6; if (avg >= 45) return 5
    if (avg >= 40) return 4; return 0
  }

  return (
    <div className="animate-slide-up space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Current Semester</h1>
          <p className="text-gray-500 text-sm mt-1">Add your subjects and expected grades to project your CGPA</p>
        </div>
        <button onClick={saveSubjects} disabled={saving} className="btn-primary shrink-0">
          {saving ? 'Saving...' : 'Save subjects'}
        </button>
      </div>

      {/* Semester label */}
      <div className="flex items-center gap-4">
        <label className="label mb-0 whitespace-nowrap">Semester label</label>
        <input value={semLabel} onChange={e => setSemLabel(e.target.value)} className="input max-w-xs" placeholder="e.g. Semester 5" />
      </div>

      {/* Results */}
      {sgpa !== null && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
          <div className="metric-card">
            <p className="metric-label">Projected SGPA</p>
            <p className="metric-value">{sgpa.toFixed(2)}</p>
            {perf && <p className={`text-xs font-medium mt-1 ${perf.color}`}>{perf.label}</p>}
          </div>
          <div className="metric-card">
            <p className="metric-label">Projected CGPA</p>
            <p className="metric-value">{projCGPA?.toFixed(2) ?? '—'}</p>
            <p className="text-xs text-gray-600 mt-1">{semesters.length === 0 ? 'Add past sems' : 'With past sems'}</p>
          </div>
          <div className="metric-card">
            <p className="metric-label">Current sem credits</p>
            <p className="metric-value">{currCredits}</p>
          </div>
          <div className="metric-card">
            <p className="metric-label">Subjects</p>
            <p className="metric-value">{subjects.length}</p>
          </div>
        </div>
      )}

      {/* Subject table */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-surface-border">
          <h2 className="text-sm font-semibold text-white">Subjects</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-surface-border">
                {['Subject name', 'Credits', 'Expected grade', 'Mid-sem %', 'End-sem %', 'Inferred grade', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs text-gray-500 font-medium uppercase tracking-wider first:pl-6 last:pr-6">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {subjects.map((s, i) => {
                const inferred = marksToGrade(s.midSemMarks, s.endSemMarks)
                const g = getGradeInfo(Number(s.expectedGrade))
                return (
                  <tr key={i} className="border-b border-surface-border last:border-0 hover:bg-surface-hover transition-colors">
                    <td className="px-4 py-3 pl-6">
                      <input value={s.name} onChange={e => updateSubject(i, 'name', e.target.value)} className="input text-sm" placeholder="Subject name" />
                    </td>
                    <td className="px-4 py-3">
                      <input type="number" min="1" max="6" value={s.credits} onChange={e => updateSubject(i, 'credits', e.target.value)} className="input w-20 text-sm" />
                    </td>
                    <td className="px-4 py-3">
                      <select value={s.expectedGrade} onChange={e => updateSubject(i, 'expectedGrade', e.target.value)} className="input w-32 text-sm">
                        {GRADE_POINTS.map(gp => (
                          <option key={gp.value} value={gp.value}>{gp.label} ({gp.value})</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <input type="number" min="0" max="100" value={s.midSemMarks} onChange={e => updateSubject(i, 'midSemMarks', e.target.value)} className="input w-24 text-sm" placeholder="—" />
                    </td>
                    <td className="px-4 py-3">
                      <input type="number" min="0" max="100" value={s.endSemMarks} onChange={e => updateSubject(i, 'endSemMarks', e.target.value)} className="input w-24 text-sm" placeholder="—" />
                    </td>
                    <td className="px-4 py-3">
                      {inferred !== null ? (
                        <span className={`tag ${getGradeInfo(inferred).bg} ${getGradeInfo(inferred).color}`}>
                          {getGradeInfo(inferred).label} ({inferred})
                        </span>
                      ) : <span className="text-gray-700 text-sm">—</span>}
                    </td>
                    <td className="px-4 py-3 pr-6">
                      {subjects.length > 1 && (
                        <button onClick={() => removeSubject(i)} className="btn-danger">Remove</button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-surface-border">
          <button onClick={addSubject} className="btn-ghost text-sm">+ Add subject</button>
        </div>
      </div>
    </div>
  )
}
