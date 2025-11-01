import { LucideIcon } from 'lucide-react'

interface DashboardCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: {
    value: string
    isPositive: boolean
  }
  description?: string
}

export default function DashboardCard({ 
  title, 
  value, 
  icon: Icon, 
  trend,
  description 
}: DashboardCardProps) {
  return (
    <div className="bg-navy-800 rounded-lg border border-navy-700 p-6 hover:border-accent-500/50 transition-all duration-200 hover:shadow-lg hover:shadow-accent-500/10">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-400">{title}</p>
          <h3 className="text-3xl font-bold text-white mt-2">{value}</h3>
          
          {description && (
            <p className="text-sm text-slate-500 mt-1">{description}</p>
          )}
          
          {trend && (
            <div className="flex items-center mt-2">
              <span 
                className={`text-sm font-medium ${
                  trend.isPositive ? 'text-accent-400' : 'text-red-400'
                }`}
              >
                {trend.isPositive ? '↑' : '↓'} {trend.value}
              </span>
              <span className="text-xs text-slate-500 ml-2">from last month</span>
            </div>
          )}
        </div>
        
        <div className="w-12 h-12 bg-accent-500/10 rounded-lg flex items-center justify-center">
          <Icon className="w-6 h-6 text-accent-400" />
        </div>
      </div>
    </div>
  )
}

