import { inject, Injectable, signal } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';

@Injectable({
  providedIn: 'root'
})
export class BusyService {
  //busyRequestsCount = 0; //old
  busyRequestsCount = signal(0);
  private spinnerService = inject(NgxSpinnerService);

  busy() {
    //this.busyRequestsCount++;  //old
    this.busyRequestsCount.update(count => count + 1);
    this.spinnerService.show(undefined, {
      type: 'square-jelly-box',
      bdColor: 'rgba(255, 255, 255, 0.7)',
      color: '#333333',
      size: 'medium'
    });
  }

  idle() {
    //this.busyRequestsCount--; //old
    this.busyRequestsCount.update(count => Math.max(0, count - 1));
    if (this.busyRequestsCount() <= 0) {
      this.busyRequestsCount.set(0);
      this.spinnerService.hide();
    }
  }
}
