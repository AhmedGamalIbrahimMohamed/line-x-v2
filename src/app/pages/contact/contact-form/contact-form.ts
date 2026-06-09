import { AfterViewInit, Component, ElementRef, inject, ViewChild } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ScrollAnimationService } from '../../../services/scroll-animation.service';

@Component({
  selector: 'app-contact-form',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './contact-form.html',
  styleUrl: './contact-form.scss',
})
export class ContactForm implements AfterViewInit {
  @ViewChild('formRef') private formRef!: ElementRef<HTMLElement>;

  private anim = inject(ScrollAnimationService);

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
}
