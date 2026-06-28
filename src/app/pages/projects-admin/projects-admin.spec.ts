import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { ProjectsAdminComponent } from './projects-admin';
import { ProjectsService } from '../../services/projects.service';
import { Project } from '../../models/project.model';

describe('ProjectsAdminComponent', () => {
  let component: ProjectsAdminComponent;
  let fixture: ComponentFixture<ProjectsAdminComponent>;

  beforeEach(async () => {
    const sampleProject: Project = {
      id: 'demo-project',
      category: 'Residential',
      card: {
        image: 'assets/images/demo.jpg',
        title: { en: 'Demo Project', ar: 'مشروع تجريبي' },
        location: { en: 'Jeddah', ar: 'جدة' },
        area: { en: '100 M²', ar: '100 م²' },
        size: 'large',
      },
      hero: {
        eyebrow: { en: 'Architecture case study', ar: 'دراسة حالة معمارية' },
        title: { en: 'Demo Project', ar: 'مشروع تجريبي' },
        subtitle: { en: 'A sample project', ar: 'مشروع تجريبي' },
        image: 'assets/images/demo-hero.jpg',
        details: {
          location: { en: 'Jeddah', ar: 'جدة' },
          totalArea: { en: '100 M²', ar: '100 م²' },
          year: '2026',
          scope: { en: 'Architecture', ar: 'العمارة' },
        },
      },
      overview: {
        challenge: {
          number: '01',
          title: { en: 'The Challenge', ar: 'التحدي' },
          quote: { en: 'A challenge', ar: 'تحدي' },
          paragraph1: { en: 'Challenge text', ar: 'نص التحدي' },
          paragraph2: { en: 'More challenge', ar: 'مزيد من التحدي' },
        },
        concept: {
          number: '02',
          title: { en: 'The Concept', ar: 'المفهوم' },
          quote: { en: 'A concept', ar: 'مفهوم' },
          paragraph1: { en: 'Concept text', ar: 'نص المفهوم' },
          paragraph2: { en: 'More concept', ar: 'مزيد من المفهوم' },
        },
      },
      designProcess: {
        label: { en: 'Design Process', ar: 'عملية التصميم' },
        images: ['assets/images/process-1.jpg'],
      },
      visualJourney: {
        label: { en: 'Visual Journey', ar: 'الرحلة البصرية' },
        images: ['assets/images/journey-1.jpg'],
      },
      solution: {
        number: '03',
        title: { en: 'The Solution', ar: 'الحل' },
        quote: { en: 'A solution', ar: 'حل' },
        paragraph1: { en: 'Solution text', ar: 'نص الحل' },
        paragraph2: { en: 'More solution', ar: 'مزيد من الحل' },
      },
      solutions: {
        image: 'assets/images/solution.jpg',
        title: { en: 'Spatial Experience', ar: 'التجربة المكانية' },
        text: { en: 'A spatial experience', ar: 'تجربة مكانية' },
      },
    };

    await TestBed.configureTestingModule({
      imports: [ProjectsAdminComponent, HttpClientTestingModule],
      providers: [{ provide: ProjectsService, useValue: { getAll: () => of([sampleProject]) } }],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectsAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should load the first project into the editor', () => {
    expect(component.projects.length).toBe(1);
    expect(component.selectedProject?.id).toBe('demo-project');
    expect(component.selectedProject?.card.title.en).toBe('Demo Project');
  });
});
