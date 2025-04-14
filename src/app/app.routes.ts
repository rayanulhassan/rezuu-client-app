import { Routes } from '@angular/router';
import { LayoutsComponent } from './shared/components/layouts/layouts.component';
import { SignUpComponent } from './shared/components/sign-up/sign-up.component';
import { SignInComponent } from './shared/components/sign-in/sign-in.component';
import { AuthComponent } from './pages/auth/auth.component';
export const routes: Routes = [
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
    }
];