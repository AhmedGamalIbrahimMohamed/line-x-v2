import { AfterViewInit, Component, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import emailjs from '@emailjs/browser';
import { environment } from '../../../../environments/environment';
import { ScrollAnimationService } from '../../../services/scroll-animation.service';

interface ContactToast {
  type: 'success' | 'error';
  message: string;
}

const TOAST_DURATION_MS = 5000;

/** A person needs longer than this to fill in four fields; anything faster is a script. */
const MIN_FILL_TIME_MS = 3000;

/** Minimum gap between two messages from the same browser. */
const COOLDOWN_MS = 30_000;
const LAST_SENT_KEY = 'x-line-contact-last';

@Component({
  selector: 'app-contact-form',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './contact-form.html',
  styleUrl: './contact-form.scss',
})
export class ContactForm implements AfterViewInit {
  @ViewChild('formRef') private formRef!: ElementRef<HTMLFormElement>;

  private anim = inject(ScrollAnimationService);

  isSubmitting = signal(false);
  toast = signal<ContactToast | null>(null);

  private toastTimeout?: ReturnType<typeof setTimeout>;
  private readonly openedAt = Date.now();

  ngAfterViewInit(): void {
    const host = this.formRef.nativeElement;
    const eyebrow = host.querySelector<HTMLElement>('.contact-form__eyebrow');
    const intro = host.querySelector<HTMLElement>('.contact-form__intro');
    const fields = host.querySelectorAll<HTMLElement>('.field');
    const submit = host.querySelector<HTMLElement>('.contact-form__submit');

    if (eyebrow) this.anim.fadeUp(eyebrow, host, { y: 25, start: 'top 90%' });
    if (intro) this.anim.fadeUp(intro, host, { y: 25, start: 'top 88%', delay: 0.1 });
    if (fields.length) this.anim.fadeUp(fields, host, { y: 30, stagger: 0.09, start: 'top 86%', delay: 0.15 });
    if (submit) this.anim.fadeUp(submit, host, { y: 25, start: 'top 80%', delay: 0.2 });
  }

  async onSubmit(event: Event): Promise<void> {
    event.preventDefault();
    if (this.isSubmitting()) return;

    const form = event.target as HTMLFormElement;
    const data = new FormData(form);

    // The "website" field is hidden from people. Bots fill it in, or submit before a person could type.
    // They get the normal success message so they learn nothing, but nothing is sent.
    if (data.get('website') || Date.now() - this.openedAt < MIN_FILL_TIME_MS) {
      form.reset();
      this.showToast('success', 'Contact.form.Success');
      return;
    }

    if (this.isOnCooldown()) {
      this.showToast('error', 'Contact.form.Wait');
      return;
    }

    this.isSubmitting.set(true);
    try {
      await emailjs.send(
        environment.emailjs.serviceId,
        environment.emailjs.templateId,
        {
          full_name: data.get('fullName'),
          company: data.get('company'),
          email_address: data.get('email'),
          phone_number: data.get('phone'),
          project_type: data.get('projectType'),
          project_message: data.get('projectDetails'),
          name: environment.contact.senderName,
          email: environment.contact.recipientEmail,
        },
        environment.emailjs.publicKey,
      );
      form.reset();
      this.rememberSent();
      this.showToast('success', 'Contact.form.Success');
    } catch {
      this.showToast('error', 'Contact.form.Error');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  private isOnCooldown(): boolean {
    try {
      return Date.now() - Number(localStorage.getItem(LAST_SENT_KEY) ?? 0) < COOLDOWN_MS;
    } catch {
      return false;
    }
  }

  private rememberSent(): void {
    try {
      localStorage.setItem(LAST_SENT_KEY, String(Date.now()));
    } catch {
      // Without storage the cooldown is simply not enforced.
    }
  }

  dismissToast(): void {
    clearTimeout(this.toastTimeout);
    this.toast.set(null);
  }

  private showToast(type: ContactToast['type'], message: string): void {
    clearTimeout(this.toastTimeout);
    this.toast.set({ type, message });
    this.toastTimeout = setTimeout(() => this.toast.set(null), TOAST_DURATION_MS);
  }
}
