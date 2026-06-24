import { Injectable } from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export interface FadeUpOptions {
  duration?: number;
  y?: number;
  stagger?: number;
  delay?: number;
  start?: string;
  ease?: string;
  once?: boolean;
}

export interface SlideOptions {
  duration?: number;
  x?: number;
  stagger?: number;
  delay?: number;
  start?: string;
  once?: boolean;
}

export interface ClipRevealOptions {
  duration?: number;
  stagger?: number;
  start?: string;
  yOffset?: number;
  once?: boolean;
}

export interface StaggerOptions {
  duration?: number;
  y?: number;
  stagger?: number;
  start?: string;
  delay?: number;
  ease?: string;
  once?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ScrollAnimationService {

  fadeUp(
    elements: Element | Element[] | NodeListOf<Element> | string,
    trigger: Element,
    opts: FadeUpOptions = {}
  ): gsap.core.Tween {
    const { duration = 1.4, y = 55, stagger = 0.18, delay = 0, start = 'top 87%', ease = 'power3.out', once = false } = opts;
    return gsap.from(elements as gsap.TweenTarget, {
      y,
      autoAlpha: 0,
      duration,
      stagger,
      delay,
      ease,
      scrollTrigger: once
        ? { trigger, start, once: true }
        : { trigger, start, toggleActions: 'play none none reverse' },
    });
  }

  clipReveal(
    elements: Element | Element[] | NodeListOf<Element> | string,
    trigger: Element,
    opts: ClipRevealOptions = {}
  ): gsap.core.Tween {
    const { duration = 1.6, stagger = 0.14, start = 'top 88%', yOffset = 18, once = false } = opts;
    return gsap.fromTo(
      elements as gsap.TweenTarget,
      { clipPath: 'inset(105% 0% -0.25em 0%)', y: yOffset },
      {
        clipPath: 'inset(0% 0% -0.25em 0%)',
        y: 0,
        duration,
        stagger,
        ease: 'power4.out',
        scrollTrigger: once
          ? { trigger, start, once: true }
          : { trigger, start, toggleActions: 'play none none reverse' },
      }
    );
  }

  slideFromLeft(
    elements: Element | Element[] | NodeListOf<Element> | string,
    trigger: Element,
    opts: SlideOptions = {}
  ): gsap.core.Tween {
    const { duration = 1.5, x = -70, stagger = 0.15, delay = 0, start = 'top 85%', once = false } = opts;
    return gsap.from(elements as gsap.TweenTarget, {
      x,
      autoAlpha: 0,
      duration,
      stagger,
      delay,
      ease: 'power3.out',
      scrollTrigger: once
        ? { trigger, start, once: true }
        : { trigger, start, toggleActions: 'play none none reverse' },
    });
  }

  slideFromRight(
    elements: Element | Element[] | NodeListOf<Element> | string,
    trigger: Element,
    opts: SlideOptions = {}
  ): gsap.core.Tween {
    const { duration = 1.5, x = 70, stagger = 0.15, delay = 0, start = 'top 85%', once = false } = opts;
    return gsap.from(elements as gsap.TweenTarget, {
      x,
      autoAlpha: 0,
      duration,
      stagger,
      delay,
      ease: 'power3.out',
      scrollTrigger: once
        ? { trigger, start, once: true }
        : { trigger, start, toggleActions: 'play none none reverse' },
    });
  }

  scaleIn(
    elements: Element | Element[] | NodeListOf<Element> | string,
    trigger: Element,
    opts: { duration?: number; scale?: number; stagger?: number; start?: string; delay?: number; once?: boolean } = {}
  ): gsap.core.Tween {
    const { duration = 1.3, scale = 0.88, stagger = 0.15, start = 'top 87%', delay = 0, once = false } = opts;
    return gsap.from(elements as gsap.TweenTarget, {
      scale,
      autoAlpha: 0,
      duration,
      stagger,
      delay,
      ease: 'power3.out',
      scrollTrigger: once
        ? { trigger, start, once: true }
        : { trigger, start, toggleActions: 'play none none reverse' },
    });
  }

  lineGrow(
    elements: Element | Element[] | NodeListOf<Element> | string,
    trigger: Element,
    opts: { duration?: number; start?: string; delay?: number; once?: boolean } = {}
  ): gsap.core.Tween {
    const { duration = 1.8, start = 'top 90%', delay = 0, once = false } = opts;
    return gsap.from(elements as gsap.TweenTarget, {
      scaleX: 0,
      transformOrigin: 'left center',
      duration,
      delay,
      ease: 'power3.inOut',
      scrollTrigger: once
        ? { trigger, start, once: true }
        : { trigger, start, toggleActions: 'play none none reverse' },
    });
  }

  staggerChildren(
    container: Element,
    childSelector: string,
    opts: StaggerOptions = {}
  ): gsap.core.Tween | undefined {
    const { duration = 1.2, y = 45, stagger = 0.2, start = 'top 86%', delay = 0, ease = 'power3.out', once = false } = opts;
    const children = container.querySelectorAll(childSelector);
    if (!children.length) return undefined;
    return gsap.from(children, {
      y,
      autoAlpha: 0,
      duration,
      stagger,
      delay,
      ease,
      scrollTrigger: once
        ? { trigger: container, start, once: true }
        : { trigger: container, start, toggleActions: 'play none none reverse' },
    });
  }

  parallaxLayer(
    element: Element,
    opts: { speed?: number; start?: string; end?: string } = {}
  ): gsap.core.Tween {
    const { speed = -40, start = 'top bottom', end = 'bottom top' } = opts;
    return gsap.to(element, {
      y: speed,
      ease: 'none',
      force3D: true,
      scrollTrigger: { trigger: element, start, end, scrub: 1.5 },
    });
  }

  heroEntrance(
    eyebrow: Element | null,
    titleLines: NodeListOf<Element> | Element[],
    description: Element | null,
    actions: Element | null
  ): gsap.core.Timeline {
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

    if (eyebrow) {
      tl.fromTo(eyebrow, { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1.0 }, 0.1);
    }

    if (titleLines.length) {
      tl.fromTo(
        titleLines,
        { clipPath: 'inset(105% 0% -0.25em 0%)', y: 20 },
        { clipPath: 'inset(0% 0% -0.25em 0%)', y: 0, duration: 1.4, stagger: 0.15 },
        eyebrow ? 0.35 : 0.1
      );
    }

    if (description) {
      tl.fromTo(description, { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1.1 }, '-=0.55');
    }

    if (actions) {
      tl.fromTo(actions, { y: 25, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1.0 }, '-=0.6');
    }

    return tl;
  }

  refresh(): void {
    ScrollTrigger.refresh();
  }

  killAll(): void {
    ScrollTrigger.getAll().forEach((st) => st.kill());
  }
}
