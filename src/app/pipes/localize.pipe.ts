import { ChangeDetectorRef, OnDestroy, Pipe, PipeTransform, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { LocalizedText } from '../models/localized-text.model';

@Pipe({
  name: 'localize',
  pure: false,
})
export class LocalizePipe implements PipeTransform, OnDestroy {
  private translate = inject(TranslateService);
  private cdr = inject(ChangeDetectorRef);
  private subscription: Subscription;

  constructor() {
    this.subscription = this.translate.onLangChange.subscribe(() => this.cdr.markForCheck());
  }

  transform(value: LocalizedText | null | undefined): string {
    if (!value) return '';
    const lang = this.translate.currentLang || this.translate.defaultLang || 'en';
    return lang === 'ar' ? value.ar : value.en;
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
