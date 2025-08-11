import { ResolveFn, Router } from '@angular/router';
import { MembersService } from '../services/members.service';
import { inject } from '@angular/core';
import { Member } from '../models/member';
import { EMPTY } from 'rxjs';

export const memberResolverResolver: ResolveFn<Member> = (route, state) => {
  const memberService = inject(MembersService);
  const router = inject(Router);
  const username = route.paramMap.get('username');

  if (!username) {
    router.navigateByUrl('/not-found');
    return EMPTY;
  }

  return memberService.getMember(username!);
};
