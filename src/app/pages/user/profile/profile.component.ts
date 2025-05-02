import { Component, inject, signal, effect } from '@angular/core';
import { FilesUploadComponent } from '../../../shared/components/files-upload/files-upload.component';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { TooltipModule } from 'primeng/tooltip';
import { CheckboxModule } from 'primeng/checkbox';
import { UserService } from '../../../shared/services/user.service';
import { MessageService } from 'primeng/api';
import { FormsModule } from '@angular/forms';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

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
    CheckboxModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './profile.component.html',
  styles: ``,
})
export class ProfileComponent {
  userService = inject(UserService);
  messageService = inject(MessageService);
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
  isRemovingCertificate = signal<string | null>(null);
  isAddingLink = signal(false);
  isRemovingLink = signal<{ platform: string; url: string } | null>(null);

  // video signals
  videoDescriptions = signal<{ [key: string]: string }>({});
  isSavingVideo = signal<string | null>(null);
  isRemovingVideo = signal<string | null>(null);
  isEditingVideoDescription = signal<string | null>(null);

  // Calculate maximum allowed videos based on plan
  getMaxAllowedVideos(): number {
    const userData = this.user();
    if (!userData) return 2; // Default to 2 free videos
    
    // 2 free videos + number of paid sections
    return 2 + (userData.planOptions?.videoSection || 0);
  }

  // Check if user can upload more videos
  canUploadMoreVideos(): boolean {
    const userData = this.user();
    if (!userData) return false;
    
    const currentVideos = userData.videos?.length || 0;
    return currentVideos < this.getMaxAllowedVideos();
  }

  // user info form
  userInfoForm = this.fb.group({
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    contactNumber: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]]
  });

  // external link form
  externalLinkForm = this.fb.group({
    platform: ['', [Validators.required]],
    url: ['', [Validators.required, Validators.pattern('https?://.+')]]
  });

  // Public profile link
  publicProfileLink = signal('');
  isCopying = signal(false);
  isUpdatingPublicProfile = signal(false);

  constructor() {
    // Initialize description from user data
    effect(() => {
      const userData = this.user();
      if (userData?.description) {
        this.description.set(userData.description);
      }
      if (userData?.uid) {
        // Construct the public profile link
        this.publicProfileLink.set(`${window.location.origin}/${userData.uid}`);
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
        title: 'Upload Videos',
        description: `Upload your videos (max ${this.getMaxAllowedVideos()})`,
        accept: 'video/*',
        maxFiles: type === 'video' ? this.getRemainingVideoSlots() : this.getMaxAllowedVideos(),
        allowMultiple: true,
      },
    };

    return configs[type];
  }

  // Calculate remaining video slots
  private getRemainingVideoSlots(): number {
    const userData = this.user();
    if (!userData) return 0;
    
    const currentVideos = userData.videos?.length || 0;
    const maxAllowed = this.getMaxAllowedVideos();
    return Math.max(0, maxAllowed - currentVideos);
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
    if (!this.canUploadMoreVideos()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Video Limit Reached',
        detail: `You can upload up to ${this.getMaxAllowedVideos()} videos. Please upgrade your plan to upload more videos.`
      });
      return;
    }
    this.showUploadModal('video');
  }

  async onAddExternalLink() {
    if (this.externalLinkForm.invalid) return;

    this.isAddingLink.set(true);
    try {
      await this.userService.addExternalLink({
        platform: this.externalLinkForm.value.platform!,
        url: this.externalLinkForm.value.url!
      });
      this.externalLinkForm.reset();
    } catch (error) {
      console.error('Error adding external link:', error);
    } finally {
      this.isAddingLink.set(false);
    }
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
        if (files.length > 0) {
          const currentVideos = this.user()?.videos || [];
          const maxAllowed = this.getMaxAllowedVideos();
          const remainingSlots = maxAllowed - currentVideos.length;
          
          // Only add videos up to the allowed limit
          const videosToAdd = files.slice(0, remainingSlots);
          const newVideos = videosToAdd.map(url => ({ url, description: null }));
          
          if (videosToAdd.length < files.length) {
            this.messageService.add({
              severity: 'warn',
              summary: 'Video Limit Reached',
              detail: `Only ${videosToAdd.length} videos were added. You can upload up to ${maxAllowed} videos.`
            });
          }
          
          this.userService.updateVideos([...currentVideos, ...newVideos]);
        }
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

  async onRemoveCertificate(certificateUrl: string) {
    this.isRemovingCertificate.set(certificateUrl);
    try {
      await this.userService.removeCertificate(certificateUrl);
    } catch (error) {
      console.error('Error removing certificate:', error);
    } finally {
      this.isRemovingCertificate.set(null);
    }
  }

  async onRemoveExternalLink(link: { platform: string; url: string }) {
    this.isRemovingLink.set(link);
    try {
      await this.userService.removeExternalLink(link);
    } catch (error) {
      console.error('Error removing external link:', error);
    } finally {
      this.isRemovingLink.set(null);
    }
  }

  onEditVideoDescription(videoUrl: string) {
    this.isEditingVideoDescription.set(videoUrl);
    const descriptions = this.videoDescriptions();
    const video = this.user()?.videos?.find(v => v.url === videoUrl);
    descriptions[videoUrl] = video?.description || '';
    this.videoDescriptions.set(descriptions);
  }

  onCancelEditVideoDescription(videoUrl: string) {
    this.isEditingVideoDescription.set(null);
    const descriptions = this.videoDescriptions();
    delete descriptions[videoUrl];
    this.videoDescriptions.set(descriptions);
  }

  async onSaveVideoDescription(videoUrl: string) {
    this.isSavingVideo.set(videoUrl);
    try {
      const currentVideos = this.user()?.videos || [];
      const updatedVideos = currentVideos.map(video => {
        if (video.url === videoUrl) {
          return { ...video, description: this.videoDescriptions()[videoUrl] };
        }
        return video;
      });
      await this.userService.updateVideos(updatedVideos);
      this.isEditingVideoDescription.set(null);
    } catch (error) {
      console.error('Error saving video description:', error);
    } finally {
      this.isSavingVideo.set(null);
    }
  }

  async onRemoveVideo(videoUrl: string) {
    this.isRemovingVideo.set(videoUrl);
    try {
      await this.userService.removeVideo(videoUrl);
      const descriptions = this.videoDescriptions();
      delete descriptions[videoUrl];
      this.videoDescriptions.set(descriptions);
    } catch (error) {
      console.error('Error removing video:', error);
    } finally {
      this.isRemovingVideo.set(null);
    }
  }

  onVideoDescriptionChange(videoUrl: string, event: Event) {
    const textarea = event.target as HTMLTextAreaElement;
    const descriptions = this.videoDescriptions();
    descriptions[videoUrl] = textarea.value;
    this.videoDescriptions.set(descriptions);
  }

  async copyPublicProfileLink() {
    try {
      this.isCopying.set(true);
      await navigator.clipboard.writeText(this.publicProfileLink())
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to copy link to clipboard'
      });
    } finally {
      // Reset the copying state after a short delay
      setTimeout(() => {
        this.isCopying.set(false);
      }, 1000);
    }
  }

  async onPublicProfileChange(event: any) {
    const checkbox = event.checked;
    this.isUpdatingPublicProfile.set(true);
    try {
      await this.userService.updatePublicProfileStatus(checkbox);
    } catch (error) {
      console.error('Error updating public profile status:', error);
    } finally {
      this.isUpdatingPublicProfile.set(false);
    }
  }

}
