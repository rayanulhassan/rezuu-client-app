import { Component, inject, signal, effect } from '@angular/core';
import { FilesUploadComponent } from '../../../shared/components/files-upload/files-upload.component';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { TooltipModule } from 'primeng/tooltip';
import { UserService } from '../../../shared/services/user.service';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';

type UploadType = 'profile' | 'resume' | 'certificates' | 'video';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    FilesUploadComponent,
    InputTextModule,
    TextareaModule,
    TooltipModule,
    ReactiveFormsModule,
  ],
  templateUrl: './profile.component.html',
  styles: ``,
})
export class ProfileComponent {
  userService = inject(UserService);
  user = this.userService.userDetails;
  fb = inject(FormBuilder);

  // modal signals
  uploadModalVisible = signal(false);
  uploadModalTitle = signal('');
  uploadModalDescription = signal('');
  uploadModalAllowMultiple = signal(false);
  uploadModalAccept = signal('');
  uploadModalMaxFiles = signal(1);
  currentUploadType = signal<UploadType>('profile');

  // description signals
  description = signal('');
  isEditingDescription = signal(false);

  // loading state
  isSaving = signal(false);

  // user info form
  userInfoForm = this.fb.group({
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    contactNumber: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]]
  });

  constructor() {
    // Initialize description from user data
    effect(() => {
      const userData = this.user();
      if (userData?.description) {
        this.description.set(userData.description);
      }
    });

    // Initialize user info form
    effect(() => {
      const userData = this.user();
      if (userData) {
        this.userInfoForm.patchValue({
          firstName: userData.firstName,
          lastName: userData.lastName,
          contactNumber: userData.contactNumber || '',
          email: userData.email,
        });
      }
    });
  }

  private getUploadConfig(type: UploadType) {
    const configs = {
      profile: {
        title: 'Upload Profile Picture',
        description: 'Upload your profile picture',
        accept: 'image/*',
        maxFiles: 1,
        allowMultiple: false,
      },
      resume: {
        title: 'Upload Resume',
        description: 'Upload your resume',
        accept: '.pdf,.doc,.docx',
        maxFiles: 1,
        allowMultiple: false,
      },
      certificates: {
        title: 'Upload Certificates',
        description: 'Upload your certificates',
        accept: 'image/*,.pdf',
        maxFiles: 5,
        allowMultiple: true,
      },
      video: {
        title: 'Upload Experience Video',
        description: 'Upload a video about your experience',
        accept: 'video/*',
        maxFiles: 1,
        allowMultiple: false,
      },
    };

    return configs[type];
  }

  private showUploadModal(type: UploadType) {
    const config = this.getUploadConfig(type);
    this.currentUploadType.set(type);
    this.uploadModalVisible.set(true);
    this.uploadModalTitle.set(config.title);
    this.uploadModalDescription.set(config.description);
    this.uploadModalAllowMultiple.set(config.allowMultiple);
    this.uploadModalAccept.set(config.accept);
    this.uploadModalMaxFiles.set(config.maxFiles);
  }

  onProfileImageUpload() {
    this.showUploadModal('profile');
  }

  onResumeUpload() {
    this.showUploadModal('resume');
  }

  onCertificatesUpload() {
    this.showUploadModal('certificates');
  }

  onVideoUpload() {
    this.showUploadModal('video');
  }

  onAddExternalLink() {
    // TODO: Implement external link functionality
    console.log('Add external link clicked');
  }

  onModalCancel() {
    this.uploadModalVisible.set(false);
  }

  onModalFilesUploaded(files: string[]) {
    switch (this.currentUploadType()) {
      case 'profile':
        if (files.length > 0) {
          this.userService.updateProfileImage(files[0]);
        }
        break;
      case 'resume':
        if (files.length > 0) {
          this.userService.updateResume(files[0]);
        }
        break;
      case 'certificates':
        if (files.length > 0) {
          this.userService.updateCertificates(files);
        }
        break;
      case 'video':
        // TODO: Implement video update
        console.log('Video uploaded:', files[0]);
        break;
    }

    this.uploadModalVisible.set(false);
  }

  onSaveChanges() {
    // TODO: Implement save changes functionality
    console.log('Save changes clicked');
  }

  onDescriptionChange(event: Event) {
    const textarea = event.target as HTMLTextAreaElement;
    this.description.set(textarea.value);
  }

  async onSaveDescription() {
    try {
      await this.userService.updateDescription(this.description());
      this.isEditingDescription.set(false);
    } catch (error) {
      console.error('Error saving description:', error);
    }
  }

  onEditDescription() {
    this.isEditingDescription.set(true);
  }

  onCancelEdit() {
    const userData = this.user();
    this.description.set(userData?.description || '');
    this.isEditingDescription.set(false);
  }

  async onSaveUserInfo() {
    if (this.userInfoForm.invalid) return;

    this.isSaving.set(true);
    try {
      await this.userService.updateUserInfo({
        firstName: this.userInfoForm.value.firstName!,
        lastName: this.userInfoForm.value.lastName!,
        contactNumber: this.userInfoForm.value.contactNumber || null,
        email: this.userInfoForm.value.email!
      });
    } catch (error) {
      console.error('Error saving user information:', error);
    } finally {
      this.isSaving.set(false);
    }
  }
}
