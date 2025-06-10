import { Component, inject, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccountService } from '../services/account.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register',
  imports: [FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  private accountService = inject(AccountService); 
  private toastr = inject(ToastrService);
  cancelRegister = output<boolean>();
 
  model: any = {};

  register() {
    this.accountService.register(this.model).subscribe({
      next: response => {
        console.log('Registration successful:', response);
        this.cancel();
      },
      error: error => {
        this.toastr.error(error.error);
        console.error('Registration failed:', error);
      }
    });
  }

  cancel() {
    this.cancelRegister.emit(false);
    console.log('Registration cancelled');
  }

}
