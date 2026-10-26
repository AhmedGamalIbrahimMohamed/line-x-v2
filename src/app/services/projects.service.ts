import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, catchError, filter, from, map, of, switchMap } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from '../admin/core/auth.service';
import { Project } from '../models/project.model';
import { mapProjectMedia, resolveMedia } from './media-url';

@Injectable({ providedIn: 'root' })
export class ProjectsService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private projectsSubject = new BehaviorSubject<Project[]>([]);
  private loadedSubject = new BehaviorSubject<boolean>(false);

  constructor() {
    this.loadProjects();
  }

  getAll(): Observable<Project[]> {
    return this.projectsSubject.asObservable();
  }

  /**
   * Looks a project up in the published list. A signed-in admin who is not in that list may be
   * opening a draft ("View on site" in the dashboard), so the API is asked for it directly.
   * Emits `undefined` once loading has finished and the project does not exist (or is not visible).
   */
  getById(id: string): Observable<Project | undefined> {
    return this.loadedSubject.pipe(
      filter((loaded) => loaded),
      switchMap(() => this.projectsSubject),
      map((projects) => projects.find((project) => project.id === id)),
      switchMap((project) => (project ? of(project) : from(this.auth.ready()).pipe(switchMap(() => this.loadDraft(id)))))
    );
  }

  private loadDraft(id: string): Observable<Project | undefined> {
    if (!this.auth.isAuthenticated()) return of(undefined);

    // `includeUnpublished` makes the API strict about the session, so an expired token is
    // refreshed by the interceptor instead of silently hiding the draft.
    const params = new HttpParams().set('includeUnpublished', 'true');
    return this.http.get<{ data: Project }>(`${environment.apiUrl}/projects/${encodeURIComponent(id)}`, { params }).pipe(
      map((response) => mapProjectMedia(response.data, resolveMedia)),
      catchError(() => of(undefined))
    );
  }

  /** Loads published projects from the API, falling back to the bundled JSON if it is unreachable. */
  private loadProjects(): void {
    this.http
      .get<{ data: Project[] }>(`${environment.apiUrl}/projects`)
      .pipe(
        map((response) => response.data),
        catchError(() =>
          this.http.get<{ projects: Project[] }>('assets/data/projects.json').pipe(
            map((response) => response.projects),
            catchError(() => of([] as Project[]))
          )
        )
      )
      .subscribe((projects) => {
        this.projectsSubject.next(projects.map((project) => mapProjectMedia(project, resolveMedia)));
        this.loadedSubject.next(true);
      });
  }
}
