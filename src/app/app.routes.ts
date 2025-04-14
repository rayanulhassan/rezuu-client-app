import { Routes } from '@angular/router';
import { LayoutsComponent } from './shared/components/layouts/layouts.component';
import { SignUpComponent } from './shared/components/sign-up/sign-up.component';
import { SignInComponent } from './shared/components/sign-in/sign-in.component';
import { AuthComponent } from './pages/auth/auth.component';
import { ProfileComponent } from './pages/user/profile/profile.component';
import { isAuthenticatedGuard } from './shared/guards/auth.guard';
export const routes: Routes = [
    {
        path: '',
        redirectTo: 'my/profile',
        pathMatch: 'full'
    },
    {
        path: 'auth',
        component: LayoutsComponent,
        data:{
            layout: 'empty'
        },
        children: [
            {
                path: '',
                component: AuthComponent,
                children: [
                    {
                        path: 'register',
                        component: SignUpComponent
                    },
                    {
                        path: 'login',
                        component: SignInComponent
                    }
                ]
            },
        ]
    },
    {
        path: 'my',
        component: LayoutsComponent,
        data:{
            layout: 'default'
        },
        canActivate: [isAuthenticatedGuard()],
        children: [
            {
                path: 'profile',
                component: ProfileComponent,
            },
        ]
    }
];