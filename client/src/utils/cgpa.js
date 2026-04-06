export const GRADE_POINTS = [
  { label: 'A+',  value: 10, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  { label: 'A', value: 9,  color: 'text-green-400',   bg: 'bg-green-400/10' },
  { label: 'B',  value: 8,  color: 'text-blue-400',    bg: 'bg-blue-400/10' },
  { label: 'C', value: 7,  color: 'text-indigo-400',  bg: 'bg-indigo-400/10' },
  { label: 'D',  value: 6,  color: 'text-violet-400',  bg: 'bg-violet-400/10' },
  { label: 'E',  value: 5,  color: 'text-yellow-400',  bg: 'bg-yellow-400/10' },
  { label: 'F',  value: 4,  color: 'text-orange-400',  bg: 'bg-orange-400/10' },
]

export function getGradeInfo(value) {
  return GRADE_POINTS.find(g => g.value === value) || GRADE_POINTS[GRADE_POINTS.length - 1]
}

export function calcCGPA(semesters) {
  const valid = semesters.filter(s => s.gpa != null && s.credits > 0)
  if (valid.length === 0) return null
  const totalCredits = valid.reduce((a, s) => a + s.credits, 0)
  const weightedSum = valid.reduce((a, s) => a + s.gpa * s.credits, 0)
  return totalCredits > 0 ? weightedSum / totalCredits : null
}

export function calcSGPA(subjects) {
  const valid = subjects.filter(s => s.credits > 0 && s.expectedGrade != null)
  if (valid.length === 0) return null
  const totalCredits = valid.reduce((a, s) => a + s.credits, 0)
  const weightedSum = valid.reduce((a, s) => a + s.expectedGrade * s.credits, 0)
  return totalCredits > 0 ? weightedSum / totalCredits : null
}

export function calcProjectedCGPA(semesters, subjects) {
  const pastValid = semesters.filter(s => s.gpa != null && s.credits > 0)
  const pastCredits = pastValid.reduce((a, s) => a + s.credits, 0)
  const pastWeighted = pastValid.reduce((a, s) => a + s.gpa * s.credits, 0)

  const currValid = subjects.filter(s => s.credits > 0 && s.expectedGrade != null)
  const currCredits = currValid.reduce((a, s) => a + s.credits, 0)
  const currWeighted = currValid.reduce((a, s) => a + s.expectedGrade * s.credits, 0)

  const totalCredits = pastCredits + currCredits
  if (totalCredits === 0) return null
  return (pastWeighted + currWeighted) / totalCredits
}

export function solveRequiredGPA(currentCGPA, currentCredits, targetCGPA, remainingSems, creditsPerSem) {
  const futureCredits = remainingSems * creditsPerSem
  const totalCredits = currentCredits + futureCredits
  const requiredTotal = targetCGPA * totalCredits
  const requiredFromFuture = requiredTotal - currentCGPA * currentCredits
  return requiredFromFuture / futureCredits
}

export function cgpaToPercentage(cgpa) {
  // VTU / Anna University standard formula
  return (cgpa - 0.5) * 10
}

export function getPerformanceLabel(cgpa) {
  if (cgpa >= 9.5) return { label: 'Outstanding', color: 'text-emerald-400' }
  if (cgpa >= 9)   return { label: 'Excellent',    color: 'text-green-400' }
  if (cgpa >= 8)   return { label: 'Very Good',    color: 'text-blue-400' }
  if (cgpa >= 7)   return { label: 'Good',         color: 'text-indigo-400' }
  if (cgpa >= 6)   return { label: 'Average',      color: 'text-yellow-400' }
  if (cgpa >= 5)   return { label: 'Pass',         color: 'text-orange-400' }
  return             { label: 'Below Pass',         color: 'text-red-400' }
}
