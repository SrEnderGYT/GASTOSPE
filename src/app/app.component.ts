import { CommonModule } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FinanceRecord } from './models/finance-record.model';
import { LocalFinanceService } from './services/local-finance.service';
import { NetworkService } from './services/network.service';
import { SheetSyncService } from './services/sheet-sync.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  private readonly fb = inject(FormBuilder);
  private readonly localFinance = inject(LocalFinanceService);
  private readonly sheetSync = inject(SheetSyncService);
  private readonly network = inject(NetworkService);

  protected readonly records = signal<FinanceRecord[]>([]);
  protected readonly online = signal(this.network.isOnline());
  protected readonly syncing = signal(false);
  protected readonly syncMessage = signal('');

  protected readonly form = this.fb.nonNullable.group({
    movementType: ['egreso', Validators.required],
    amount: [0, [Validators.required, Validators.min(1)]],
    category: ['', Validators.required],
    note: [''],
    source: ['manual', Validators.required],
    sheetEndpoint: [localStorage.getItem('gastospe.sheetEndpoint') ?? '']
  });

  protected readonly whatsappInput = this.fb.nonNullable.control('');

  constructor() {
    this.localFinance.records$.subscribe((items) => this.records.set(items));
    this.network.online$.subscribe((isOnline) => this.online.set(isOnline));

    effect(() => {
      const endpoint = this.form.controls.sheetEndpoint.value;
      localStorage.setItem('gastospe.sheetEndpoint', endpoint);
    });
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { movementType, amount, category, note, source } = this.form.getRawValue();
    this.localFinance.addRecord({ movementType, amount: Number(amount), category, note, source });
    this.form.patchValue({ amount: 0, category: '', note: '', source: 'manual' });
  }

  protected importWhatsApp(): void {
    const parsed = this.localFinance.parseWhatsAppMessage(this.whatsappInput.value);
    if (!parsed) {
      this.syncMessage.set('Formato no reconocido. Usa: egreso 2500 supermercado');
      return;
    }

    this.localFinance.addRecord(parsed);
    this.whatsappInput.setValue('');
    this.syncMessage.set('Movimiento capturado desde WhatsApp.');
  }

  protected async syncNow(): Promise<void> {
    if (!this.online()) {
      this.syncMessage.set('Sin internet: guardado local activo. Se sincroniza cuando vuelva la red.');
      return;
    }

    const endpoint = this.form.controls.sheetEndpoint.value;
    const pending = this.localFinance.getPending();
    if (!pending.length) {
      this.syncMessage.set('No hay movimientos pendientes para sincronizar.');
      return;
    }

    this.syncing.set(true);
    try {
      await this.sheetSync.sync(pending, endpoint);
      this.localFinance.markAsSynced(pending.map((record) => record.id));
      this.syncMessage.set(`Sincronización exitosa (${pending.length} movimientos).`);
    } catch {
      this.syncMessage.set('Error sincronizando. Verifica Apps Script / Firebase endpoint.');
    } finally {
      this.syncing.set(false);
    }
  }

  protected incomeTotal(): number {
    return this.records()
      .filter((record) => record.movementType === 'ingreso')
      .reduce((acc, record) => acc + record.amount, 0);
  }

  protected expenseTotal(): number {
    return this.records()
      .filter((record) => record.movementType !== 'ingreso')
      .reduce((acc, record) => acc + record.amount, 0);
  }
}
