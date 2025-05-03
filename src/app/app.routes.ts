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
import { HowItWorksComponent } from './pages/how-it-works/how-it-works.component';
import { PricingComponent } from './pages/pricing/pricing.component';
export const routes: Routes = [
    {
        path: '',
        redirectTo: 'my/profile',
        pathMatch: 'full'
    },
    {
        path: 'auth',
        component: LayoutsComponent,
        title: 'Rezuu ~ Your experience matters',
        data:{
            layout: 'public'
        },
        children: [
            {
                path: '',
                component: AuthComponent,
                children: [
                    {
                        path: '',
                        redirectTo: 'register',
                        pathMatch: 'full'
                    },
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
                title: 'Profile - Rezuu'
            },
            {
                path: 'analytics',
                component: AnalyticsDashboardComponent,
                title: 'Analytics - Rezuu'
            },
            {
                path: 'pricing-management',
                component: PricingMenuComponent,
                title: 'Pricing Management - Rezuu'
            },
            {
                path: 'payment/success',
                component: PaymentSuccessComponent,
                title: 'Payment Success'
            },
            {
                path: 'payment/cancel',
                component: PaymentCancelComponent,
                title: 'Payment Cancel'
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
                component: TermsComponent,
                title: 'Terms of Service - Rezuu'
            },
            {
                path: 'eoua',
                component: EouaComponent,
                title: 'End User Agreement - Rezuu'
            },
            {
                path: 'privacy',
                component: PrivacyComponent,
                title: 'Privacy Policy - Rezuu'
            }
        ]
    },

    {
        path: 'how-it-works',
        component: LayoutsComponent,
        data: {
            layout: 'public'
        },
        children: [ 
            {
                path: '',
                component: HowItWorksComponent,
                title: 'How It Works - Rezuu'
            },
        ]
    },
    {
        path: 'pricing',
        component: LayoutsComponent,
        data: {
            layout: 'public'
        },
        children: [ 
            {
                path: '',
                component: PricingComponent,
                title: 'Pricing - Rezuu',
                
            },
        ]
    },

    {
        path: ':uid',
        component: PublicProfileComponent,
        title: 'Profile - Rezuu'
    },
    
];