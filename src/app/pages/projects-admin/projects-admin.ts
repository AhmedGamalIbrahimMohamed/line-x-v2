import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ProjectsService } from '../../services/projects.service';
import { Project } from '../../models/project.model';

@Component({
  selector: 'app-projects-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './projects-admin.html',
  styleUrl: './projects-admin.scss',
})
export class ProjectsAdminComponent implements OnInit {
  private projectsService = inject(ProjectsService);
  private http = inject(HttpClient);

  projects: Project[] = [];
  selectedProject: Project | null = null;
  selectedIndex = 0;
  isSaving = false;
  isSidebarOpen = false;
  message = '';
  messageType: 'success' | 'error' = 'success';

  openSidebar(): void {
    this.isSidebarOpen = true;
  }

  closeSidebar(): void {
    this.isSidebarOpen = false;
  }

  ngOnInit(): void {
    this.projectsService.getAll().subscribe((projects) => {
      this.projects = projects;
      this.selectedProject = projects[0] ?? null;
      this.selectedIndex = 0;
    });
  }

  selectProject(index: number): void {
    this.selectedIndex = index;
    this.selectedProject = this.projects[index] ?? null;
    this.closeSidebar();
  }

  addProject(): void {
    const newProject: Project = {
      id: `new-project-${Date.now()}`,
      category: 'Residential',
      card: {
        image: 'assets/images/figma2/projects-6b.jpg',
        title: { en: 'New Project', ar: 'مشروع جديد' },
        location: { en: 'CITY . COUNTRY', ar: 'مدينة . دولة' },
        area: { en: '0 M²', ar: '0 م²' },
        size: 'large',
      },
      hero: {
        eyebrow: { en: 'Architecture Case study', ar: 'دراسة حالة معمارية' },
        title: { en: 'New Project', ar: 'مشروع جديد' },
        subtitle: { en: 'Add your content here', ar: 'أضف المحتوى هنا' },
        image: 'assets/images/figma2/projects-6b.jpg',
        details: {
          location: { en: 'CITY . COUNTRY', ar: 'مدينة . دولة' },
          totalArea: { en: '0 sq.ft.', ar: '0 قدم²' },
          year: '2026',
          scope: { en: 'Architecture & Interior', ar: 'العمارة والتصميم الداخلي' },
        },
      },
      overview: {
        challenge: {
          number: '01',
          title: { en: 'The Challenge', ar: 'التحدي' },
          quote: { en: '', ar: '' },
          paragraph1: { en: '', ar: '' },
          paragraph2: { en: '', ar: '' },
        },
        concept: {
          number: '02',
          title: { en: 'The Concept', ar: 'المفهوم' },
          quote: { en: '', ar: '' },
          paragraph1: { en: '', ar: '' },
          paragraph2: { en: '', ar: '' },
        },
      },
      designProcess: {
        label: { en: 'Design Process', ar: 'عملية التصميم' },
        images: [],
      },
      visualJourney: {
        label: { en: 'Visual Journey', ar: 'الرحلة البصرية' },
        images: [],
      },
      solution: {
        number: '03',
        title: { en: 'The Solution', ar: 'الحل' },
        quote: { en: '', ar: '' },
        paragraph1: { en: '', ar: '' },
        paragraph2: { en: '', ar: '' },
      },
      solutions: {
        image: 'assets/images/figma2/projects-6b.jpg',
        title: { en: 'Spatial Experience', ar: 'التجربة المكانية' },
        text: { en: '', ar: '' },
      },
    };

    this.projects = [newProject, ...this.projects];
    this.selectedProject = newProject;
    this.selectedIndex = 0;
    this.closeSidebar();
  }

  saveProject(): void {
    if (!this.selectedProject) return;

    this.isSaving = true;
    this.message = '';

    const payload = { projects: this.projects };
    this.projectsService.updateProjects(this.projects);

    this.http.put('assets/data/projects.json', payload, { responseType: 'text' }).subscribe({
      next: () => {
        this.isSaving = false;
        this.message = 'Projects JSON updated successfully.';
        this.messageType = 'success';
      },
      error: () => {
        this.downloadJson(payload);
        this.isSaving = false;
        this.message = 'The browser could not write to the asset file directly, so a projects.json export was downloaded instead.';
        this.messageType = 'error';
      },
    });
  }

  removeProject(index: number): void {
    if (this.projects.length === 1) {
      this.projects = [];
      this.selectedProject = null;
      this.selectedIndex = 0;
      return;
    }

    this.projects.splice(index, 1);
    this.selectedIndex = Math.max(0, Math.min(index, this.projects.length - 1));
    this.selectedProject = this.projects[this.selectedIndex] ?? null;
  }

  addDesignProcessImage(): void {
    if (!this.selectedProject) return;
    this.selectedProject.designProcess.images = [...this.selectedProject.designProcess.images, ''];
  }

  removeDesignProcessImage(index: number): void {
    if (!this.selectedProject) return;
    this.selectedProject.designProcess.images.splice(index, 1);
  }

  addVisualJourneyImage(): void {
    if (!this.selectedProject) return;
    this.selectedProject.visualJourney.images = [...this.selectedProject.visualJourney.images, ''];
  }

  removeVisualJourneyImage(index: number): void {
    if (!this.selectedProject) return;
    this.selectedProject.visualJourney.images.splice(index, 1);
  }

  handleImageUpload(event: Event, target: 'card' | 'hero' | 'solutions'): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || !this.selectedProject) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      if (target === 'card') {
        this.selectedProject!.card.image = dataUrl;
      } else if (target === 'hero') {
        this.selectedProject!.hero.image = dataUrl;
      } else {
        this.selectedProject!.solutions.image = dataUrl;
      }
    };
    reader.readAsDataURL(file);
  }

  handleArrayImageUpload(event: Event, target: 'designProcess' | 'visualJourney', index: number): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || !this.selectedProject) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      if (target === 'designProcess') {
        this.selectedProject!.designProcess.images[index] = dataUrl;
      } else {
        this.selectedProject!.visualJourney.images[index] = dataUrl;
      }
    };
    reader.readAsDataURL(file);
  }

  private downloadJson(payload: { projects: Project[] }): void {
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'projects.json';
    anchor.click();
    window.URL.revokeObjectURL(url);
  }
}
