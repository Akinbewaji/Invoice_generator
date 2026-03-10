import { z } from 'zod';

export const lineItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().min(1),
  rate: z.number().min(0),
});

export const invoiceSchema = z.object({
  id: z.string().optional(),
  template_id: z.string().optional(),
  business_type: z.enum(['service', 'ecommerce', 'saas', 'generic']),
  business_name: z.string().min(1, 'Business name is required'),
  business_email: z.string().email('Invalid email'),
  business_phone: z.string().optional(),
  invoice_number: z.string().min(1, 'Invoice number is required'),
  invoice_date: z.string().min(1, 'Date is required'),
  due_date: z.string().min(1, 'Due date is required'),
  client_name: z.string().min(1, 'Client name is required'),
  client_email: z.string().email('Invalid email'),
  client_address: z.string().optional(),
  line_items: z.array(lineItemSchema),
  notes: z.string().optional(),
  is_draft: z.boolean().default(true),
  template_style: z.string().optional(),
});

export type InvoiceFormValues = z.infer<typeof invoiceSchema>;
export type LineItem = z.infer<typeof lineItemSchema>;
