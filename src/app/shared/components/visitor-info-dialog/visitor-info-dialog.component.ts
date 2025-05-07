import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'app-visitor-info-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    ButtonModule,
    MessageModule,
  ],
  template: `
    <div class="">
      <p class="text-gray-600 mb-4">
        Please provide your information to continue viewing this profile.
      </p>

      <div class="space-y-4">
        <div class="field">
          <label for="name" class="block text-sm font-medium text-gray-700 mb-1"
            >Name</label
          >
          <input
            id="name"
            type="text"
            pInputText
            [(ngModel)]="visitorInfo.name"
            class="w-full"
            placeholder="Enter your name"
          />
        </div>

        <div class="field">
          <label
            for="email"
            class="block text-sm font-medium text-gray-700 mb-1"
            >Email</label
          >
          <input
            id="email"
            type="email"
            pInputText
            [(ngModel)]="visitorInfo.email"
            class="w-full"
            placeholder="Enter your email"
          />
        </div>
      </div>

      <div class="mt-4">
        <p-message
          size="small"
          icon="pi pi-info-circle"
          severity="secondary"
          variant="outlined"
        >
          <p class="text-xs italic">
            This Rezuu profile is user-submitted. Limited data may be collected
            for security and analytics. No data is sold, shared, or misused.
          </p>
        </p-message>
      </div>

      <div class="flex justify-end gap-2 mt-6">
        <button
          pButton
          type="button"
          label="Cancel"
          class="p-button-text"
          (click)="ref.close()"
        ></button>
        <button
          pButton
          type="button"
          label="Submit"
          (click)="submit()"
          [disabled]="!isFormValid()"
        ></button>
      </div>
    </div>
  `,
})
export class VisitorInfoDialogComponent {
  visitorInfo = {
    name: '',
    email: '',
  };

  constructor(public ref: DynamicDialogRef) {}

  isFormValid(): boolean {
    return (
      this.visitorInfo.name.trim() !== '' &&
      this.visitorInfo.email.trim() !== '' &&
      this.isValidEmail(this.visitorInfo.email)
    );
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  submit() {
    if (this.isFormValid()) {
      this.ref.close(this.visitorInfo);
    }
  }
}
