import { CanDeactivateFn } from '@angular/router';
import type { AdminProjectForm } from './project-form';

/** Asks before leaving the project form with edits that have not been saved. */
export const unsavedChangesGuard: CanDeactivateFn<AdminProjectForm> = (form) =>
  !form.isDirty() || window.confirm('You have unsaved changes. Leave this page and discard them?');
