import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { BusyService } from '../services/busy.service';
import { delay, finalize } from 'rxjs';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const busyService = inject(BusyService); // Assuming BusyService is provided in the app module
  busyService.busy(); // Start the busy indicator

  return next(req).pipe(
    delay(1000),
    finalize(() => {
      busyService.idle(); // Stop the busy indicator
    })
  );  

};
