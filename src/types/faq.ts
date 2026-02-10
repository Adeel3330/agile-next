export type FaqPosition = 'home' | 'affiliate';
export type FaqStatus = 'active' | 'inactive';

export interface Faq {
  id: string;
  question: string;
  answer: string;
  position: FaqPosition;
  display_order: number;
  status: FaqStatus;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface FaqCreateInput {
  question: string;
  answer: string;
  position: FaqPosition;
  display_order?: number;
  status?: FaqStatus;
}

export interface FaqUpdateInput {
  question?: string;
  answer?: string;
  position?: FaqPosition;
  display_order?: number;
  status?: FaqStatus;
}
