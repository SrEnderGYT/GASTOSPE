import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FinanceRecord } from '../models/finance-record.model';

const STORAGE_KEY = 'gastospe.records';

@Injectable({ providedIn: 'root' })
export class LocalFinanceService {
  private readonly recordsSubject = new BehaviorSubject<FinanceRecord[]>(this.loadRecords());
  readonly records$ = this.recordsSubject.asObservable();

  addRecord(record: Omit<FinanceRecord, 'id' | 'createdAt' | 'synced'>): FinanceRecord {
    const newRecord: FinanceRecord = {
      ...record,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      synced: false
    };

    const updated = [newRecord, ...this.recordsSubject.value];
    this.persist(updated);
    return newRecord;
  }

  markAsSynced(ids: string[]): void {
    const updated = this.recordsSubject.value.map((record) =>
      ids.includes(record.id) ? { ...record, synced: true } : record
    );
    this.persist(updated);
  }

  getPending(): FinanceRecord[] {
    return this.recordsSubject.value.filter((record) => !record.synced);
  }

  parseWhatsAppMessage(text: string): Omit<FinanceRecord, 'id' | 'createdAt' | 'synced'> | null {
    const match = text.match(/(ingreso|egreso|pago)\s+([\d.,]+)\s+([\w\s-]+)/i);
    if (!match) {
      return null;
    }

    const amount = Number.parseFloat(match[2].replace(',', '.'));
    if (Number.isNaN(amount)) {
      return null;
    }

    return {
      movementType: match[1].toLowerCase() as FinanceRecord['movementType'],
      amount,
      category: match[3].trim(),
      note: text,
      source: 'whatsapp'
    };
  }

  private loadRecords(): FinanceRecord[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    try {
      return JSON.parse(raw) as FinanceRecord[];
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      return [];
    }
  }

  private persist(records: FinanceRecord[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    this.recordsSubject.next(records);
  }
}
