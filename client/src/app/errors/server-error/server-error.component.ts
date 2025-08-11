import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ApiError } from '../../models/error';

@Component({
  selector: 'app-server-error',
  imports: [RouterLink],
  templateUrl: './server-error.component.html',
  styleUrl: './server-error.component.css'
})
export class ServerErrorComponent {
  error: ApiError;
  protected showErrorDetails = false;

  constructor(private router: Router) {
    const navigation = this.router.getCurrentNavigation();
    this.error = navigation?.extras?.state?.['error'];
  }

  detailsToggle() {
    this.showErrorDetails = !this.showErrorDetails;
  }
}
