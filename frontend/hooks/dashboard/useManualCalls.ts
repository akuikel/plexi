'use client';

import { useState, useEffect } from 'react';

export interface TranscriptEntry {
  time: string;
  speaker: string;
  text: string;
}

export interface CallData {
  id: string;
  title: string;
  status: 'ACTIVE' | 'COMPLETED' | 'SCHEDULED' | 'DRAFT';
  duration: string;
  date: string;
  scheduledStartTime?: string;
  createdAt: string;
  transcript: TranscriptEntry[];
  summary: string;
  recordingUrl?: string | null;
  phoneNumber?: string;
}

const STORAGE_KEY = 'plexi_calls_v1';

function load(): CallData[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function save(calls: CallData[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(calls));
}

export function useManualCalls() {
  const [calls, setCalls] = useState<CallData[]>([]);

  useEffect(() => {
    setCalls(load());
  }, []);

  const persist = (next: CallData[]) => {
    setCalls(next);
    save(next);
  };

  const addCall = (data: Omit<CallData, 'id' | 'createdAt' | 'transcript'>) => {
    const call: CallData = {
      ...data,
      id: `call-${Date.now()}`,
      createdAt: new Date().toISOString(),
      transcript: [],
    };
    persist([call, ...calls]);
    return call.id;
  };

  const updateStatus = (id: string, status: CallData['status']) => {
    persist(calls.map((c) => (c.id === id ? { ...c, status } : c)));
  };

  const updateCall = (id: string, updates: Partial<Omit<CallData, 'id'>>) => {
    persist(calls.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  const deleteCall = (id: string) => {
    persist(calls.filter((c) => c.id !== id));
  };

  const addTranscriptEntry = (callId: string, speaker: string, text: string) => {
    persist(
      calls.map((c) => {
        if (c.id !== callId) return c;
        const idx = c.transcript.length;
        const totalSecs = idx * 15;
        const m = Math.floor(totalSecs / 60);
        const s = totalSecs % 60;
        const entry: TranscriptEntry = { time: `${m}:${s.toString().padStart(2, '0')}`, speaker, text };
        return { ...c, transcript: [...c.transcript, entry] };
      })
    );
  };

  const deleteTranscriptEntry = (callId: string, idx: number) => {
    persist(
      calls.map((c) => {
        if (c.id !== callId) return c;
        const transcript = c.transcript.filter((_, i) => i !== idx);
        return { ...c, transcript };
      })
    );
  };

  return { calls, addCall, updateStatus, updateCall, deleteCall, addTranscriptEntry, deleteTranscriptEntry };
}
