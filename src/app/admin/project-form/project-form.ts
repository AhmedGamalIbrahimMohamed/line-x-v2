import { Component, HostListener, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { PROJECT_CATEGORIES, Project } from '../../models/project.model';
import { AdminApiService, apiErrorMessage } from '../core/admin-api.service';
import { slugify } from './slugify';

type ImageTarget = 'card' | 'hero' | 'spatialExperience';
type GalleryTarget = 'designProcess' | 'visualJourney';

@Component({
  selector: 'app-admin-project-form',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './project-form.html',
})
export class AdminProjectForm implements OnInit {
  private readonly api = inject(AdminApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly categories = PROJECT_CATEGORIES;

  project: Project = this.blankProject();
  isNew = true;
  isLoading = false;
  isSaving = false;
  uploadsInFlight = 0;
  message = '';
  messageType: 'success' | 'error' = 'success';
  /** True once the admin has typed their own ID, so the title no longer rewrites it. */
  slugTouched = false;

  private savedSnapshot = '';

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.markClean();
      return;
    }

    this.isNew = false;
    this.isLoading = true;
    this.api.getProject(id).subscribe({
      next: (project) => {
        this.project = this.withShowcaseDefaults(project);
        this.markClean();
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.showMessage(apiErrorMessage(error, 'Could not load this project.'), 'error');
      },
    });
  }

  save(): void {
    this.isSaving = true;
    this.message = '';

    const request: Observable<Project> = this.isNew
      ? this.api.createProject(this.project)
      : this.api.updateProject(this.project);

    request.subscribe({
      next: (saved) => {
        this.isSaving = false;
        this.project = this.withShowcaseDefaults(saved);
        this.markClean();
        if (this.isNew) {
          this.router.navigate(['/admin/projects', saved.id]);
          return;
        }
        this.showMessage('Project saved.', 'success');
      },
      error: (error) => {
        this.isSaving = false;
        this.showMessage(apiErrorMessage(error, 'Could not save the project.'), 'error');
      },
    });
  }

  addDesignProcessImage(): void {
    this.project.designProcess.images = [...this.project.designProcess.images, ''];
  }

  removeDesignProcessImage(index: number): void {
    this.project.designProcess.images.splice(index, 1);
  }

  addVisualJourneyImage(): void {
    this.project.visualJourney.images = [...this.project.visualJourney.images, ''];
  }

  removeVisualJourneyImage(index: number): void {
    this.project.visualJourney.images.splice(index, 1);
  }

  handleImageUpload(event: Event, target: ImageTarget): void {
    this.upload(event, (url) => {
      if (target === 'card') this.project.card.image = url;
      else if (target === 'hero') this.project.hero.image = url;
      else this.project.spatialExperience.image = url;
    });
  }

  handleArrayImageUpload(event: Event, target: GalleryTarget, index: number): void {
    this.upload(event, (url) => {
      this.project[target].images[index] = url;
    });
  }

  private upload(event: Event, apply: (url: string) => void): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.uploadsInFlight++;
    this.api.uploadImage(file).subscribe({
      next: (url) => {
        apply(url);
        this.uploadsInFlight--;
        input.value = '';
      },
      error: (error) => {
        this.uploadsInFlight--;
        input.value = '';
        this.showMessage(apiErrorMessage(error, 'Image upload failed.'), 'error');
      },
    });
  }

  /** True while there are edits that have not been saved. Used by the leave-page guard. */
  isDirty(): boolean {
    return !this.isLoading && JSON.stringify(this.project) !== this.savedSnapshot;
  }

  /** A new project's ID follows its English card title until the admin types an ID themselves. */
  onTitleChange(title: string): void {
    if (this.isNew && !this.slugTouched) this.project.id = slugify(title);
  }

  /** The card and hero image are always shown on the site, so a published project needs both. */
  get missingRequiredImages(): boolean {
    return !!this.project.isPublished && (!this.project.card.image || !this.project.hero.image);
  }

  /** Warns before a tab close or reload throws edits away. */
  @HostListener('window:beforeunload', ['$event'])
  warnBeforeUnload(event: BeforeUnloadEvent): void {
    if (this.isDirty()) event.preventDefault();
  }

  private markClean(): void {
    this.savedSnapshot = JSON.stringify(this.project);
  }

  /** Projects saved before the `showcase` flag existed have none; they show every section. */
  private withShowcaseDefaults(project: Project): Project {
    const { challenge, concept } = project.overview;
    challenge.showcase = challenge.showcase !== false;
    concept.showcase = concept.showcase !== false;
    project.solution.showcase = project.solution.showcase !== false;
    project.designProcess.showcase = project.designProcess.showcase !== false;
    project.visualJourney.showcase = project.visualJourney.showcase !== false;
    project.spatialExperience.showcase = project.spatialExperience.showcase !== false;
    return project;
  }

  private showMessage(text: string, type: 'success' | 'error'): void {
    this.message = text;
    this.messageType = type;
  }

  private blankProject(): Project {
    return {
      id: '',
      category: 'Residential',
      isPublished: false,
      card: {
        image: '',
        title: { en: '', ar: '' },
        location: { en: 'CITY . COUNTRY', ar: 'مدينة . دولة' },
        area: { en: '0 M²', ar: '0 م²' },
        size: 'large',
      },
      hero: {
        eyebrow: { en: 'Architecture Case study', ar: 'دراسة حالة معمارية' },
        title: { en: '', ar: '' },
        subtitle: { en: '', ar: '' },
        image: '',
        details: {
          location: { en: 'CITY . COUNTRY', ar: 'مدينة . دولة' },
          totalArea: { en: '0 sq.ft.', ar: '0 قدم²' },
          year: String(new Date().getFullYear()),
          scope: { en: 'Architecture & Interior', ar: 'العمارة والتصميم الداخلي' },
        },
      },
      overview: {
        challenge: {
          showcase: true,
          number: '01',
          title: { en: 'The Challenge', ar: 'التحدي' },
          quote: { en: '', ar: '' },
          paragraph1: { en: '', ar: '' },
          paragraph2: { en: '', ar: '' },
        },
        concept: {
          showcase: true,
          number: '02',
          title: { en: 'The Concept', ar: 'المفهوم' },
          quote: { en: '', ar: '' },
          paragraph1: { en: '', ar: '' },
          paragraph2: { en: '', ar: '' },
        },
      },
      designProcess: { showcase: true, label: { en: 'Design Process', ar: 'عملية التصميم' }, images: [] },
      visualJourney: { showcase: true, label: { en: 'Visual Journey', ar: 'الرحلة البصرية' }, images: [] },
      solution: {
        showcase: true,
        number: '03',
        title: { en: 'The Solution', ar: 'الحل' },
        quote: { en: '', ar: '' },
        paragraph1: { en: '', ar: '' },
        paragraph2: { en: '', ar: '' },
      },
      spatialExperience: {
        showcase: true,
        image: '',
        title: { en: 'Spatial Experience', ar: 'التجربة المكانية' },
        text: { en: '', ar: '' },
      },
    };
  }
}
