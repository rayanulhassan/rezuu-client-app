import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { MessageModule } from 'primeng/message';
import { CheckboxModule } from 'primeng/checkbox';

@Component({
  selector: 'app-visitor-info-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    ButtonModule,
    MessageModule,
    CheckboxModule,
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
            [disabled]="isAnonymous"
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
            [disabled]="isAnonymous"
          />
        </div>

        <div class="field-checkbox">
          <p-checkbox
            inputId="anonymous"
            [(ngModel)]="isAnonymous"
            [binary]="true"
            (onChange)="handleAnonymousChange()"
          ></p-checkbox>
          <label for="anonymous" class="ml-2 text-sm text-gray-600">I wish to remain Anonymous</label>
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
  isAnonymous = false;

  constructor(public ref: DynamicDialogRef) {}

  handleAnonymousChange() {
    if (this.isAnonymous) {
      this.visitorInfo.name = 'Anonymous user';
      this.visitorInfo.email = 'anonymous@email.com';
    } else {
      this.visitorInfo.name = '';
      this.visitorInfo.email = '';
    }
  }

  isFormValid(): boolean {
    if (this.isAnonymous) {
      return true;
    }
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
