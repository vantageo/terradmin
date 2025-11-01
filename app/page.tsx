import DashboardCard from '@/components/DashboardCard'
import { Cloud, Server, Database, Activity, TrendingUp, AlertCircle } from 'lucide-react'

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h2 className="text-2xl font-bold text-white">Welcome back, Admin</h2>
        <p className="text-slate-400 mt-1">Here's an overview of your VM resources across all cloud providers.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="Total VMs"
          value="0"
          icon={Server}
          description="Across all providers"
        />
        <DashboardCard
          title="Azure VMs"
          value="0"
          icon={Cloud}
          description="Active instances"
        />
        <DashboardCard
          title="AWS VMs"
          value="0"
          icon={Server}
          description="Active instances"
        />
        <DashboardCard
          title="vCenter VMs"
          value="0"
          icon={Database}
          description="On-premise instances"
        />
      </div>

      {/* Status Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <DashboardCard
          title="Running"
          value="0"
          icon={Activity}
          trend={{ value: "0%", isPositive: true }}
        />
        <DashboardCard
          title="Stopped"
          value="0"
          icon={TrendingUp}
          trend={{ value: "0%", isPositive: false }}
        />
        <DashboardCard
          title="Issues"
          value="0"
          icon={AlertCircle}
          description="Requires attention"
        />
      </div>

      {/* Recent Activity */}
      <div className="bg-navy-800 rounded-lg border border-navy-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
        <div className="text-center py-12 text-slate-400">
          <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No recent activity</p>
          <p className="text-sm mt-1">Deploy your first VM to get started</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-navy-800 rounded-lg border border-navy-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center space-x-3 p-4 bg-navy-700 hover:bg-navy-600 rounded-lg transition-colors border border-navy-600 hover:border-accent-500">
            <Cloud className="w-5 h-5 text-accent-400" />
            <span className="text-white font-medium">Deploy Azure VM</span>
          </button>
          <button className="flex items-center space-x-3 p-4 bg-navy-700 hover:bg-navy-600 rounded-lg transition-colors border border-navy-600 hover:border-accent-500">
            <Server className="w-5 h-5 text-accent-400" />
            <span className="text-white font-medium">Deploy AWS VM</span>
          </button>
          <button className="flex items-center space-x-3 p-4 bg-navy-700 hover:bg-navy-600 rounded-lg transition-colors border border-navy-600 hover:border-accent-500">
            <Database className="w-5 h-5 text-accent-400" />
            <span className="text-white font-medium">Deploy vCenter VM</span>
          </button>
        </div>
      </div>
    </div>
  )
}

