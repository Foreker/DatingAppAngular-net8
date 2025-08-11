import { Component, inject, output, signal } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { AccountService } from '../services/account.service';
import { ToastrService } from 'ngx-toastr';
import { JsonPipe } from '@angular/common';
import { TextInputComponent } from "../forms/text-input/text-input.component";
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, JsonPipe, TextInputComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  private accountService = inject(AccountService); 
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private toastr = inject(ToastrService);
  cancelRegister = output<boolean>();
  model: any = {};
  protected credentialsForm: FormGroup;
  protected profileForm: FormGroup;
  protected currentStep = signal(1);
  protected validationErrors = signal<string[]>([]);

  constructor() { 
    this.credentialsForm = this.fb.group({
      username: ['', Validators.required],
      knownAs: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(4), 
        Validators.maxLength(8)]],
        confirmPassword: ['', [Validators.required, this.matchValues('password')]],
      });
      
      this.profileForm = this.fb.group({
        gender: ['male', Validators.required],
        dateOfBirth: ['', Validators.required],
        city: ['', Validators.required],
        country: ['', Validators.required],
    });

    this.credentialsForm.controls['password'].valueChanges.subscribe({
      next: () => {
        this.credentialsForm.controls['confirmPassword'].updateValueAndValidity();
      }
    });
  }

  getMaxDate() {
    const today = new Date();
    today.setFullYear(today.getFullYear() - 18);
    return today.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  }

  matchValues(matchTo: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const parent = control.parent;
      return control.value === parent?.get(matchTo)?.value ? null : { isMatching: true };
    };
  }

  nextStep() {
    if (this.credentialsForm.valid) {
      this.currentStep.update(prevStep => prevStep + 1);  
    } 
  }

  prevStep() {
    this.currentStep.update(prevStep => prevStep - 1);
  }

  register() {
    if (this.credentialsForm.valid && this.profileForm.valid) {
      const formData = {
        ...this.credentialsForm.value,
        ...this.profileForm.value
      };
      this.accountService.register(formData).subscribe({
        next: response => {
          this.toastr.success('Registration successful');
          console.log('Registration successful:', response);
          this.router.navigateByUrl('/members');
        },
        error: error => {
        this.toastr.error(error.error);
        this.validationErrors.set(error);
        console.error('Registration failed:', error);
      }
    });
      // this.toastr.error('Please fill out all required fields.');
      // return;
    }
  
  }

  cancel() {
    this.cancelRegister.emit(false);
    console.log('Registration cancelled');
  }

}
