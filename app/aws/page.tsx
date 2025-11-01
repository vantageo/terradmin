import { Server, Plus, Search, Filter } from 'lucide-react'

export default function AWSPage() {
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
            <Server className="w-7 h-7 text-accent-400" />
            <span>AWS Virtual Machines</span>
          </h2>
          <p className="text-slate-400 mt-1">Manage your Amazon Web Services EC2 instances</p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-accent-500 hover:bg-accent-600 text-navy-900 font-medium rounded-lg transition-colors shadow-lg shadow-accent-500/20">
          <Plus className="w-5 h-5" />
          <span>Deploy New Instance</span>
        </button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-navy-800 rounded-lg border border-navy-700 p-4">
          <p className="text-sm text-slate-400">Total Instances</p>
          <p className="text-2xl font-bold text-white mt-1">0</p>
        </div>
        <div className="bg-navy-800 rounded-lg border border-navy-700 p-4">
          <p className="text-sm text-slate-400">Running</p>
          <p className="text-2xl font-bold text-accent-400 mt-1">0</p>
        </div>
        <div className="bg-navy-800 rounded-lg border border-navy-700 p-4">
          <p className="text-sm text-slate-400">Stopped</p>
          <p className="text-2xl font-bold text-slate-400 mt-1">0</p>
        </div>
        <div className="bg-navy-800 rounded-lg border border-navy-700 p-4">
          <p className="text-sm text-slate-400">Regions</p>
          <p className="text-2xl font-bold text-white mt-1">0</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-navy-800 rounded-lg border border-navy-700 p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search instances..."
                className="w-full pl-10 pr-4 py-2 bg-navy-900 border border-navy-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-accent-500"
              />
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button className="flex items-center space-x-2 px-4 py-2 bg-navy-700 hover:bg-navy-600 text-white rounded-lg transition-colors border border-navy-600">
              <Filter className="w-4 h-4" />
              <span>Filter</span>
            </button>
            <select className="px-4 py-2 bg-navy-700 border border-navy-600 rounded-lg text-white focus:outline-none focus:border-accent-500">
              <option>All Regions</option>
              <option>us-east-1</option>
              <option>us-west-2</option>
              <option>eu-west-1</option>
              <option>ap-southeast-1</option>
            </select>
          </div>
        </div>
      </div>

      {/* Instance List */}
      <div className="bg-navy-800 rounded-lg border border-navy-700">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-navy-900 border-b border-navy-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Instance ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Region</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Instance Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">IP Address</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center">
                  <Server className="w-12 h-12 mx-auto mb-3 text-slate-600" />
                  <p className="text-slate-400">No AWS instances deployed</p>
                  <p className="text-sm text-slate-500 mt-1">Click "Deploy New Instance" to create your first EC2 instance</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

