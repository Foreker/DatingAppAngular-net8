import { Component, inject, OnInit, signal } from '@angular/core';
import { MembersService } from '../../services/members.service';
import { ActivatedRoute } from '@angular/router';
import { Photo } from '../../models/photo';
import { ImageUploadComponent } from "../image-upload/image-upload.component";
import { AccountService } from '../../services/account.service';
import { Member } from '../../models/member';
import { StarButtonComponent } from "../../forms/star-button/star-button.component";
import { DeleteButtonComponent } from "../../forms/delete-button/delete-button.component";

@Component({
  selector: 'app-member-photos',
  imports: [ImageUploadComponent, StarButtonComponent, DeleteButtonComponent],
  templateUrl: './member-photos.component.html',
  styleUrl: './member-photos.component.css'
})
export class MemberPhotosComponent implements OnInit {
  protected memberService = inject(MembersService);
  protected accountService = inject(AccountService);
  private route = inject(ActivatedRoute);
  protected photos = signal<Photo[]>([]);
  protected loading = signal(false);

  ngOnInit(): void {
    const memberUsername = this.route.parent?.snapshot.paramMap.get('username');
    if (memberUsername) {
      this.memberService.getMemberPhotos(memberUsername).subscribe({
        next: photos => this.photos.set(photos),
      });
    }
  }

  onUploadImage(file: File) {
    this.loading.set(true);
    this.memberService.uploadPhoto(file).subscribe({
      next: photo => {
        this.memberService.editMode.set(false);
        this.loading.set(false);
        this.photos.update(photos => [...photos, photo]);
        if (!this.memberService.member()?.photoUrl) {
          this.setMainLocalPhoto(photo);
        }
      },
      error: (error) => {
        console.error('Error uploading image: ', error);
        this.loading.set(false);
      }
    });
  }

  setMainPhoto(photo: Photo) {
    this.memberService.setMainPhoto(photo).subscribe({
      next: () => {
       this.setMainLocalPhoto(photo);
      },
      error: (error) => {
        console.error('Error setting main photo: ', error);
      }
    });
  }

  deletePhoto(photo: Photo) {
    this.memberService.deletePhoto(photo).subscribe({
      next: () => {
        this.photos.update(photos => photos.filter(p => p.id !== photo.id));
      },
      error: (error) => {
        console.error('Error deleting photo: ', error);
      }
    });
  }

  private setMainLocalPhoto(photo: Photo) {
    const user = this.accountService.currentUser();
    if (user) {
      user.photoUrl = photo.url;
      this.accountService.setCurrentUser(user);
      this.memberService.member.update(member => ({
        ...member,
        photoUrl: photo.url,
      }) as Member)
    }
  }
}
