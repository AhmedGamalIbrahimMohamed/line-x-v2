import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, map, shareReplay } from 'rxjs';
import { Project } from '../models/project.model';

@Injectable({ providedIn: 'root' })
export class ProjectsService {
  private http = inject(HttpClient);
  private storageKey = 'x-line-projects-admin-data';
  private projectsSubject = new BehaviorSubject<Project[]>([]);

  constructor() {
    this.loadInitialProjects();
  }

  getAll(): Observable<Project[]> {
    return this.projectsSubject.asObservable();
  }

  getById(id: string): Observable<Project | undefined> {
    return this.projectsSubject.asObservable().pipe(map((projects) => projects.find((project) => project.id === id)));
  }

  updateProjects(projects: Project[]): void {
    this.projectsSubject.next(projects);
    localStorage.setItem(this.storageKey, JSON.stringify({ projects }));
  }

  private loadInitialProjects(): void {
    const persisted = this.readPersistedProjects();
    if (persisted) {
      this.projectsSubject.next(persisted);
      return;
    }

    this.http
      .get<{ projects: Project[] }>('assets/data/projects.json')
      .pipe(
        map((response) => response.projects),
        shareReplay(1)
      )
      .subscribe((projects) => {
        this.projectsSubject.next(projects);
      });
  }

  private readPersistedProjects(): Project[] | null {
    if (typeof window === 'undefined' || !window.localStorage) return null;

    const raw = localStorage.getItem(this.storageKey);
    if (!raw) return null;

    try {
      const parsed = JSON.parse(raw) as { projects?: Project[] };
      return Array.isArray(parsed.projects) ? parsed.projects : null;
    } catch {
      return null;
    }
  }
}
