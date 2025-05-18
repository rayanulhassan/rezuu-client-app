import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, RouterModule  } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { DialogService } from 'primeng/dynamicdialog';
import { UserService } from '../../../shared/services/user.service';
import { AnalyticsService } from '../../../shared/services/analytics.service';
import { AuthService } from '../../../shared/services/auth.service';
import { VisitorInfoDialogComponent } from '../../../shared/components/visitor-info-dialog/visitor-info-dialog.component';
import { RezuuUser } from '../../../shared/interfaces/auth.interface';
import { Subscription } from 'rxjs';
import { Title } from '@angular/platform-browser';
@Component({
  selector: 'app-public-profile',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    TooltipModule,
    RouterModule
  ],
  templateUrl: './public-profile.component.html',
  styles: ``,
  providers: [DialogService]
})
export class PublicProfileComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private userService = inject(UserService);
  private analyticsService = inject(AnalyticsService);
  private authService = inject(AuthService);
  private dialogService = inject(DialogService);
  private titleService = inject(Title);
  private subscription = new Subscription();

  user: RezuuUser | null = null;
  isLoading = true;
  error: string | null = null;
  showProfile = false;

  applicationUser = this.userService.userDetails;

  ngOnInit() {
    this.subscription.add(
      this.route.params.subscribe(params => {
        const uid = params['uid'];
        if (!uid) {
          this.error = 'Invalid user ID';
          this.isLoading = false;
          return;
        }

        this.fetchUserData(uid);
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  private async fetchUserData(uid: string) {
    try {
      this.isLoading = true;
      this.error = null;
      this.user = await this.userService.getUserByUid(uid);
      
      // Check if profile is public
      if (!this.user?.isPublicProfile) {
        this.error = 'This profile is not publicly visible';
        this.user = null;
        this.isLoading = false;
        return;
      }

      // Handle visitor information
      const currentUser = this.authService.authUser();
      if (currentUser) {
        // Get current user details
        const currentUserDetails = await this.userService.getUserByUid(currentUser.uid);
        this.titleService.setTitle(`${currentUserDetails?.firstName} ${currentUserDetails?.lastName}`);
        if (currentUserDetails) {
          // Track profile view with user info
          await this.analyticsService.trackProfileView(uid, {
            name: `${currentUserDetails.firstName} ${currentUserDetails.lastName}`,
            email: currentUserDetails.email
          });
          
          // Show profile
          this.showProfile = true;
        } else {
          // If somehow user details are not available
          this.error = 'Unable to verify user information';
          this.user = null;
        }
      } else {
        // Show visitor info dialog if not logged in
        const ref = this.dialogService.open(VisitorInfoDialogComponent, {
          header: 'Visitor Information',
          width: '400px',
          modal: true,
          closable: false
        });

        const result = await ref.onClose.toPromise();
        if (result) {
          // Track profile view with visitor info
          await this.analyticsService.trackProfileView(uid, {
            name: result.name,
            email: result.email
          });
          
          // Show profile
          this.showProfile = true;
        } else {
          this.error = 'Profile access requires visitor information';
          this.user = null;
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      this.error = 'User not found';
    } finally {
      this.isLoading = false;
    }
  }

  getFullAssetUrl(assetKey: string | null | undefined): string | undefined {
    if (!assetKey) return undefined;
    return this.userService.getFullAssetUrl(assetKey);
  }

  async trackVideoView(video: { url: string; description: string | null }) {
    if (!this.user) return;
    await this.analyticsService.trackVideoView(
      this.user.uid, 
      video.url, 
      video.description || 'Untitled Video'
    );
  }

  async trackResumeDownload() {
    if (!this.user) return;
    await this.analyticsService.trackResumeDownload(this.user.uid);
  }

  async trackCertificateDownload(certificate: { url: string; name: string }) {
    if (!this.user) return;
    await this.analyticsService.trackCertificateDownload(
      this.user.uid, 
      certificate.url, 
      certificate.name
    );
  }
}
