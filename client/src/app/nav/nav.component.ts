import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccountService } from '../services/account.service';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { TitleCasePipe } from '@angular/common';
import { ToastService } from '../services/toast.service';
import { themes } from '../themes';
import { BusyService } from '../services/busy.service';

@Component({
  selector: 'app-nav',
  imports: [FormsModule, BsDropdownModule, RouterLink, RouterLinkActive, TitleCasePipe],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.css'
})
export class NavComponent implements OnInit {
  accountService = inject(AccountService);
  protected busyService = inject(BusyService);
  private router = inject(Router);
  private toastr = inject(ToastService);
  model: any = {};
  protected selectedTheme = signal<string>(localStorage.getItem('theme') || 'light');
  protected themes = themes;
  
  ngOnInit(): void {
    document.documentElement.setAttribute('data-theme', this.selectedTheme());
    console.log(`Current theme: ${this.selectedTheme()}`);
  }

  handleSelectTheme(theme: string) {
    this.selectedTheme.set(theme);
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    const elem = document.activeElement as HTMLDivElement;
    if (elem) elem.blur(); // Remove focus from the dropdown button

    console.log(`Theme changed to: ${theme}`);
  }

  login() {
    this.accountService.login(this.model).subscribe({
      next: response => {
        this.router.navigateByUrl('/members');
        this.toastr.success('Logged in successfully');
        console.log(response);
      },
      error: error => {
        this.toastr.error(error.error);
        console.error('Login failed', error);
      }
    }); 
  }
  logout() {
    this.accountService.logout();
    this.router.navigateByUrl('/');
    console.log('User logged out');
  }
}
