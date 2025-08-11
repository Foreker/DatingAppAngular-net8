import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError } from 'rxjs';
import { ToastService } from '../services/toast.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const toastr = inject(ToastService);

  return next(req)
    .pipe(
      catchError(err => {
        switch (err.status) {
          case 400:
            if (err.error.errors) {
              const modalStateErrors: any[] = [];
              const validationErrors = err.error.errors;
              for (const key in validationErrors) {
                if (validationErrors[key]) {
                  modalStateErrors.push(err.error.errors[key]);
                }
              }
              throw modalStateErrors.flat();
            } else {
              toastr.error(err.error, err.status);
            }
            break;
          case 401:
            toastr.error('Unauthorized', err.status);
            break;
          case 404:
            router.navigateByUrl('/not-found');
            break;
          case 500:
            const navigationExtras = { state: { error: err.error } };
            router.navigateByUrl('/server-error', navigationExtras);
            break;
          default:
            toastr.error('An unexpected error occurred.');
        }
        throw err;
      })
    )
};
