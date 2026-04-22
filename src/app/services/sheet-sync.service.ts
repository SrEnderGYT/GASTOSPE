import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { FinanceRecord } from '../models/finance-record.model';

@Injectable({ providedIn: 'root' })
export class SheetSyncService {
  constructor(private readonly http: HttpClient) {}

  async sync(records: FinanceRecord[], endpoint: string): Promise<void> {
    if (!endpoint || !records.length) {
      return;
    }

    await firstValueFrom(
      this.http.post(endpoint, {
        app: 'gastospe',
        sentAt: new Date().toISOString(),
        records
      })
    );
  }
}
