import { Component, input, output } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
@Component({
  selector: 'app-files-upload',
  imports: [DialogModule, ButtonModule],
  templateUrl: './files-upload.component.html',
  styles: ``
})
export class FilesUploadComponent {
  visible = input.required<boolean>();
  title = input.required<string>();
  description = input<string>();
  accept = input<string>('*/*');
  allowMultiple = input<boolean>(false);
  maxSize = input<number>();
  maxFiles = input<number>(-1);

  onCancel = output<void>();
  onFilesUploaded = output<any>();

  onCancelClick() {
    this.onCancel.emit();
  }

  onFilesUploadedClick() {
    this.onFilesUploaded.emit({});
  }

  onFilesUpload() {
    this.onFilesUploaded.emit({});
  }
}