"use client"

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Download, Edit2, History, CreditCard, ArrowRight, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InvoiceHistory } from "@/components/invoice-history";
import { cn } from "@/lib/utils";
import { exportToPDF } from "@/lib/pdf-export";

export default function InvoiceDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [invoice, setInvoice] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      fetch(`/api/invoices/${id}`).then(res => res.json()),
      fetch(`/api/invoices/${id}/history`).then(res => res.json())
    ]).then(([invoiceData, historyData]) => {
      setInvoice(invoiceData);
      setHistory(historyData);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <div className="max-w-7xl mx-auto px-6 py-24 animate-pulse space-y-8">
    <div className="h-8 w-48 bg-neutral-200 rounded-lg" />
    <div className="h-96 bg-neutral-100 rounded-3xl" />
  </div>;

  if (!invoice) return <div className="text-center py-24">Invoice not found</div>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div className="space-y-2">
          <Link href="/invoices" className="inline-flex items-center text-sm font-medium text-neutral-500 hover:text-indigo-600 transition-colors">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-4">
            <h1 className="text-4xl font-black text-neutral-900 tracking-tight">Invoice {invoice.invoice_number}</h1>
            <div className={cn(
                "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                invoice.is_draft ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"
              )}>
                {invoice.is_draft ? "Draft" : "Finalized"}
            </div>
          </div>
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-2xl" onClick={() => exportToPDF('invoice-render', `Invoice-${invoice.invoice_number}.pdf`)}>
            <Download className="w-4 h-4 mr-2" /> Download PDF
          </Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700 rounded-2xl">
            <Edit2 className="w-4 h-4 mr-2" /> Edit Invoice
          </Button>
        </div>
      </div>

      <Tabs defaultValue="preview" className="space-y-8">
        <TabsList className="bg-neutral-100 p-1.5 rounded-2xl h-auto">
          <TabsTrigger value="preview" className="rounded-xl px-8 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">Preview</TabsTrigger>
          <TabsTrigger value="history" className="rounded-xl px-8 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">History & Versions</TabsTrigger>
          <TabsTrigger value="status" className="rounded-xl px-8 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">Payments & Tracking</TabsTrigger>
        </TabsList>

        <TabsContent value="preview" className="animate-in fade-in zoom-in-95 duration-300 outline-none">
          <div id="invoice-render" className="bg-white rounded-3xl border border-neutral-200 shadow-sm p-12 max-w-[850px] mx-auto min-h-[1100px] flex flex-col">
             {/* Header */}
             <div className="flex justify-between items-start mb-16">
               <div>
                 <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mb-6">
                   <Printer className="w-8 h-8" />
                 </div>
                 <h2 className="text-2xl font-black text-neutral-900 uppercase tracking-tight">{invoice.business_name}</h2>
                 <p className="text-neutral-500 whitespace-pre-wrap mt-2">{invoice.business_email}\n{invoice.business_phone}</p>
               </div>
               <div className="text-right space-y-1">
                 <h3 className="text-6xl font-black text-neutral-100 uppercase leading-none opacity-50 mb-4 select-none">INVOICE</h3>
                 <p className="font-mono text-neutral-500">No. {invoice.invoice_number}</p>
                 <p className="font-mono text-neutral-500">Date: {new Date(invoice.invoice_date).toLocaleDateString()}</p>
                 <p className="font-mono text-indigo-600 font-bold">Due: {new Date(invoice.due_date).toLocaleDateString()}</p>
               </div>
             </div>

             {/* Addresses */}
             <div className="grid grid-cols-2 gap-12 mb-16">
               <div className="space-y-2">
                 <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Billed To</p>
                 <p className="text-xl font-bold text-neutral-900">{invoice.client_name}</p>
                 <p className="text-neutral-500 whitespace-pre-wrap leading-relaxed">{invoice.client_address || invoice.client_email}</p>
               </div>
               <div className="text-right space-y-2">
                 <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Status</p>
                 <p className={cn("text-xl font-bold", invoice.is_draft ? "text-amber-500" : "text-emerald-500")}>
                   {invoice.is_draft ? "Awaiting Finalization" : "Invoice Finalized"}
                 </p>
               </div>
             </div>

             {/* Table */}
             <div className="flex-1">
               <table className="w-full text-left">
                 <thead>
                   <tr className="border-b-2 border-neutral-900">
                     <th className="py-4 font-bold text-neutral-900">Description</th>
                     <th className="py-4 text-center font-bold text-neutral-900">Qty</th>
                     <th className="py-4 text-right font-bold text-neutral-900">Rate</th>
                     <th className="py-4 text-right font-bold text-neutral-900">Amount</th>
                   </tr>
                 </thead>
                 <tbody>
                   {invoice.line_items?.map((item: any, i: number) => (
                     <tr key={i} className="border-b border-neutral-100">
                       <td className="py-6 text-neutral-700 font-medium">{item.description}</td>
                       <td className="py-6 text-center font-mono text-neutral-500">{item.quantity}</td>
                       <td className="py-6 text-right font-mono text-neutral-500">${Number(item.rate).toLocaleString()}</td>
                       <td className="py-6 text-right font-mono font-bold text-neutral-900">${(item.quantity * item.rate).toLocaleString()}</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>

             {/* Footer */}
             <div className="mt-16 pt-8 border-t-2 border-neutral-900 flex justify-between">
               <div className="max-w-sm">
                 <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3">Notes & Payment Terms</p>
                 <p className="text-sm text-neutral-500 leading-relaxed whitespace-pre-wrap">{invoice.notes || 'No specific notes provided.'}</p>
               </div>
               <div className="text-right space-y-3">
                 <div className="flex justify-between gap-12">
                   <span className="text-neutral-400 font-medium">Subtotal</span>
                   <span className="font-mono text-neutral-900 font-bold">${Number(invoice.subtotal).toLocaleString()}</span>
                 </div>
                 <div className="flex justify-between gap-12 text-3xl font-black">
                   <span className="text-neutral-900">Total</span>
                   <span className="text-indigo-600">${Number(invoice.total).toLocaleString()}</span>
                 </div>
               </div>
             </div>
          </div>
        </TabsContent>

        <TabsContent value="history" className="animate-in fade-in slide-in-from-bottom-4 duration-500 outline-none">
          <InvoiceHistory history={history} />
        </TabsContent>

        <TabsContent value="status" className="animate-in fade-in slide-in-from-bottom-4 duration-500 outline-none">
          <div className="max-w-2xl mx-auto py-12 text-center space-y-6">
            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto text-neutral-400">
              <CreditCard className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-neutral-900">Payment Tracking</h3>
            <p className="text-neutral-500">This feature allows you to record partial and full payments. It will be available in the next update.</p>
            <Button disabled variant="outline" className="rounded-xl">Coming Soon</Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
