import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Project } from '../../models/project.model';
import { mapProjectMedia, relativizeMedia, resolveMedia } from '../../services/media-url';
import { ApiResponse } from './admin.models';

/**
 * The admin form works with display-ready image URLs. They are made relative again before saving,
 * so what is stored never depends on which domain the API happens to be served from.
 */
@Injectable({ providedIn: 'root' })
export class AdminApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/projects`;
  private readonly drafts = new HttpParams().set('includeUnpublished', 'true');

  listProjects(): Observable<Project[]> {
    return this.http
      .get<ApiResponse<Project[]>>(this.base, { params: this.drafts })
      .pipe(map((r) => r.data.map((p) => mapProjectMedia(p, resolveMedia))));
  }

  getProject(id: string): Observable<Project> {
    return this.http
      .get<ApiResponse<Project>>(`${this.base}/${encodeURIComponent(id)}`, { params: this.drafts })
      .pipe(map((r) => mapProjectMedia(r.data, resolveMedia)));
  }

  createProject(project: Project): Observable<Project> {
    return this.http
      .post<ApiResponse<Project>>(this.base, mapProjectMedia(project, relativizeMedia))
      .pipe(map((r) => mapProjectMedia(r.data, resolveMedia)));
  }

  updateProject(project: Project): Observable<Project> {
    return this.http
      .put<ApiResponse<Project>>(`${this.base}/${encodeURIComponent(project.id)}`, mapProjectMedia(project, relativizeMedia))
      .pipe(map((r) => mapProjectMedia(r.data, resolveMedia)));
  }

  deleteProject(id: string): Observable<void> {
    return this.http.delete<ApiResponse<unknown>>(`${this.base}/${encodeURIComponent(id)}`).pipe(map(() => undefined));
  }

  /** Saves the display order: `ids` from first to last. */
  reorderProjects(ids: string[]): Observable<void> {
    return this.http.put<ApiResponse<unknown>>(`${this.base}/reorder`, { ids }).pipe(map(() => undefined));
  }

  /** Uploads one image; resolves to a display-ready URL for the form (stored relative on save). */
  uploadImage(file: File): Observable<string> {
    const body = new FormData();
    body.append('image', file);
    return this.http
      .post<ApiResponse<{ url: string }>>(`${this.base}/upload`, body)
      .pipe(map((r) => resolveMedia(r.data.url)));
  }
}

/** Turns an API failure into a message that is safe to show in the UI. */
export function apiErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (!(error instanceof HttpErrorResponse)) return fallback;
  if (error.status === 0) return 'Cannot reach the server. Check that the API is running.';

  const apiError = error.error?.error as { message?: string; details?: { field: string; message: string }[] } | undefined;
  if (apiError?.details?.length) {
    return apiError.details.map((d) => `${d.field}: ${d.message}`).join(' · ');
  }
  return apiError?.message ?? fallback;
}
