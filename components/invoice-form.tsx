"use client"

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2, Loader2, Sparkles, Save, ChevronRight, ChevronLeft, Download } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { invoiceSchema, type InvoiceFormValues } from '@/lib/invoice-schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export default function InvoiceForm({ initialData }: { initialData?: Partial<InvoiceFormValues> }) {
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema) as any,
    defaultValues: {
      business_type: 'generic',
      line_items: [{ description: '', quantity: 1, rate: 0 }],
      is_draft: true,
      invoice_date: new Date().toISOString().split('T')[0],
      due_date: new Date().toISOString().split('T')[0],
      ...initialData,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'line_items',
  });

  const handleGenerateAI = async () => {
    setIsGenerating(true);
    try {
      const values = form.getValues();
      const response = await fetch('/api/generate-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessType: values.business_type,
          businessData: { name: values.business_name }
        }),
      });
      const data = await response.json();
      
      if (data.defaultLineItems) form.setValue('line_items', data.defaultLineItems);
      if (data.notesTemplate) form.setValue('notes', data.notesTemplate);
      if (data.styleRecommendations) form.setValue('template_style', data.styleRecommendations.layout);
      
    } catch (error) {
      console.error('AI generation failed', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const onSubmit = async (data: InvoiceFormValues, isDraft = true) => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, is_draft: isDraft }),
      });
      if (response.ok) {
        router.push('/invoices');
      }
    } catch (error) {
      console.error('Save failed', error);
    } finally {
      setIsSaving(false);
    }
  };

  const lineItems = form.watch('line_items') || [];
  const subtotal = lineItems.reduce((acc: number, item: any) => acc + (item.quantity * item.rate), 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-8 space-y-8">
        <div className="bg-white rounded-3xl shadow-sm border border-neutral-200 overflow-hidden">
          <div className="p-8 border-b border-neutral-100 flex justify-between items-center bg-gradient-to-r from-white to-neutral-50">
            <div>
              <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">
                {step === 1 && 'Business Information'}
                {step === 2 && 'Client & Date Details'}
                {step === 3 && 'Line Items & Notes'}
              </h2>
              <p className="text-sm text-neutral-500 mt-1">Step {step} of 3 • {Math.round((step/3)*100)}% Complete</p>
            </div>
            <div className="flex gap-1.5">
              {[1, 2, 3].map((s) => (
                <div key={s} className={cn("w-8 h-1.5 rounded-full transition-all duration-500", step >= s ? "bg-indigo-600" : "bg-neutral-200")} />
              ))}
            </div>
          </div>

          <div className="p-8">
            <form className="space-y-8">
              {step === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="md:col-span-2 space-y-2">
                    <Label>Business Type</Label>
                    <select
                      {...form.register('business_type')}
                      className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="generic">Generic Business</option>
                      <option value="service">Service-Based / Freelance</option>
                      <option value="ecommerce">E-Commerce / Retail</option>
                      <option value="saas">SaaS / Subscription</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Business Name</Label>
                    <Input {...form.register('business_name')} placeholder="Your Company Name" />
                  </div>
                  <div className="space-y-2">
                    <Label>Business Email</Label>
                    <Input {...form.register('business_email')} placeholder="hello@company.com" />
                  </div>
                  <div className="space-y-2">
                    <Label>Business Phone (Optional)</Label>
                    <Input {...form.register('business_phone')} placeholder="+1 (555) 000-0000" />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="space-y-2">
                    <Label>Invoice Number</Label>
                    <Input {...form.register('invoice_number')} placeholder="INV-2024-001" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Issue Date</Label>
                      <Input type="date" {...form.register('invoice_date')} />
                    </div>
                    <div className="space-y-2">
                      <Label>Due Date</Label>
                      <Input type="date" {...form.register('due_date')} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Client Name</Label>
                    <Input {...form.register('client_name')} placeholder="Client or Company Name" />
                  </div>
                  <div className="space-y-2">
                    <Label>Client Email</Label>
                    <Input {...form.register('client_email')} placeholder="client@example.com" />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label>Client Address</Label>
                    <Textarea {...form.register('client_address')} placeholder="123 Client St, City, Country" rows={3} />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-neutral-900">Line Items</h3>
                    <Button type="button" variant="outline" size="sm" onClick={handleGenerateAI} disabled={isGenerating} className="text-indigo-600 border-indigo-100 bg-indigo-50 hover:bg-indigo-100">
                      {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                      AI Suggest Items
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {fields.map((field: any, index: number) => (
                      <div key={field.id} className="flex gap-4 items-start group">
                        <div className="flex-1 space-y-1">
                          <Input {...form.register(`line_items.${index}.description`)} placeholder="Item description" />
                        </div>
                        <div className="w-24">
                          <Input type="number" {...form.register(`line_items.${index}.quantity`, { valueAsNumber: true })} placeholder="Qty" />
                        </div>
                        <div className="w-32">
                          <Input type="number" step="0.01" {...form.register(`line_items.${index}.rate`, { valueAsNumber: true })} placeholder="Rate" />
                        </div>
                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="text-neutral-400 hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    <Button type="button" variant="outline" className="w-full border-dashed" onClick={() => append({ description: '', quantity: 1, rate: 0 })}>
                      <Plus className="w-4 h-4 mr-2" /> Add Item
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label>Notes & Terms</Label>
                    <Textarea {...form.register('notes')} placeholder="Payment terms, bank details, or a thank you note..." rows={4} />
                  </div>
                </div>
              )}
            </form>
          </div>

          <div className="p-8 bg-neutral-50/50 border-t border-neutral-100 flex justify-between items-center">
            {step > 1 ? (
              <Button variant="outline" onClick={() => setStep(step - 1)}>
                <ChevronLeft className="w-4 h-4 mr-2" /> Previous
              </Button>
            ) : <div />}
            
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => onSubmit(form.getValues(), true)} disabled={isSaving}>
                <Save className="w-4 h-4 mr-2" /> Save Draft
              </Button>
              {step < 3 ? (
                <Button onClick={() => setStep(step + 1)} className="bg-indigo-600 hover:bg-indigo-700">
                  Next Step <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={form.handleSubmit((d: any) => onSubmit(d, false))} disabled={isSaving} className="bg-indigo-600 hover:bg-indigo-700">
                  {isSaving ? 'Finalizing...' : 'Finalize & Save'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="lg:col-span-4">
        <div className="sticky top-8 space-y-6">
          <div className="bg-neutral-900 rounded-3xl p-6 text-white shadow-xl shadow-indigo-100/50">
            <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-6">Live Preview</h3>
            
            <div className="space-y-6">
              <div className="flex justify-between items-start border-b border-neutral-800 pb-6">
                <div>
                  <p className="text-lg font-bold">{form.watch('business_name') || 'Your Business'}</p>
                  <p className="text-xs text-neutral-400 mt-1">{form.watch('business_email') || 'email@example.com'}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-neutral-400 uppercase tracking-tighter font-medium">Invoice #</p>
                  <p className="font-mono text-sm">{form.watch('invoice_number') || '---'}</p>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-neutral-400 uppercase font-medium">Bill To</p>
                <p className="font-semibold text-sm">{form.watch('client_name') || 'Client Name'}</p>
              </div>

              <div className="space-y-4">
                <p className="text-xs text-neutral-400 uppercase font-medium border-b border-neutral-800 pb-2">Line Highlights</p>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                  {lineItems.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm py-1 border-b border-neutral-800/50 last:border-0">
                      <span className="text-neutral-300 truncate mr-4">{item.description || 'New Item'}</span>
                      <span className="font-mono">${(item.quantity * item.rate).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex justify-between items-center">
                <p className="text-xl font-bold">Total Amount</p>
                <p className="text-3xl font-black text-indigo-400 font-mono">${subtotal.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-neutral-200">
            <h4 className="font-bold text-neutral-900 mb-4 flex items-center">
              <Download className="w-4 h-4 mr-2 text-neutral-400" /> Actions
            </h4>
            <p className="text-xs text-neutral-500 mb-4 leading-relaxed">Finalize your invoice to enable PDF downloads and client sharing capabilities.</p>
            <Button variant="outline" className="w-full justify-start text-neutral-400" disabled>
              Download PDF (Finalize First)
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
