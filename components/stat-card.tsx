interface StatCardProps {
  number: string
  unit?: string
  label: string
}

export function StatCard({ number, unit, label }: StatCardProps) {
  return (
    <div className="border border-border rounded-xl p-6 hover:shadow-md transition-shadow">
      <div className="flex items-baseline gap-1 mb-2">
        <span className="text-4xl font-bold">{number}</span>
        {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
      </div>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  )
}
