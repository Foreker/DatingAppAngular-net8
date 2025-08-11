import { Component, HostListener, inject, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Member } from '../../models/member';
import { MembersService } from '../../services/members.service';
import { DatePipe } from '@angular/common';
import { EditableMember } from '../../models/editableMember';
import { FormsModule, NgForm } from '@angular/forms';
import { ToastService } from '../../services/toast.service';
import { AccountService } from '../../services/account.service';

@Component({
  selector: 'app-member-profile',
  imports: [DatePipe, FormsModule],
  templateUrl: './member-profile.component.html',
  styleUrl: './member-profile.component.css'
})
export class MemberProfileComponent implements OnInit, OnDestroy {
  @ViewChild('editForm') editForm?: NgForm;
  @HostListener('window:beforeunload', ['$event']) notify($event: BeforeUnloadEvent) {
    if (this.editForm?.dirty) {
      $event.preventDefault();
    }
  }
  private accountService = inject(AccountService);
  protected memberService = inject(MembersService);
  // private route = inject(ActivatedRoute);
  private toast = inject(ToastService);
  // protected member = signal<Member | undefined>(undefined);
  protected editableMember: EditableMember = {
    knownAs: '',
    introduction: '',
    lookingFor: '',
    interests: '',
    city: '',
    country: ''
  }

  
  ngOnInit(): void {
    this.editableMember = {
      knownAs: this.memberService.member()?.knownAs || '',
      introduction: this.memberService.member()?.introduction || '',
      lookingFor: this.memberService.member()?.lookingFor || '',
      interests: this.memberService.member()?.interests || '',
      city: this.memberService.member()?.city || '',
      country: this.memberService.member()?.country || '',
    }
  }
  
  updateProfile() {
    if (!this.memberService.member()) return;
    const updatedMember = { ...this.memberService.member(), ...this.editableMember }
    // console.log('Updated Member:', updatedMember);
    // this.toast.success('Profile updated successfully');
    // this.memberService.editMode.set(false);
    this.memberService.updateMember(this.editableMember).subscribe({
      next: () => {
        const currentUser = this.accountService.currentUser();
        if (currentUser && updatedMember.knownAs !== currentUser?.knownAs) {
          currentUser.knownAs = updatedMember.knownAs;
          this.accountService.setCurrentUser(currentUser);
        }
        this.toast.success('Profile updated successfully');
        this.memberService.editMode.set(false);
        this.memberService.member.set(updatedMember as Member);
        this.editForm?.reset(updatedMember);
      }
    })
  }

  ngOnDestroy(): void {
    if (this.memberService.editMode()) {
      this.memberService.editMode.set(false);
      this.toast.info('Edit mode has been disabled');
    }
  }
}
