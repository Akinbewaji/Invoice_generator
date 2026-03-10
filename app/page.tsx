import Link from "next/link";
import { ArrowRight, FileText, Sparkles, History, Shield } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-6 text-center">
      <div className="max-w-3xl space-y-8">
        <div className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm font-medium animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <Sparkles className="w-4 h-4 mr-2" />
          Powered by Groq AI
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-neutral-900 leading-tight">
          Invoicing that feels like <span className="bg-clip-text text-transparent bg-linear-to-r from-indigo-600 to-violet-600">magic.</span>
        </h1>
        
        <p className="text-xl text-neutral-600 max-w-2xl mx-auto leading-relaxed">
          The intelligent invoice generator that tracks history, manages templates, and uses AI to optimize your billing workflow.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/generator"
            className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white rounded-2xl font-semibold hover:bg-indigo-700 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center shadow-lg shadow-indigo-200"
          >
            Create New Invoice
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
          <Link
            href="/invoices"
            className="w-full sm:w-auto px-8 py-4 bg-white text-neutral-900 border border-neutral-200 rounded-2xl font-semibold hover:bg-neutral-50 transition-all flex items-center justify-center"
          >
            Manage Invoices
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
          <div className="p-6 bg-white rounded-2xl border border-neutral-100 shadow-sm text-left space-y-3">
            <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
              <History className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-neutral-900">Version History</h3>
            <p className="text-sm text-neutral-500 leading-relaxed">Track every change made to your invoices with a complete audit trail and rollback capabilities.</p>
          </div>
          
          <div className="p-6 bg-white rounded-2xl border border-neutral-100 shadow-sm text-left space-y-3">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-neutral-900">Smart Templates</h3>
            <p className="text-sm text-neutral-500 leading-relaxed">Save reusable templates for different business types and pre-fill data in seconds.</p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-neutral-100 shadow-sm text-left space-y-3">
            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-neutral-900">Payment Status</h3>
            <p className="text-sm text-neutral-500 leading-relaxed">Monitor the lifecycle of your invoices from draft to sent, partially paid, and paid.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
