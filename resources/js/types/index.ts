export interface User {
  id: number;
  name: string;
  email: string;
  role: 'superadmin' | 'event_planner' | 'protocol' | 'host';
  is_active: boolean;
  avatar?: string | null;
  avatar_url?: string | null;
  partner?: Partner;
}

export interface Partner {
  id: number;
  user_id?: number | null;
  business_name: string;
  business_rut?: string;
  logo?: string | null;
  logo_url?: string | null;
  business_address?: string;
  business_phone?: string;
  contact_name?: string;
  contact_phone?: string;
  social_links?: SocialLink[];
  is_active: boolean;
  user?: User;
  users?: User[];
}

export type SocialLinkType =
  | 'phone'
  | 'movil'
  | 'whatsapp'
  | 'web'
  | 'facebook'
  | 'instagram'
  | 'tiktok'
  | 'youtube'
  | 'x';

export interface SocialLink {
  type: SocialLinkType;
  value: string;
}

export interface ItineraryItem {
  id: string;
  name: string;
  date: string;
  start_time: string;
  end_time: string;
  location_name: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
}

export interface Event {
  id: number;
  partner_id: number;
  template_id?: number;
  name: string;
  event_type: 'wedding' | 'quince' | 'birthday' | 'corporate' | 'other';
  event_date: string;
  location?: string;
  latitude?: number | null;
  longitude?: number | null;
  itinerary?: ItineraryItem[] | null;
  description?: string;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  theme_color?: string;
  cover_image?: string;
  guest_count?: number;
  confirmed_count?: number;
  guests?: Array<{ id: number; rsvp_status?: string }>;
  partner?: Partner;
}

export interface InvitationTemplate {
  id: number;
  created_by: number;
  name: string;
  event_type: string;
  category: 'web' | 'video';
  thumbnail?: string;
  content_json?: string;
  video_config_json?: string;
  is_global: boolean;
  creator?: User;
}

export interface Invitation {
  id: number;
  event_id: number;
  title: string;
  slug?: string;
  description?: string | null;
  template: string;
  content?: any;
  is_active: boolean;
  guests_count?: number;
  guests?: Guest[];
  created_at?: string;
  updated_at?: string;
}

export interface Guest {
  id: number;
  event_id: number;
  table_id?: number | null;
  invitation_id?: number | null;
  name: string;
  email?: string | null;
  phone?: string | null;
  family_group?: string;
  plus_allowed?: number;
  rsvp_token?: string;
  rsvp_status?: 'pending' | 'confirmed' | 'declined';
  plus_actual?: number;
  message?: string;
  allergies?: string;
  created_at?: string;
}

export interface MenuItem {
  id: number;
  event_id: number;
  name: string;
  description?: string;
  category: 'adult' | 'child' | 'vegan' | 'vegetarian';
  is_available: boolean;
}

export interface GuestMenuSelection {
  id: number;
  guest_id: number;
  menu_item_id: number;
  menu_item?: MenuItem;
}

export interface TableEvent {
  id: number;
  event_id: number;
  name: string;
  capacity: number;
  shape: 'round' | 'rectangular' | 'square';
  position_x: number;
  position_y: number;
  width: number;
  height: number;
  rotation: number;
}

export interface GuestTableAssignment {
  id: number;
  guest_id: number;
  table_id: number;
  seat_number?: number;
  guest?: Guest;
}

export interface CreditBalance {
  id: number;
  partner_id: number;
  web_credits: number;
  video_credits: number;
}

export interface CreditTransaction {
  id: number;
  partner_id: number;
  type: 'purchase' | 'consumption' | 'refund';
  credits_web: number;
  credits_video: number;
  amount?: number;
  reference?: string;
  notes?: string;
  created_at: string;
}

export interface DashboardStats {
  total_events: number;
  active_events: number;
  total_guests: number;
  confirmed_guests: number;
  events_by_type: Record<string, number>;
  credits_web: number;
  credits_video: number;
}
