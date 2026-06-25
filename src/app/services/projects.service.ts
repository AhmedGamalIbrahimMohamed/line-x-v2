import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map, shareReplay } from 'rxjs';
import { Project } from '../models/project.model';

@Injectable({ providedIn: 'root' })
export class ProjectsService {
  private http = inject(HttpClient);

  private projects$ = this.http
    .get<{ projects: Project[] }>('assets/data/projects.json')
    .pipe(
      map((response) => response.projects),
      shareReplay(1)
    );

  getAll(): Observable<Project[]> {
    return this.projects$;
  }

  getById(id: string): Observable<Project | undefined> {
    return this.projects$.pipe(map((projects) => projects.find((project) => project.id === id)));
  }
}
