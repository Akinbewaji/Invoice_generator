-- Create enums
CREATE TYPE business_type AS ENUM ('service', 'ecommerce', 'saas', 'generic');
CREATE TYPE invoice_action AS ENUM ('created', 'edited', 'sent', 'paid', 'finalized', 'duplicated');
CREATE TYPE invoice_status AS ENUM ('draft', 'sent', 'viewed', 'partially_paid', 'paid', 'overdue', 'cancelled');

-- Create templates table
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  business_type business_type NOT NULL,
  description TEXT,
  business_data JSONB DEFAULT '{}'::jsonb,
  line_items_template JSONB DEFAULT '[]'::jsonb,
  style_preferences JSONB DEFAULT '{}'::jsonb,
  groq_generated_config JSONB DEFAULT '{}'::jsonb,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create invoices table
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES templates(id) ON DELETE SET NULL,
  business_type business_type NOT NULL,
  business_name TEXT,
  business_email TEXT,
  business_phone TEXT,
  invoice_number TEXT UNIQUE,
  invoice_date DATE,
  due_date DATE,
  client_name TEXT,
  client_email TEXT,
  client_address TEXT,
  line_items JSONB DEFAULT '[]'::jsonb,
  subtotal DECIMAL(10, 2) DEFAULT 0,
  tax_rate DECIMAL(5, 2) DEFAULT 0,
  tax_amount DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) DEFAULT 0,
  notes TEXT,
  template_style TEXT,
  draft_data JSONB,
  is_draft BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create invoice_history table
CREATE TABLE invoice_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  action invoice_action NOT NULL,
  changed_fields JSONB,
  full_snapshot JSONB NOT NULL,
  previous_version_id UUID REFERENCES invoice_history(id),
  change_reason TEXT,
  changed_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create invoice_status_log table
CREATE TABLE invoice_status_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  status invoice_status NOT NULL,
  status_change_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  payment_date TIMESTAMP WITH TIME ZONE,
  amount_paid DECIMAL(10, 2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX idx_invoices_created_at ON invoices(created_at);
CREATE INDEX idx_invoices_template_id ON invoices(template_id);
CREATE INDEX idx_invoice_history_invoice_id ON invoice_history(invoice_id);
CREATE INDEX idx_invoice_status_log_invoice_id ON invoice_status_log(invoice_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_templates_updated_at
    BEFORE UPDATE ON templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at
    BEFORE UPDATE ON invoices
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for auto-logging history
CREATE OR REPLACE FUNCTION log_invoice_history()
RETURNS TRIGGER AS $$
DECLARE
    next_version INTEGER;
    prev_id UUID;
    changed JSONB;
BEGIN
    -- Get next version number
    SELECT COALESCE(MAX(version_number), 0) + 1 INTO next_version
    FROM invoice_history WHERE invoice_id = NEW.id;
    
    -- Get previous history id
    SELECT id INTO prev_id
    FROM invoice_history WHERE invoice_id = NEW.id ORDER BY version_number DESC LIMIT 1;
    
    -- Calculate changed fields (simplified for JSONB)
    IF TG_OP = 'UPDATE' THEN
        changed = jsonb_build_object(
            'old', to_jsonb(OLD),
            'new', to_jsonb(NEW)
        );
    ELSE
        changed = NULL;
    END IF;

    INSERT INTO invoice_history (
        invoice_id, 
        version_number, 
        action, 
        changed_fields, 
        full_snapshot, 
        previous_version_id,
        changed_by
    ) VALUES (
        NEW.id,
        next_version,
        CASE WHEN TG_OP = 'INSERT' THEN 'created'::invoice_action ELSE 'edited'::invoice_action END,
        changed,
        to_jsonb(NEW),
        prev_id,
        'system'
    );
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_log_invoice_history
    AFTER INSERT OR UPDATE ON invoices
    FOR EACH ROW
    EXECUTE FUNCTION log_invoice_history();

-- Insert default templates
INSERT INTO templates (name, business_type, description, is_default, style_preferences) VALUES
('Default Service', 'service', 'Standard template for service-based businesses like consultants and freelancers.', true, '{"layout": "modern", "colors": {"primary": "#4f46e5", "secondary": "#6b7280"}}'),
('Default E-commerce', 'ecommerce', 'Standard template for e-commerce and retail businesses.', true, '{"layout": "classic", "colors": {"primary": "#059669", "secondary": "#6b7280"}}'),
('Default SaaS', 'saas', 'Standard template for SaaS and subscription businesses.', true, '{"layout": "minimal", "colors": {"primary": "#2563eb", "secondary": "#6b7280"}}'),
('Default Generic', 'generic', 'Flexible template for any business type.', true, '{"layout": "classic", "colors": {"primary": "#111827", "secondary": "#6b7280"}}');
