// lib/db.ts
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

const isValidUrl = (url: string) => {
  try {
    return url.startsWith('http');
  } catch {
    return false;
  }
};

export const supabase = isValidUrl(supabaseUrl) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient('https://placeholder.supabase.co', 'placeholder');

export const isSupabaseConfigured = isValidUrl(supabaseUrl) && !!supabaseAnonKey && supabaseAnonKey !== 'placeholder';

// Mock database for when Supabase is not configured
class MockDB {
  private get(key: string) {
    return JSON.parse(localStorage.getItem(key) || '[]');
  }
  private set(key: string, data: any) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  async getTemplates() {
    const templates = this.get('templates');
    if (templates.length === 0) {
      const defaults = [
        { id: uuidv4(), name: 'Default Service', business_type: 'service', is_default: true, style_preferences: { layout: 'modern' } },
        { id: uuidv4(), name: 'Default E-commerce', business_type: 'ecommerce', is_default: true, style_preferences: { layout: 'classic' } },
        { id: uuidv4(), name: 'Default SaaS', business_type: 'saas', is_default: true, style_preferences: { layout: 'minimal' } },
        { id: uuidv4(), name: 'Default Generic', business_type: 'generic', is_default: true, style_preferences: { layout: 'classic' } },
      ];
      this.set('templates', defaults);
      return defaults;
    }
    return templates;
  }

  async getInvoices() {
    return this.get('invoices');
  }

  async getInvoice(id: string) {
    return this.get('invoices').find((i: any) => i.id === id);
  }

  async createInvoice(data: any) {
    const invoices = this.get('invoices');
    const newInvoice = { ...data, id: uuidv4(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    this.set('invoices', [...invoices, newInvoice]);
    
    // Mock history
    const history = this.get('invoice_history');
    this.set('invoice_history', [...history, {
      id: uuidv4(),
      invoice_id: newInvoice.id,
      version_number: 1,
      action: 'created',
      full_snapshot: newInvoice,
      created_at: new Date().toISOString()
    }]);

    return newInvoice;
  }

  async updateInvoice(id: string, data: any) {
    const invoices = this.get('invoices');
    const index = invoices.findIndex((i: any) => i.id === id);
    if (index === -1) throw new Error('Invoice not found');
    
    const updated = { ...invoices[index], ...data, updated_at: new Date().toISOString() };
    invoices[index] = updated;
    this.set('invoices', invoices);

    // Mock history
    const history = this.get('invoice_history');
    const versions = history.filter((h: any) => h.invoice_id === id);
    this.set('invoice_history', [...history, {
      id: uuidv4(),
      invoice_id: id,
      version_number: versions.length + 1,
      action: 'edited',
      full_snapshot: updated,
      created_at: new Date().toISOString()
    }]);

    return updated;
  }

  async getInvoiceHistory(id: string) {
    return this.get('invoice_history').filter((h: any) => h.invoice_id === id).sort((a: any, b: any) => b.version_number - a.version_number);
  }
}

const mockDb = new MockDB();

// Helper to handle Supabase errors and fallback to mock DB if tables don't exist
const handleSupabaseError = async <T>(
  operation: () => Promise<{ data: T | null; error: any }>,
  fallback: () => Promise<T> | T
): Promise<T> => {
  if (!isSupabaseConfigured) return fallback();
  
  try {
    const { data, error } = await operation();
    if (error) {
      // PGRST205 means table not found
      if (error.code === 'PGRST205') {
        console.warn(`Supabase table not found. Falling back to local storage. Please run the migrations in supabase/migrations/00001_initial_schema.sql`);
        return fallback();
      }
      throw error;
    }
    return data as T;
  } catch (err: any) {
    if (err?.code === 'PGRST205') {
      console.warn(`Supabase table not found. Falling back to local storage. Please run the migrations in supabase/migrations/00001_initial_schema.sql`);
      return fallback();
    }
    throw err;
  }
};

export const db = {
  templates: {
    list: async () => {
      return handleSupabaseError(
        async () => await supabase.from('templates').select('*'),
        () => mockDb.getTemplates()
      );
    }
  },
  invoices: {
    list: async () => {
      return handleSupabaseError(
        async () => await supabase.from('invoices').select('*').order('created_at', { ascending: false }),
        () => mockDb.getInvoices()
      );
    },
    get: async (id: string) => {
      return handleSupabaseError(
        async () => await supabase.from('invoices').select('*').eq('id', id).single(),
        () => mockDb.getInvoice(id)
      );
    },
    create: async (invoiceData: any) => {
      return handleSupabaseError(
        async () => await supabase.from('invoices').insert(invoiceData).select().single(),
        () => mockDb.createInvoice(invoiceData)
      );
    },
    update: async (id: string, invoiceData: any) => {
      return handleSupabaseError(
        async () => await supabase.from('invoices').update(invoiceData).eq('id', id).select().single(),
        () => mockDb.updateInvoice(id, invoiceData)
      );
    },
    getHistory: async (id: string) => {
      return handleSupabaseError(
        async () => await supabase.from('invoice_history').select('*').eq('invoice_id', id).order('version_number', { ascending: false }),
        () => mockDb.getInvoiceHistory(id)
      );
    },
    getByClient: async (clientEmail: string, currentInvoiceId: string) => {
      return handleSupabaseError(
        async () => await supabase.from('invoices').select('*').eq('client_email', clientEmail).neq('id', currentInvoiceId).order('created_at', { ascending: false }),
        () => {
          return mockDb.getInvoices().then(invoices => 
            invoices.filter((i: any) => i.client_email === clientEmail && i.id !== currentInvoiceId)
              .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          );
        }
      );
    }
  }
};
