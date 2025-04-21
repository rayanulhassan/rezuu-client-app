import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-visitor-info-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    ButtonModule
  ],
  template: `
    <div class="p-4">
      <h2 class="text-xl font-semibold mb-4">Visitor Information</h2>
      <p class="text-gray-600 mb-4">Please provide your information to continue viewing this profile.</p>
      
      <div class="space-y-4">
        <div class="field">
          <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Name</label>
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
          <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
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
  `
})
export class VisitorInfoDialogComponent {
  visitorInfo = {
    name: '',
    email: ''
  };

  constructor(public ref: DynamicDialogRef) {}

  isFormValid(): boolean {
    return this.visitorInfo.name.trim() !== '' && 
           this.visitorInfo.email.trim() !== '' &&
           this.isValidEmail(this.visitorInfo.email);
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