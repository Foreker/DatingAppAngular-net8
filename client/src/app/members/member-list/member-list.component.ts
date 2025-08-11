import { Component, inject, OnInit } from '@angular/core';
import { MembersService } from '../../services/members.service';
import { MembersCardComponent } from '../member-card/members-card.component';

@Component({
  selector: 'app-member-list',
  imports: [MembersCardComponent],
  templateUrl: './member-list.component.html',
  styleUrl: './member-list.component.css'
})
export class MemberListComponent implements OnInit {
  memberService = inject(MembersService);

  ngOnInit(): void {
    if (this.memberService.members().length === 0) this.loadMembers();
  }

  loadMembers() {
    this.memberService.getMembers()
  }
}
