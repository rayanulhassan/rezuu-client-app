import { Routes } from '@angular/router';
import { LayoutsComponent } from './shared/components/layouts/layouts.component';
import { SignUpComponent } from './shared/components/sign-up/sign-up.component';
import { SignInComponent } from './shared/components/sign-in/sign-in.component';
import { AuthComponent } from './pages/auth/auth.component';
import { ProfileComponent } from './pages/user/profile/profile.component';
import { PublicProfileComponent } from './pages/user/public-profile/public-profile.component';
import { isAuthenticatedGuard } from './shared/guards/auth.guard';
import { AnalyticsDashboardComponent } from './pages/user/analytics-dashboard/analytics-dashboard.component';
import { ForgotPasswordComponent } from './shared/components/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './shared/components/reset-password/reset-password.component';
import { TermsComponent } from './pages/legal/terms/terms.component';
import { EouaComponent } from './pages/legal/eoua/eoua.component';
import { PrivacyComponent } from './pages/legal/privacy/privacy.component';
import { PricingMenuComponent } from './pages/pricing-menu/pricing-menu.component';
import { PaymentSuccessComponent } from './pages/payment/payment-success/payment-success.component';
import { PaymentCancelComponent } from './pages/payment/payment-cancel/payment-cancel.component';

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
                    },
                    {
                        path: 'forgot-password',
                        component: ForgotPasswordComponent
                    },
                    {
                        path: 'reset-password',
                        component: ResetPasswordComponent
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
            {
                path: 'analytics',
                component: AnalyticsDashboardComponent,
            },
            {
                path: 'pricing-management',
                component: PricingMenuComponent,
            },
            {
                path: 'payment/success',
                component: PaymentSuccessComponent
            },
            {
                path: 'payment/cancel',
                component: PaymentCancelComponent
            },

        ]
    },
    // Legal Pages
    {
        path: 'legal',
        component: LayoutsComponent,
        data: {
            layout: 'empty'
        },
        children: [ 
            {
                path: 'terms',
                component: TermsComponent
            },
            {
                path: 'eoua',
                component: EouaComponent
            },
            {
                path: 'privacy',
                component: PrivacyComponent
            }
        ]
    },

    {
        path: ':uid',
        component: PublicProfileComponent
    },
    
];