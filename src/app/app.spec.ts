import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    // Keep the intro overlay out of the way: it plays once per session.
    sessionStorage.setItem('x-line-intro-seen', '1');

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideTranslateService({ lang: 'en', fallbackLang: 'en' }),
      ],
    }).compileComponents();
  });

  afterEach(() => {
    sessionStorage.removeItem('x-line-intro-seen');
    document.body.classList.remove('admin-mode');
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the public chrome, a skip link and the main landmark', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelector('app-navbar')).not.toBeNull();
    expect(root.querySelector('app-footer')).not.toBeNull();
    expect(root.querySelector('a.skip-link')).not.toBeNull();
    expect(root.querySelector('main#main-content')).not.toBeNull();
  });

  it('hides the public chrome on admin routes', () => {
    const fixture = TestBed.createComponent(App);
    fixture.componentInstance.isAdminRoute.set(true);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelector('app-navbar')).toBeNull();
    expect(root.querySelector('app-footer')).toBeNull();
    expect(root.querySelector('main')).toBeNull();
  });
});
