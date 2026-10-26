import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PROJECT_CATEGORIES, Project } from '../../models/project.model';
import { AdminApiService, apiErrorMessage } from '../core/admin-api.service';

@Component({
  selector: 'app-admin-projects',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './projects.html',
})
export class AdminProjects implements OnInit {
  private readonly api = inject(AdminApiService);

  readonly categories = PROJECT_CATEGORIES;

  readonly projects = signal<Project[]>([]);
  readonly isLoading = signal(true);
  readonly error = signal('');
  readonly search = signal('');
  readonly category = signal('');
  readonly pendingDelete = signal<Project | null>(null);
  readonly isDeleting = signal(false);

  readonly filtered = computed(() => {
    const term = this.search().trim().toLowerCase();
    const category = this.category();
    return this.projects().filter((project) => {
      if (category && project.category !== category) return false;
      if (!term) return true;
      return (
        project.id.toLowerCase().includes(term) ||
        project.card.title.en.toLowerCase().includes(term) ||
        project.card.title.ar.includes(term)
      );
    });
  });

  readonly isReordering = signal(false);

  /** Reordering only makes sense on the full list; a filtered view hides the neighbours. */
  readonly canReorder = computed(() => !this.search().trim() && !this.category());

  ngOnInit(): void {
    this.load();
  }

  /** Moves a project one step up (-1) or down (+1) and saves the new display order. */
  move(project: Project, step: -1 | 1): void {
    const list = [...this.projects()];
    const from = list.findIndex((p) => p.id === project.id);
    const to = from + step;
    if (from < 0 || to < 0 || to >= list.length) return;

    [list[from], list[to]] = [list[to], list[from]];
    const previous = this.projects();
    this.projects.set(list);
    this.isReordering.set(true);

    this.api.reorderProjects(list.map((p) => p.id)).subscribe({
      next: () => this.isReordering.set(false),
      error: (error) => {
        this.projects.set(previous);
        this.isReordering.set(false);
        this.error.set(apiErrorMessage(error, 'Could not save the new order.'));
      },
    });
  }

  confirmDelete(project: Project): void {
    this.pendingDelete.set(project);
  }

  cancelDelete(): void {
    if (!this.isDeleting()) this.pendingDelete.set(null);
  }

  delete(): void {
    const project = this.pendingDelete();
    if (!project) return;

    this.isDeleting.set(true);
    this.api.deleteProject(project.id).subscribe({
      next: () => {
        this.projects.update((list) => list.filter((p) => p.id !== project.id));
        this.isDeleting.set(false);
        this.pendingDelete.set(null);
      },
      error: (error) => {
        this.error.set(apiErrorMessage(error, 'Could not delete the project.'));
        this.isDeleting.set(false);
        this.pendingDelete.set(null);
      },
    });
  }

  private load(): void {
    this.api.listProjects().subscribe({
      next: (projects) => {
        this.projects.set(projects);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.error.set(apiErrorMessage(error, 'Could not load projects.'));
        this.isLoading.set(false);
      },
    });
  }
}
