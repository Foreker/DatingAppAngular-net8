import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.development';
import { Member } from '../models/member';
import { of, tap } from 'rxjs';
import { Photo } from '../models/photo';
import { EditableMember } from '../models/editableMember';

@Injectable({
  providedIn: 'root'
})
export class MembersService {
  private http = inject(HttpClient);
  baseUrl = environment.apiUrl;
  members = signal<Member[]>([]);
  member = signal<Member | null>(null);
  editMode = signal(false);
  
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
    return this.http.get<Member>(this.baseUrl + 'users/' + username).pipe( 
    tap(member => {
      this.member.set(member);
      })
    )
  }

  // updateMember(member: Member) {
  //   return this.http.put(this.baseUrl + 'users', member).pipe(
  //     tap(() => {
  //       this.members.update(members => members.map(m => m.userName === member.userName 
  //         ? member : m));
  //     })
  //   )
  // }

  getMemberPhotos(username: string) {
    return this.http.get<Photo[]>(this.baseUrl + 'users/' + username + '/photos');
  }

  updateMember(member: EditableMember) {
    return this.http.put(this.baseUrl + 'users', member)
  }

  uploadPhoto(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<Photo>(this.baseUrl + 'users/add-photo', formData);
  }

  setMainPhoto(photo: Photo) {
    return this.http.put(this.baseUrl + 'users/set-main-photo/' + photo.id, {}).pipe(
      tap(() => {
        this.members.update(members => members.map(m => {
          if (m.photos.includes(photo)) {
            m.photoUrl = photo.url;
          }
          return m;
        }));
      })
    );
  }

  deletePhoto(photo: Photo) {
    return this.http.delete(this.baseUrl + 'users/delete-photo/' + photo.id).pipe(
      tap(() => {
        this.members.update(members => members.map(m => {
          if (!m.photos.includes(photo))
            m.photos = m.photos.filter(p => p.id !== photo.id);
          return m;
        }));
      }
    ));
  }
}
