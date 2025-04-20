import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { UserService } from '../../../shared/services/user.service';
import { RezuuUser } from '../../../shared/interfaces/auth.interface';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-public-profile',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    TooltipModule
  ],
  templateUrl: './public-profile.component.html',
  styles: ``
})
export class PublicProfileComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private userService = inject(UserService);
  private subscription = new Subscription();

  user: RezuuUser | null = null;
  isLoading = true;
  error: string | null = null;

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
}
