import { Database, Plus, Search, Filter } from 'lucide-react'

export default function VCenterPage() {
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
            <Database className="w-7 h-7 text-accent-400" />
            <span>vCenter Virtual Machines</span>
          </h2>
          <p className="text-slate-400 mt-1">Manage your on-premise VMware vCenter instances</p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-accent-500 hover:bg-accent-600 text-navy-900 font-medium rounded-lg transition-colors shadow-lg shadow-accent-500/20">
          <Plus className="w-5 h-5" />
          <span>Deploy New VM</span>
        </button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-navy-800 rounded-lg border border-navy-700 p-4">
          <p className="text-sm text-slate-400">Total VMs</p>
          <p className="text-2xl font-bold text-white mt-1">0</p>
        </div>
        <div className="bg-navy-800 rounded-lg border border-navy-700 p-4">
          <p className="text-sm text-slate-400">Powered On</p>
          <p className="text-2xl font-bold text-accent-400 mt-1">0</p>
        </div>
        <div className="bg-navy-800 rounded-lg border border-navy-700 p-4">
          <p className="text-sm text-slate-400">Powered Off</p>
          <p className="text-2xl font-bold text-slate-400 mt-1">0</p>
        </div>
        <div className="bg-navy-800 rounded-lg border border-navy-700 p-4">
          <p className="text-sm text-slate-400">vCenter Servers</p>
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
                placeholder="Search VMs..."
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
              <option>All Datacenters</option>
              <option>Datacenter 1</option>
              <option>Datacenter 2</option>
            </select>
          </div>
        </div>
      </div>

      {/* VM List */}
      <div className="bg-navy-800 rounded-lg border border-navy-700">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-navy-900 border-b border-navy-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Power State</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Datacenter</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Host</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">IP Address</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">CPU/Memory</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center">
                  <Database className="w-12 h-12 mx-auto mb-3 text-slate-600" />
                  <p className="text-slate-400">No vCenter VMs deployed</p>
                  <p className="text-sm text-slate-500 mt-1">Click "Deploy New VM" to create your first vCenter instance</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

