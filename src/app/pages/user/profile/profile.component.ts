import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../../shared/services/auth.service';
import { FilesUploadComponent } from '../../../shared/components/files-upload/files-upload.component';
import { ButtonModule } from 'primeng/button';
@Component({
  selector: 'app-profile',
  imports: [ButtonModule, FilesUploadComponent],
  standalone: true,
  templateUrl: './profile.component.html',
  styles: ``
})
export class ProfileComponent {
  #authService = inject(AuthService);

  user = this.#authService.user;

  // modal signals
  uploadModalVisible = signal(false);
  uploadModalTitle = signal('Upload Profile Image');
  uploadModalDescription = signal('Upload a profile image');
  uploadModalAllowMultiple = signal(false);
  uploadModalAccept = signal('image/*');
  uploadModalMaxFiles = signal(1);
  modalCancel!: Function;
  modalFilesUploaded!: Function;

  onShowUploadModal(title: string, description: string, allowMultiple: boolean = false, accept: string = 'image/*', maxFiles: number = 1, {onCancel, onFilesUploaded}: {onCancel: Function, onFilesUploaded: Function}) {
    this.uploadModalVisible.set(true);
    this.uploadModalTitle.set(title);
    this.uploadModalDescription.set(description);
    this.uploadModalAllowMultiple.set(allowMultiple);
    this.uploadModalAccept.set(accept);
    this.uploadModalMaxFiles.set(maxFiles);
    this.modalCancel = onCancel;
    this.modalFilesUploaded = onFilesUploaded;
  }

  onProfileImageUpload() {
    this.onShowUploadModal('Upload Profile Image', 'Upload a profile image', false, 'image/*', 1, {
      onCancel: () => {
        this.uploadModalVisible.set(false);
      },
      onFilesUploaded: (files: any) => {
        console.log(files);
        this.uploadModalVisible.set(false);
      }
    });
  }
}
