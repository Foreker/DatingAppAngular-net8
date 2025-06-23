import { Component, input } from '@angular/core';
import { Member } from '../../models/member';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-members-card',
  imports: [RouterLink],
  templateUrl: './members-card.component.html',
  styleUrl: './members-card.component.css',
})
export class MembersCardComponent {
  member = input.required<Member>();
}
