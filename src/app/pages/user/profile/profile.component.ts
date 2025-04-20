import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../../shared/services/auth.service';
import { FilesUploadComponent } from '../../../shared/components/files-upload/files-upload.component';
import { ButtonModule } from 'primeng/button';
import { JsonPipe } from '@angular/common';

interface UploadModalConfig {
  title: string;
  description: string;
  allowMultiple: boolean;
  accept: string;
  maxFiles: number;
  onCancel: () => void;
  onFilesUploaded: (files: string[]) => void;
}

@Component({
  selector: 'app-profile',
  imports: [ButtonModule, FilesUploadComponent, JsonPipe],
  standalone: true,
  templateUrl: './profile.component.html',
  styles: ``,
})
export class ProfileComponent {
  #authService = inject(AuthService);

  user = this.#authService.user;
  userDoc = this.#authService.userDetails;

  // modal signals
  uploadModalVisible = signal(false);
  uploadModalTitle = signal('Upload Profile Image');
  uploadModalDescription = signal('Upload a profile image');
  uploadModalAllowMultiple = signal(false);
  uploadModalAccept = signal('image/*');
  uploadModalMaxFiles = signal(1);

  private currentUploadConfig: UploadModalConfig | null = null;

  onShowUploadModal(config: UploadModalConfig) {
    this.currentUploadConfig = config;
    this.uploadModalVisible.set(true);
    this.uploadModalTitle.set(config.title);
    this.uploadModalDescription.set(config.description);
    this.uploadModalAllowMultiple.set(config.allowMultiple);
    this.uploadModalAccept.set(config.accept);
    this.uploadModalMaxFiles.set(config.maxFiles);
  }

  onModalCancel() {
    this.uploadModalVisible.set(false);
    this.currentUploadConfig?.onCancel();
  }

  onModalFilesUploaded(files: string[]) {
    this.uploadModalVisible.set(false);
    this.currentUploadConfig?.onFilesUploaded(files);
  }

  onProfileImageUpload() {
    this.onShowUploadModal({
      title: 'Upload Profile Image',
      description: 'Upload a profile image',
      allowMultiple: false,
      accept: 'image/*',
      maxFiles: 1,
      onCancel: () => {
        console.log('Profile image upload cancelled');
      },
      onFilesUploaded: (files: string[]) => {
        console.log('Profile images uploaded:', files);
        // Handle profile image upload here
      }
    });
  }
}
