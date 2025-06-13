import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';

@Component({
  selector: 'app-test-errors',
  imports: [],
  templateUrl: './test-errors.component.html',
  styleUrl: './test-errors.component.css'
})
export class TestErrorsComponent {
  baseUrl = 'https://localhost:7125/api/';
  private http = inject(HttpClient);
  validationErrors: string[] = [];

  get400Error() {
    this.http.get(this.baseUrl + 'buggy/bad-request').subscribe({
      next: response => console.log('400 Error Response:', response),
      error: error => console.error('400 Error:', error)
    });
  }

  get401Error() {
    this.http.get(this.baseUrl + 'buggy/auth').subscribe({
      next: response => console.log('401 Error Response:', response),
      error: error => console.error('401 Error:', error)
    });
  }

  get404Error() {
    this.http.get(this.baseUrl + 'buggy/not-found').subscribe({
      next: response => console.log('404 Error Response:', response),
      error: error => console.error('404 Error:', error)
    });
  }

  get500Error() {
    this.http.get(this.baseUrl + 'buggy/server-error').subscribe({
      next: response => console.log('500 Error Response:', response),
      error: error => console.error('500 Error:', error)
    });
  }

  get400ValidationError() {
    this.http.post(this.baseUrl + 'account/register', {}).subscribe({
      next: response => console.log('Validation Error Response:', response),
      error: error => {
       console.error('Validation Error:', error);
       this.validationErrors = error;
      }
    });
  }
}
