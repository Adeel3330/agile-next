-- Affiliate Program Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Affiliates table - stores affiliate partner information
CREATE TABLE IF NOT EXISTS affiliates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(50),
  company_name VARCHAR(255),
  website VARCHAR(500),
  affiliate_code VARCHAR(50) NOT NULL UNIQUE,
  commission_rate DECIMAL(5,2) DEFAULT 10.00, -- Percentage commission
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'inactive', 'blocked')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Affiliate Applications table - tracks applications submitted through affiliates
CREATE TABLE IF NOT EXISTS affiliate_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID REFERENCES affiliates(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  provider_type VARCHAR(20) NOT NULL CHECK (provider_type IN ('individual', 'group')),
  application_fee DECIMAL(10,2) DEFAULT 0.00,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Affiliate Leads table - tracks leads generated via affiliate links
CREATE TABLE IF NOT EXISTS affiliate_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID REFERENCES affiliates(id) ON DELETE SET NULL,
  name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  source VARCHAR(100), -- Where the lead came from (landing page, form, etc.)
  ip_address VARCHAR(45),
  user_agent TEXT,
  referrer_url TEXT,
  converted BOOLEAN DEFAULT FALSE, -- Whether lead converted to application
  application_id UUID REFERENCES affiliate_applications(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Payouts table - tracks affiliate commission payouts
CREATE TABLE IF NOT EXISTS payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID REFERENCES affiliates(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  commission_rate DECIMAL(5,2) NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'paid', 'cancelled')),
  payment_method VARCHAR(50), -- bank_transfer, paypal, check, etc.
  payment_reference VARCHAR(255), -- Transaction ID, check number, etc.
  paid_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_affiliates_code ON affiliates(affiliate_code);
CREATE INDEX IF NOT EXISTS idx_affiliates_status ON affiliates(status);
CREATE INDEX IF NOT EXISTS idx_affiliates_email ON affiliates(email);

CREATE INDEX IF NOT EXISTS idx_affiliate_applications_affiliate_id ON affiliate_applications(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_applications_status ON affiliate_applications(status);
CREATE INDEX IF NOT EXISTS idx_affiliate_applications_provider_type ON affiliate_applications(provider_type);
CREATE INDEX IF NOT EXISTS idx_affiliate_applications_created_at ON affiliate_applications(created_at);

CREATE INDEX IF NOT EXISTS idx_affiliate_leads_affiliate_id ON affiliate_leads(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_leads_converted ON affiliate_leads(converted);
CREATE INDEX IF NOT EXISTS idx_affiliate_leads_application_id ON affiliate_leads(application_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_leads_created_at ON affiliate_leads(created_at);

CREATE INDEX IF NOT EXISTS idx_payouts_affiliate_id ON payouts(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_payouts_status ON payouts(status);
CREATE INDEX IF NOT EXISTS idx_payouts_period ON payouts(period_start, period_end);

-- Function to automatically generate affiliate code
CREATE OR REPLACE FUNCTION generate_affiliate_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.affiliate_code IS NULL OR NEW.affiliate_code = '' THEN
    NEW.affiliate_code := 'AFF-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT || NEW.id::TEXT) FROM 1 FOR 8));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate affiliate code
CREATE TRIGGER trigger_generate_affiliate_code
  BEFORE INSERT ON affiliates
  FOR EACH ROW
  EXECUTE FUNCTION generate_affiliate_code();

-- Function to calculate application fee based on provider type
CREATE OR REPLACE FUNCTION calculate_application_fee(provider_type_param VARCHAR)
RETURNS DECIMAL AS $$
BEGIN
  IF provider_type_param = 'individual' THEN
    RETURN 0.00;
  ELSIF provider_type_param = 'group' THEN
    RETURN 50.00;
  ELSE
    RETURN 0.00;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to auto-update updated_at
CREATE TRIGGER update_affiliates_updated_at BEFORE UPDATE ON affiliates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_affiliate_applications_updated_at BEFORE UPDATE ON affiliate_applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_affiliate_leads_updated_at BEFORE UPDATE ON affiliate_leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payouts_updated_at BEFORE UPDATE ON payouts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
