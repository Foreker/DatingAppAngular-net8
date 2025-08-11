import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { MemberListComponent } from './members//member-list/member-list.component';
import { MemberDetailComponent } from './members/member-detail/member-detail.component';
import { ListsComponent } from './lists/lists.component';
import { MessagesComponent } from './messages/messages.component';
import { authGuard } from './guards/auth.guard';
import { TestErrorsComponent } from './errors/test-errors/test-errors.component';
import { NotFoundComponent } from './errors/not-found/not-found.component';
import { ServerErrorComponent } from './errors/server-error/server-error.component';
import { MemberEditComponent } from './members/member-edit/member-edit.component';
import { preventUnsavedChangesGuard } from './guards/prevent-unsaved-changes.guard';
import { MemberProfileComponent } from './members/member-profile/member-profile.component';
import { MemberMessagesComponent } from './members/member-messages/member-messages.component';
import { MemberPhotosComponent } from './members/member-photos/member-photos.component';
import { memberResolverResolver } from './members/member-resolver.resolver';

export const routes: Routes = [
    {path: '', component: HomeComponent }, 
    {
        path: '',
        runGuardsAndResolvers: 'always',
        canActivate: [authGuard],
        children: [
            {path: 'members', component: MemberListComponent},
            {
                path: 'members/:username', 
                resolve: {member: memberResolverResolver},
                runGuardsAndResolvers: 'always',
                component: MemberDetailComponent,
                children: [
                    {path: '', redirectTo: 'profile', pathMatch: 'full'},
                    {path: 'profile', component: MemberProfileComponent, title: 'Profile', 
                        canActivate: [preventUnsavedChangesGuard]},
                    {path: 'photos', component: MemberPhotosComponent, title: 'Photos'},
                    {path: 'messages', component: MemberMessagesComponent, title: 'Messages'},
                ] 
            },
            {path: 'member/edit', component: MemberEditComponent, canDeactivate: [preventUnsavedChangesGuard]},
            {path: 'lists', component: ListsComponent }, 
            {path: 'messages', component: MessagesComponent }, 
        ]
    },
    {path: 'errors', component: TestErrorsComponent},
    {path: 'not-found', component: NotFoundComponent},
    {path: 'server-error', component: ServerErrorComponent},
    {path: '**', component: HomeComponent, pathMatch: 'full' }, 
];
