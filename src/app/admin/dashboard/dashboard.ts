import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Project } from '../../models/project.model';
import { AdminApiService, apiErrorMessage } from '../core/admin-api.service';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
})
export class AdminDashboard implements OnInit {
  private readonly api = inject(AdminApiService);
  readonly auth = inject(AuthService);

  readonly projects = signal<Project[]>([]);
  readonly isLoading = signal(true);
  readonly error = signal('');

  readonly total = computed(() => this.projects().length);
  readonly published = computed(() => this.projects().filter((p) => p.isPublished !== false).length);
  readonly drafts = computed(() => this.total() - this.published());

  readonly byCategory = computed(() => {
    const counts = new Map<string, number>();
    for (const project of this.projects()) {
      counts.set(project.category, (counts.get(project.category) ?? 0) + 1);
    }
    return [...counts.entries()].map(([category, count]) => ({ category, count }));
  });

  ngOnInit(): void {
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
