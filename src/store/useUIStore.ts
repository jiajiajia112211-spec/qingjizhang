import { create } from 'zustand';
import type { TxType } from '../types';

export interface ToastAction {
  label: string;
  run: () => void;
}

export interface ToastMsg {
  id: number;
  message: string;
  type?: 'success' | 'warn';
  action?: ToastAction;
}

export interface AddSheetState {
  open: boolean;
  /** 编辑模式时传入交易 id */
  editingId: string | null;
  /** 打开时预置的记账类型（如从账户页发起转账） */
  presetType: TxType | null;
}

interface UIState {
  addSheet: AddSheetState;
  toast: ToastMsg | null;
  openAdd: (opts?: { editingId?: string; presetType?: TxType }) => void;
  closeAdd: () => void;
  showToast: (message: string, opts?: { type?: 'success' | 'warn'; action?: ToastAction }) => void;
  hideToast: () => void;
}

/** 会话级 UI 状态（不持久化） */
export const useUIStore = create<UIState>()((set) => ({
  addSheet: { open: false, editingId: null, presetType: null },
  toast: null,
  openAdd: (opts) =>
    set({
      addSheet: {
        open: true,
        editingId: opts?.editingId ?? null,
        presetType: opts?.presetType ?? null,
      },
    }),
  closeAdd: () => set({ addSheet: { open: false, editingId: null, presetType: null } }),
  showToast: (message, opts) =>
    set({ toast: { id: Date.now(), message, ...opts } }),
  hideToast: () => set({ toast: null }),
}));
