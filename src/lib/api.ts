import { supabase } from '@/integrations/supabase/client';

export interface Lead {
  id: string;
  campaign_id: string;
  name: string;
  email: string;
  company: string | null;
  status: 'pending' | 'contacted' | 'responded' | 'converted';
  last_contact_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  campaign?: Campaign;
}

export interface Campaign {
  id: string;
  user_id: string;
  name: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  description: string | null;
  created_at: string;
  updated_at: string;
  leads?: Lead[];
}

export const api = {
  // Leads
  async getLeads(params?: {
    search?: string;
    status?: string;
    campaign_id?: string;
    limit?: number;
    offset?: number;
  }) {
    let query = supabase
      .from('leads')
      .select(`
        *,
        campaign:campaigns(id, name, status)
      `)
      .order('created_at', { ascending: false });

    if (params?.search) {
      query = query.or(`name.ilike.%${params.search}%,email.ilike.%${params.search}%,company.ilike.%${params.search}%`);
    }

    if (params?.status && params.status !== 'all') {
      query = query.eq('status', params.status);
    }

    if (params?.campaign_id) {
      query = query.eq('campaign_id', params.campaign_id);
    }

    if (params?.limit) {
      query = query.limit(params.limit);
    }

    if (params?.offset) {
      query = query.range(params.offset, params.offset + (params.limit || 10) - 1);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    return data as Lead[];
  },

  async getLead(id: string) {
    const { data, error } = await supabase
      .from('leads')
      .select(`
        *,
        campaign:campaigns(id, name, status, description)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Lead;
  },

  async updateLead(id: string, updates: Partial<Lead>) {
    const { data, error } = await supabase
      .from('leads')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Lead;
  },

  async createLead(lead: Omit<Lead, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('leads')
      .insert(lead)
      .select()
      .single();

    if (error) throw error;
    return data as Lead;
  },

  async deleteLead(id: string) {
    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Campaigns
  async getCampaigns(params?: {
    status?: string;
    limit?: number;
    offset?: number;
  }) {
    let query = supabase
      .from('campaigns')
      .select(`
        *,
        leads(id, status)
      `)
      .order('created_at', { ascending: false });

    if (params?.status && params.status !== 'all') {
      query = query.eq('status', params.status);
    }

    if (params?.limit) {
      query = query.limit(params.limit);
    }

    if (params?.offset) {
      query = query.range(params.offset, params.offset + (params.limit || 10) - 1);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    return data as Campaign[];
  },

  async getCampaign(id: string) {
    const { data, error } = await supabase
      .from('campaigns')
      .select(`
        *,
        leads(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Campaign;
  },

  async updateCampaign(id: string, updates: Partial<Campaign>) {
    const { data, error } = await supabase
      .from('campaigns')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Campaign;
  },

  async createCampaign(campaign: Omit<Campaign, 'id' | 'user_id' | 'created_at' | 'updated_at'>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('campaigns')
      .insert({ ...campaign, user_id: user.id })
      .select()
      .single();

    if (error) throw error;
    return data as Campaign;
  },

  async deleteCampaign(id: string) {
    const { error } = await supabase
      .from('campaigns')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};