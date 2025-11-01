'use client'

import { Bell } from 'lucide-react'

export default function NotificationSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
          <Bell className="w-5 h-5 text-accent-400" />
          <span>Notification Preferences</span>
        </h3>
        <p className="text-sm text-slate-400 mt-1">Configure how you receive notifications</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-navy-900 rounded-lg border border-navy-700">
          <div>
            <h4 className="text-white font-medium">Email Notifications</h4>
            <p className="text-sm text-slate-400">Receive email alerts for VM status changes</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" />
            <div className="w-11 h-6 bg-navy-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-500"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 bg-navy-900 rounded-lg border border-navy-700">
          <div>
            <h4 className="text-white font-medium">Deployment Notifications</h4>
            <p className="text-sm text-slate-400">Get notified when VM deployments complete</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" />
            <div className="w-11 h-6 bg-navy-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-500"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 bg-navy-900 rounded-lg border border-navy-700">
          <div>
            <h4 className="text-white font-medium">Error Alerts</h4>
            <p className="text-sm text-slate-400">Receive alerts when errors occur</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" defaultChecked />
            <div className="w-11 h-6 bg-navy-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-500"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 bg-navy-900 rounded-lg border border-navy-700">
          <div>
            <h4 className="text-white font-medium">Weekly Reports</h4>
            <p className="text-sm text-slate-400">Receive weekly summary of your VM usage</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" />
            <div className="w-11 h-6 bg-navy-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-500"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 bg-navy-900 rounded-lg border border-navy-700">
          <div>
            <h4 className="text-white font-medium">Cost Alerts</h4>
            <p className="text-sm text-slate-400">Get notified when spending exceeds thresholds</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" />
            <div className="w-11 h-6 bg-navy-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-500"></div>
          </label>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button className="px-6 py-2 bg-accent-500 hover:bg-accent-600 text-navy-900 font-medium rounded-lg transition-colors">
          Save Preferences
        </button>
      </div>
    </div>
  )
}

