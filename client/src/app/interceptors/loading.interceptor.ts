import { HttpEvent, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { BusyService } from '../services/busy.service';
import { delay, finalize, of, tap } from 'rxjs';

const cache = new Map<string, HttpEvent<unknown>>();

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const busyService = inject(BusyService); // Assuming BusyService is provided in the app module
 
  if (req.method === 'GET') {
    const cachedResponse = cache.get(req.url);
    if (cachedResponse) {
      return of(cachedResponse);
    }
  }

  busyService.busy(); // Start the busy indicator

  return next(req).pipe(
    delay(1000),
    tap(response => {
      cache.set(req.url, response); // Cache the response
    }),
    finalize(() => {
      busyService.idle(); // Stop the busy indicator
    })
  );  

};
