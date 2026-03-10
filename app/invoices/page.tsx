"use client"

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search, Filter, MoreVertical, FileText, Download, Edit, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch('/api/invoices')
      .then(res => res.json())
      .then(data => {
        setInvoices(data);
        setLoading(false);
      });
  }, []);

  const filteredInvoices = invoices.filter(inv => 
    inv.client_name?.toLowerCase().includes(search.toLowerCase()) ||
    inv.invoice_number?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-neutral-900 tracking-tight">Dashboard</h1>
          <p className="text-neutral-500">Manage your invoices, drafts, and payment status.</p>
        </div>
        <Link href="/generator">
          <Button className="bg-indigo-600 hover:bg-indigo-700 rounded-2xl px-6 py-6 h-auto font-bold shadow-lg shadow-indigo-100">
            <Plus className="w-5 h-5 mr-2" /> Create Invoice
          </Button>
        </Link>
      </div>

      <div className="flex gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <Input 
            placeholder="Search by client or invoice number..." 
            className="pl-10 rounded-xl bg-white border-neutral-200"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" className="rounded-xl">
          <Filter className="w-4 h-4 mr-2" /> Filters
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [1, 2, 3].map(i => <div key={i} className="h-64 bg-neutral-100 animate-pulse rounded-3xl" />)
        ) : filteredInvoices.length === 0 ? (
          <div className="col-span-full py-24 text-center space-y-4">
            <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mx-auto">
              <FileText className="w-8 h-8 text-neutral-200" />
            </div>
            <p className="text-neutral-500 font-medium">No invoices found. Start by creating one!</p>
          </div>
        ) : filteredInvoices.map((inv) => (
          <div key={inv.id} className="group relative bg-white border border-neutral-200 rounded-3xl p-6 hover:shadow-xl hover:shadow-indigo-50/50 transition-all duration-300">
            <div className="flex justify-between items-start mb-6">
              <div className={cn(
                "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                inv.is_draft ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"
              )}>
                {inv.is_draft ? "Draft" : "Finalized"}
              </div>
              <div className="text-sm font-mono text-neutral-400">#{inv.invoice_number}</div>
            </div>

            <div className="space-y-1 mb-8">
              <h3 className="text-xl font-bold text-neutral-900 group-hover:text-indigo-600 transition-colors">{inv.client_name}</h3>
              <p className="text-sm text-neutral-500">{new Date(inv.invoice_date).toLocaleDateString()}</p>
            </div>

            <div className="flex justify-between items-end">
              <div>
                <p className="text-xs text-neutral-400 uppercase tracking-tighter font-bold mb-1">Total Amount</p>
                <p className="text-2xl font-black text-neutral-900">${Number(inv.total || 0).toLocaleString()}</p>
              </div>
              <div className="flex gap-2">
                <Link href={`/invoices/${inv.id}`}>
                  <Button variant="ghost" size="icon" className="rounded-xl hover:bg-neutral-50">
                    <Eye className="w-4 h-4" />
                  </Button>
                </Link>
                <Button variant="ghost" size="icon" className="rounded-xl hover:bg-neutral-50">
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
               <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
                <MoreVertical className="w-4 h-4" />
               </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
