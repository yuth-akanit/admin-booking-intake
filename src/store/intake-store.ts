import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AdminBookingDraft } from '../types/booking';
import { generateIdempotencyKey, generateCustomerId, generateJobNumber } from '../lib/utils';
import { getAreaKey } from '../lib/mappings';
import { normalizePhone } from '../lib/normalization';

interface IntakeStore {
  draft: AdminBookingDraft;
  isSaving: boolean;
  updateDraft: (updates: Partial<AdminBookingDraft>) => void;
  resetDraft: () => void;
  syncAreaKey: () => void;
  syncPhone: () => void;
}

const createInitialDraft = (): AdminBookingDraft => {
  // Default to tomorrow's date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const yyyy = tomorrow.getFullYear();
  const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
  const dd = String(tomorrow.getDate()).padStart(2, '0');

  return {
    customer_id: generateCustomerId(),
    customer_name: 'แอดมิน',
    phone: '',
    address_full: '',
    oa_channel: 'admin_oa_1',
    job_number: generateJobNumber(),
    slot_date: `${yyyy}-${mm}-${dd}`,
    slot_time: '09:00:00',
    area: '',
    area_key: '',
    job_type: 'cleaning',
    machine_count: '1',
    created_by_line_id: '',
    idempotency_key: generateIdempotencyKey(),
  };
};

export const useIntakeStore = create<IntakeStore>()(
  (set, get) => ({
    draft: createInitialDraft(),
    isSaving: false,

    updateDraft: (updates) => set((state) => ({
      draft: { ...state.draft, ...updates }
    })),

    resetDraft: () => set({ draft: createInitialDraft() }),

    syncAreaKey: () => {
      const { area } = get().draft;
      const key = getAreaKey(area);
      set((state) => ({ draft: { ...state.draft, area_key: key } }));
    },

    syncPhone: () => {
      const { phone } = get().draft;
      const clean = normalizePhone(phone);
      set((state) => ({ draft: { ...state.draft, phone: clean } }));
    }
  })
);
