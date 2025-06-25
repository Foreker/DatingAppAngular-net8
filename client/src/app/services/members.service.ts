import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.development';
import { Member } from '../models/member';
import { of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MembersService {
  private http = inject(HttpClient);
  baseUrl = environment.apiUrl;
  members = signal<Member[]>([]);
  
  getMembers() {
    return this.http.get<Member[]>(this.baseUrl + 'users').subscribe({
      next: (members) => {
        this.members.set(members);
        console.log('Members loaded successfully:', members);
      },
      error: (error) => {
        console.error('Error loading members:', error);
      }
    });
  }

  getMember(username: string) {
    const member = this.members().find(m => m.userName === username);
    if (member !== undefined) return of(member);
    
    return this.http.get<Member>(this.baseUrl + 'users/' + username); 
  }

  updateMember(member: Member) {
    return this.http.put(this.baseUrl + 'users', member).pipe(
      tap(() => {
        this.members.update(members => members.map(m => m.userName === member.userName 
          ? member : m));
      })
    )
  }
}
