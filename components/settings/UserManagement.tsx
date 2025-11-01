'use client'

import { User, Plus, Shield, Mail } from 'lucide-react'

export default function UserManagement() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
            <User className="w-5 h-5 text-accent-400" />
            <span>User Management</span>
          </h3>
          <p className="text-sm text-slate-400 mt-1">Manage user accounts and permissions</p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-accent-500 hover:bg-accent-600 text-navy-900 font-medium rounded-lg transition-colors">
          <Plus className="w-4 h-4" />
          <span>Add User</span>
        </button>
      </div>

      {/* Current User Profile */}
      <div className="bg-navy-900 rounded-lg border border-navy-700 p-6">
        <h4 className="text-white font-medium mb-4">Your Profile</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
            <input
              type="text"
              defaultValue="Admin User"
              className="w-full px-4 py-2 bg-navy-800 border border-navy-600 rounded-lg text-white focus:outline-none focus:border-accent-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
            <input
              type="email"
              defaultValue="admin@terradmin.local"
              className="w-full px-4 py-2 bg-navy-800 border border-navy-600 rounded-lg text-white focus:outline-none focus:border-accent-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Role</label>
            <input
              type="text"
              defaultValue="Administrator"
              disabled
              className="w-full px-4 py-2 bg-navy-800 border border-navy-600 rounded-lg text-slate-400 cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-navy-900 rounded-lg border border-navy-700">
        <div className="p-4 border-b border-navy-700">
          <h4 className="text-white font-medium">All Users</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-navy-800 border-b border-navy-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Last Active</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-700">
              <tr className="hover:bg-navy-800/50">
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-accent-500 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-navy-900" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Admin User</p>
                      <p className="text-sm text-slate-400">admin@terradmin.local</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent-500/10 text-accent-400 border border-accent-500/20">
                    <Shield className="w-3 h-3 mr-1" />
                    Administrator
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent-500/10 text-accent-400 border border-accent-500/20">
                    Active
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-300">Just now</td>
                <td className="px-6 py-4">
                  <button className="text-accent-400 hover:text-accent-300 text-sm font-medium">
                    Edit
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-end">
        <button className="px-6 py-2 bg-accent-500 hover:bg-accent-600 text-navy-900 font-medium rounded-lg transition-colors">
          Save Changes
        </button>
      </div>
    </div>
  )
}

