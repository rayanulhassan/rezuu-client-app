import { Component, input, output } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { NgxFileDropEntry, NgxFileDropModule } from 'ngx-file-drop';
import { FileUploadService } from '../../services/file-upload.service';
import { lastValueFrom } from 'rxjs';
import { HttpEventType } from '@angular/common/http';
import { ProgressBarModule } from 'primeng/progressbar';

interface FileItem {
  file: File;
  name: string;
  isValid: boolean;
  errorMessage: string | null;
  progress: number;
  uploaded: boolean;
  isUploading: boolean;
  key?: string;
}

@Component({
  selector: 'app-files-upload',
  imports: [DialogModule, ButtonModule, NgxFileDropModule, ProgressBarModule],
  templateUrl: './files-upload.component.html',
  styles: ``,
})
export class FilesUploadComponent {
  visible = input.required<boolean>();
  title = input.required<string>();
  uploadFolderName = input.required<string>();
  description = input<string>();
  accept = input<string>('*/*');
  allowMultiple = input<boolean>(false);
  maxSize = input<number>();
  maxFiles = input<number>(-1); // -1 means unlimited

  files: FileItem[] = [];
  isUploading = false;

  onCancel = output<void>();
  onFilesUploaded = output<string[]>();

  constructor(private fileUploadService: FileUploadService) {}

  get canUpload(): boolean {
    const validFiles = this.files.filter(file => file.isValid);
    return validFiles.length > 0 && !this.isUploading && !validFiles.some(f => f.isUploading);
  }

  get isAnyFileUploading(): boolean {
    return this.files.some(f => f.isUploading);
  }

  get areAllFilesProcessed(): boolean {
    const validFiles = this.files.filter(file => file.isValid);
    return validFiles.length > 0 && validFiles.every(f => f.uploaded || !f.isValid);
  }

  onCancelClick() {
    this.onCancel.emit();
  }


  async onFilesUpload() {
    const validFiles = this.files.filter(file => file.isValid && !file.uploaded);
    this.isUploading = true;

    try {
      for (const fileItem of validFiles) {
        fileItem.isUploading = true;
        try {
          const presignedUrlResponse = await lastValueFrom(
            this.fileUploadService.getPresignedUrl({
              fileType: fileItem.file.type,
              fileName: fileItem.file.name,
              folderName: this.uploadFolderName()
            })
          );

          fileItem.key = presignedUrlResponse.key;

          const upload$ = this.fileUploadService.uploadFile(fileItem.file, presignedUrlResponse.url);
          
          upload$.subscribe({
            next: (event) => {
              if (event.type === HttpEventType.UploadProgress) {
                const progress = Math.round((event.loaded / event.total!) * 100);
                fileItem.progress = progress;
              }
            },
            error: (error) => {
              console.error('Upload error:', error);
              fileItem.isValid = false;
              fileItem.errorMessage = error.message || 'Upload failed';
              fileItem.progress = 0;
              fileItem.isUploading = false;
            },
            complete: () => {
              fileItem.uploaded = true;
              fileItem.progress = 100;
              fileItem.isUploading = false;
              
              if (this.areAllFilesProcessed) {
                const uploadedKeys = this.files
                  .filter(f => f.uploaded && f.key)
                  .map(f => f.key!);
                this.onFilesUploaded.emit(uploadedKeys);
              }
            }
          });
        } catch (error) {
          fileItem.isValid = false;
          fileItem.errorMessage = 'Failed to get upload URL';
          fileItem.progress = 0;
          fileItem.isUploading = false;
        }
      }
    } finally {
      this.isUploading = false;
    }
  }

  onFilesDrop(files: NgxFileDropEntry[]) {
    for (const droppedFile of files) {
      // Is it a file?
      if (droppedFile.fileEntry.isFile) {
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
        fileEntry.file((file: File) => {
          if (
            (this.maxFiles() !== -1 && this.files.length >= this.maxFiles()) ||
            (this.maxSize() && file.size > (this.maxSize() ?? 0))
          ) {
            this.files.push({
              file,
              name: file.name,
              isValid: false,
              errorMessage:
                this.files.length >= this.maxFiles()
                  ? `Only ${this.maxFiles()} file(s) is allowed`
                  : `File size is too large`,
              progress: 0,
              uploaded: false,
              isUploading: false
            });
          } else {
            this.files.push({
              file,
              name: file.name,
              isValid: true,
              errorMessage: null,
              progress: 0,
              uploaded: false,
              isUploading: false
            });
          }
        });
      }
    }
  }

  onFileRemove(index: number) {
    if (!this.files[index].isUploading && !this.files[index].uploaded) {
      this.files.splice(index, 1);
    }
  }
}

