-- Create campaigns table
CREATE TABLE public.campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create leads table
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'responded', 'converted')),
  last_contact_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Create policies for campaigns
CREATE POLICY "Users can view their own campaigns" 
ON public.campaigns 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own campaigns" 
ON public.campaigns 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own campaigns" 
ON public.campaigns 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own campaigns" 
ON public.campaigns 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create policies for leads
CREATE POLICY "Users can view leads from their campaigns" 
ON public.leads 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.campaigns 
    WHERE campaigns.id = leads.campaign_id 
    AND campaigns.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create leads for their campaigns" 
ON public.leads 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.campaigns 
    WHERE campaigns.id = leads.campaign_id 
    AND campaigns.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update leads from their campaigns" 
ON public.leads 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.campaigns 
    WHERE campaigns.id = leads.campaign_id 
    AND campaigns.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete leads from their campaigns" 
ON public.leads 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.campaigns 
    WHERE campaigns.id = leads.campaign_id 
    AND campaigns.user_id = auth.uid()
  )
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_campaigns_updated_at
BEFORE UPDATE ON public.campaigns
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leads_updated_at
BEFORE UPDATE ON public.leads
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_campaigns_user_id ON public.campaigns(user_id);
CREATE INDEX idx_campaigns_status ON public.campaigns(status);
CREATE INDEX idx_leads_campaign_id ON public.leads(campaign_id);
CREATE INDEX idx_leads_status ON public.leads(status);
CREATE INDEX idx_leads_email ON public.leads(email);

-- Insert sample campaigns data
INSERT INTO public.campaigns (user_id, name, status, description) VALUES
  ('00000000-0000-0000-0000-000000000000', 'Tech Startup Outreach', 'active', 'Targeting tech startups for partnership opportunities'),
  ('00000000-0000-0000-0000-000000000000', 'E-commerce Growth', 'active', 'Helping e-commerce businesses scale their operations'),
  ('00000000-0000-0000-0000-000000000000', 'SaaS Lead Generation', 'paused', 'Generating qualified leads for SaaS companies'),
  ('00000000-0000-0000-0000-000000000000', 'Healthcare Innovation', 'draft', 'Connecting with healthcare innovation companies');

-- Insert sample leads data
INSERT INTO public.leads (campaign_id, name, email, company, status, last_contact_date, notes) VALUES
  ((SELECT id FROM public.campaigns WHERE name = 'Tech Startup Outreach' LIMIT 1), 'John Smith', 'john@techstartup.com', 'TechVenture Inc', 'contacted', '2024-01-15 10:30:00'::timestamp, 'Initial outreach sent, awaiting response'),
  ((SELECT id FROM public.campaigns WHERE name = 'Tech Startup Outreach' LIMIT 1), 'Sarah Johnson', 'sarah@innovatetech.com', 'InnovateTech Solutions', 'responded', '2024-01-14 15:45:00'::timestamp, 'Positive response, scheduling follow-up meeting'),
  ((SELECT id FROM public.campaigns WHERE name = 'E-commerce Growth' LIMIT 1), 'Mike Chen', 'mike@ecomstore.com', 'EcomStore Ltd', 'pending', NULL, 'Potential client for growth services'),
  ((SELECT id FROM public.campaigns WHERE name = 'E-commerce Growth' LIMIT 1), 'Lisa Park', 'lisa@shopify-store.com', 'ShopifyStore Plus', 'converted', '2024-01-12 09:15:00'::timestamp, 'Successfully converted to client'),
  ((SELECT id FROM public.campaigns WHERE name = 'SaaS Lead Generation' LIMIT 1), 'David Wilson', 'david@saascompany.com', 'SaaS Innovations', 'contacted', '2024-01-13 14:20:00'::timestamp, 'Follow-up needed next week'),
  ((SELECT id FROM public.campaigns WHERE name = 'Healthcare Innovation' LIMIT 1), 'Emma Davis', 'emma@healthtech.com', 'HealthTech Solutions', 'pending', NULL, 'High-value prospect for healthcare campaign');