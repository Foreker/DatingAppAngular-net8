import { Component, HostListener, inject, OnInit, ViewChild } from '@angular/core';
import { Member } from '../../models/member';
import { AccountService } from '../../services/account.service';
import { MembersService } from '../../services/members.service';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { FormsModule, NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { PhotoEditorComponent } from "../photo-editor/photo-editor.component";

@Component({
  selector: 'app-member-edit',
  imports: [TabsModule, FormsModule, PhotoEditorComponent],
  templateUrl: './member-edit.component.html',
  styleUrl: './member-edit.component.css'
})
export class MemberEditComponent implements OnInit {
  @ViewChild('editForm') editForm?: NgForm; // Assuming you have a form with this reference
  @HostListener('window:beforeunload', ['$event']) notify($event:any) {
    if (this.editForm?.dirty) {
      $event.returnValue = true; // This will prompt the user if they try to leave with unsaved changes
    }
  }
  member?: Member;
  private accountService = inject(AccountService);
  private memberService = inject(MembersService);
  private toastr = inject(ToastrService);

  ngOnInit(): void {
    this.loadMember();
  }

  loadMember() {
    const user = this.accountService.currentUser();
    if (!user) {
      console.error('No user is currently logged in.');
      return;
    }
    this.memberService.getMember(user.username).subscribe({
      next: (member) => {
        this.member = member;
        console.log('Member loaded successfully:', this.member);
      },
      error: (error) => {
        console.error('Error loading member:', error);
      }
    });
  }

  updateMember() {
    this.memberService.updateMember(this.editForm?.value).subscribe({
      next: () => {
        console.log('Member updated successfully');
        this.toastr.success('Profile updated successfully');
        this.editForm?.reset(this.member); // Reset the form with the updated member data
      },
      error: (error) => {
        console.error('Error updating member:', error);
        this.toastr.error('Failed to update profile');
      }
    });
  }

  onMemberChange(event: Member) {
    this.member = event;
  }
}

