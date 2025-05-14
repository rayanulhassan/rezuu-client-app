import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-how-it-works',
  imports: [RouterModule],
  templateUrl: './how-it-works.component.html',
  styles: ``,
})
export class HowItWorksComponent {
  videoUrls = [
    'https://rezuu-assets.tor1.cdn.digitaloceanspaces.com/app-assets/rezuu-create-profile-step-1.mp4',
    'https://rezuu-assets.tor1.cdn.digitaloceanspaces.com/app-assets/rezuu-create-profile-step-2.mp4',
    'https://rezuu-assets.tor1.cdn.digitaloceanspaces.com/app-assets/rezuu-create-profile-step-3.mp4',
    'https://rezuu-assets.tor1.cdn.digitaloceanspaces.com/app-assets/rezuu-create-profile-step-4.mp4',
  ];
}
