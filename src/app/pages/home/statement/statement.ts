import { AfterViewInit, Component, ElementRef, inject, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ScrollAnimationService } from '../../../services/scroll-animation.service';

@Component({
  selector: 'app-statement',
  standalone: true,
  imports: [TranslateModule, RouterLink],
  templateUrl: './statement.html',
  styleUrl: './statement.scss',
})
export class StatementComponent implements AfterViewInit {
  @ViewChild('statementSection') private statementSection!: ElementRef<HTMLElement>;

  private anim = inject(ScrollAnimationService);

  ngAfterViewInit(): void {
    const host = this.statementSection.nativeElement;
    const divider = host.querySelector<HTMLElement>('.statement-divider');
    const spans = host.querySelectorAll<HTMLElement>('.statement-block span');
    const link = host.querySelector<HTMLElement>('.discover-link');

    if (divider) this.anim.lineGrow(divider, host, { duration: 1.0, start: 'top 90%' });
    if (spans.length) this.anim.fadeUp(spans, host, { y: 40, stagger: 0.14, start: 'top 85%', delay: 0.1 });
    if (link) this.anim.fadeUp(link, host, { y: 25, stagger: 0, start: 'top 80%', delay: 0.4 });
  }
}
