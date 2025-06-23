import { Component, inject, OnInit } from '@angular/core';
import { MembersService } from '../../services/members.service';
import { Member } from '../../models/member';
import { MembersCardComponent } from '../members-card/members-card.component';

@Component({
  selector: 'app-member-list',
  imports: [MembersCardComponent],
  templateUrl: './member-list.component.html',
  styleUrl: './member-list.component.css'
})
export class MemberListComponent implements OnInit {
  private memberService = inject(MembersService);
  members: Member[] = [];  

  ngOnInit(): void {
    this.loadMembers();
  }

  loadMembers() {
    this.memberService.getMembers().subscribe({
      next: (members) => {
        this.members = members;
        console.log('members fetched successfully:', this.members);
      },
      error: (error) => {
        console.error('Error fetching members:', error);
      }
    });    
  }
}
