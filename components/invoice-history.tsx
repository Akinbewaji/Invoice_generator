"use client"

import * as React from "react"
import { BadgeCheck, Clock, FileEdit, Send, Loader2, AlertCircle, PlusCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface HistoryEntry {
  id: string
  action: 'created' | 'edited' | 'sent' | 'paid' | 'finalized' | 'duplicated'
  version_number: number
  created_at: string
  changed_by: string
  change_reason?: string
}

const actionIcons = {
  created: <PlusCircle className="w-4 h-4 text-green-600" />,
  edited: <FileEdit className="w-4 h-4 text-blue-600" />,
  sent: <Send className="w-4 h-4 text-indigo-600" />,
  paid: <BadgeCheck className="w-4 h-4 text-emerald-600" />,
  finalized: <BadgeCheck className="w-4 h-4 text-neutral-900" />,
  duplicated: <Clock className="w-4 h-4 text-orange-600" />,
}



export function InvoiceHistory({ history }: { history: HistoryEntry[] }) {
  if (!history || history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-3xl border border-dashed border-neutral-200">
        <AlertCircle className="w-8 h-8 text-neutral-300 mb-4" />
        <p className="text-neutral-500 font-medium">No history recorded for this invoice yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-linear-to-b before:from-transparent before:via-neutral-200 before:to-transparent">
      {history.map((item, index) => (
        <div key={item.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
          {/* Dot */}
          <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-white shadow-sm shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 text-neutral-900 z-10 transition-all group-hover:scale-110">
            {actionIcons[item.action] || <Clock className="w-4 h-4" />}
          </div>
          {/* Card */}
          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between space-x-2 mb-1">
              <div className="font-bold text-neutral-900 capitalize">{item.action} <span className="text-indigo-600 text-xs ml-2">v{item.version_number}</span></div>
              <time className="font-mono text-xs text-neutral-400">{new Date(item.created_at).toLocaleDateString()}</time>
            </div>
            <div className="text-sm text-neutral-500 mb-2">Changed by {item.changed_by || 'System'}</div>
            {item.change_reason && <div className="text-xs italic text-neutral-400 bg-neutral-50 p-2 rounded-lg border border-neutral-100">"{item.change_reason}"</div>}
          </div>
        </div>
      ))}
    </div>
  )
}
