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
          name: 'line-x',
          email: 'a.elshiekh@linex.sa',
        },
        environment.emailjs.publicKey,
      );
      form.reset();
      this.showToast('success', 'Contact.form.Success');
    } catch {
      this.showToast('error', 'Contact.form.Error');
    } finally {
      this.isSubmitting.set(false);
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
