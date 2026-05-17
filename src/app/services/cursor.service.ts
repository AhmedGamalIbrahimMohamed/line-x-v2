import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CursorService {
  private cursorCircle: HTMLElement | null = null;
  private mouseX = 0;
  private mouseY = 0;
  private circleX = 0;
  private circleY = 0;
  private animationId: number | null = null;
  private hideTimeout: ReturnType<typeof setTimeout> | null = null;

  private onMouseMove = (event: MouseEvent): void => {
    this.mouseX = event.clientX;
    this.mouseY = event.clientY;

    this.cursorCircle?.classList.add('cursor-visible');

    if (this.hideTimeout !== null) {
      clearTimeout(this.hideTimeout);
    }

    this.hideTimeout = setTimeout(() => {
      this.cursorCircle?.classList.remove('cursor-visible');
    }, 1000);
  };

  initCursor(): void {
    const circle = document.createElement('div');
    circle.className = 'cursor-circle';
    document.body.appendChild(circle);
    this.cursorCircle = circle;

    document.addEventListener('mousemove', this.onMouseMove);

    const clickableSelector = 'a, button, [role="button"], input, textarea, select';
    document.querySelectorAll<HTMLElement>(clickableSelector).forEach(el => {
      el.addEventListener('mouseenter', this.onEnterClickable);
      el.addEventListener('mouseleave', this.onLeaveClickable);
    });

    // Use event delegation for dynamically added elements
    document.addEventListener('mouseover', this.onDocumentMouseOver);
    document.addEventListener('mouseout', this.onDocumentMouseOut);

    this.animate();
  }

  private onDocumentMouseOver = (event: MouseEvent): void => {
    const target = (event.target as HTMLElement)?.closest('a, button, [role="button"], input, textarea, select');
    if (target) {
      this.cursorCircle?.classList.add('cursor-hover');
    }
  };

  private onDocumentMouseOut = (event: MouseEvent): void => {
    const target = (event.target as HTMLElement)?.closest('a, button, [role="button"], input, textarea, select');
    if (target) {
      this.cursorCircle?.classList.remove('cursor-hover');
    }
  };

  private onEnterClickable = (): void => {
    this.cursorCircle?.classList.add('cursor-hover');
  };

  private onLeaveClickable = (): void => {
    this.cursorCircle?.classList.remove('cursor-hover');
  };

  private animate(): void {
    const speed = 0.15;
    this.circleX += (this.mouseX - this.circleX) * speed;
    this.circleY += (this.mouseY - this.circleY) * speed;

    if (this.cursorCircle) {
      this.cursorCircle.style.left = this.circleX + 'px';
      this.cursorCircle.style.top = this.circleY + 'px';
    }

    this.animationId = requestAnimationFrame(() => this.animate());
  }

  destroy(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }

    if (this.hideTimeout !== null) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }

    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseover', this.onDocumentMouseOver);
    document.removeEventListener('mouseout', this.onDocumentMouseOut);

    if (this.cursorCircle) {
      this.cursorCircle.remove();
      this.cursorCircle = null;
    }
  }
}
