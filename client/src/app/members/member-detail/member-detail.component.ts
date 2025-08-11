import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Member } from '../../models/member';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { GalleryItem, GalleryModule, ImageItem} from 'ng-gallery';
import { filter } from 'rxjs';
import { AgePipe } from '../../pipes/age.pipe';
import { AccountService } from '../../services/account.service';
import { MembersService } from '../../services/members.service';

@Component({
  selector: 'app-member-detail',
  standalone: true,
  imports: [TabsModule, GalleryModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './member-detail.component.html',
  styleUrl: './member-detail.component.css'
})

export class MemberDetailComponent implements OnInit {
  protected memberService = inject(MembersService);
  private accountService = inject(AccountService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  // protected member = signal<Member | undefined>(undefined);
  protected title = signal<string | undefined>('Profile');
  protected isCurrentUser = computed(() => {
    return this.accountService.currentUser()?.username === this.route.snapshot.paramMap.get('username');
  })
  // member?: Member;
  images: GalleryItem[] = [];

  ngOnInit(): void {
    // this.route.data.subscribe({
    //   next: (data) => {
    //     this.member.set(data['member']);
    //   },
    //   error: (error) => { 
    //     console.error('Error loading member data:', error);
    //   }
    // });
    this.title.set(this.route.firstChild?.snapshot?.title);

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe({
      next: () => { 
        this.title.set(this.route.firstChild?.snapshot?.title);
        console.log('Route changed, new title:', this.title());
      }
    });
  }

  // loadMember() {
  //   const username = this.route.snapshot.paramMap.get('username');
  //   if (!username) {
  //     return;
  //   }
  //   this.memberService.getMember(username).subscribe({
  //     next: (member) => {
  //       this.member = member;
  //       member.photos.map(p => {
  //         this.images.push(new ImageItem({ src: p.url, thumb: p.url }));
  //       });
  //       console.log('Member fetched successfully:', this.member);
  //     },
  //     error: (error) => {
  //       console.error('Error fetching member:', error);
  //     }
  //   });
  // }
}
