import { AfterViewInit, Component, ElementRef, inject, OnDestroy, ViewChild } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ScrollAnimationService } from '../../../services/scroll-animation.service';

@Component({
  selector: 'app-contact-info',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './contact-info.html',
  styleUrl: './contact-info.scss',
})
export class ContactInfo implements AfterViewInit, OnDestroy {
  @ViewChild('sectionRef') private sectionRef!: ElementRef<HTMLElement>;

  private anim = inject(ScrollAnimationService);

  readonly branches: string[] = [
    'Footer.Saudi Arabia Branch',
    'Footer.Egypt Branch',
    'Footer.Libya Branch',
    'Footer.UAE Branch',
    'Footer.Oman Branch',
    'Footer.Syria Branch',
  ];

  activeBranchIndex = 0;

  private readonly SLIDE_INTERVAL = 2800;
  private branchTimer?: ReturnType<typeof setInterval>;

  ngAfterViewInit(): void {
    const host = this.sectionRef.nativeElement;
    const methods = host.querySelectorAll<HTMLElement>('.contact-method');
    if (methods.length) this.anim.fadeUp(methods, host, { y: 45, stagger: 0.14, start: 'top 87%' });

    this.branchTimer = setInterval(() => this.nextBranch(), this.SLIDE_INTERVAL);
  }

  ngOnDestroy(): void {
    clearInterval(this.branchTimer);
  }

  goToBranch(index: number): void {
    this.activeBranchIndex = index;
  }

  private nextBranch(): void {
    this.activeBranchIndex = (this.activeBranchIndex + 1) % this.branches.length;
  }
}
