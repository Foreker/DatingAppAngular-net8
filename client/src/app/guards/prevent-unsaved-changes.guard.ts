import { CanDeactivateFn } from '@angular/router';
import { MemberProfileComponent } from '../members/member-profile/member-profile.component';

export const preventUnsavedChangesGuard: CanDeactivateFn<MemberProfileComponent> = (component) => {
  if (component.editForm?.dirty) {
    return confirm('Are you sure you want to continue? Any unsaved changes will lost')
  }
  return true;
};
