import { Injectable, inject } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { HttpClient, HttpHeaders } from '@angular/common/http';

export interface UploadProgress {
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
}

@Injectable({
  providedIn: 'root',
})
export class FileUploadService {
  readonly #http = inject(HttpClient);

  readonly #cloudFunctionUrl = environment.couldFunctionUrl;

  getPresignedUrl({
    fileType,
    fileName,
    folderName,
  }: {
    fileType: string;
    fileName: string;
    folderName: string;
  }) {
    return this.#http.get<{ url: string; key: string }>(
      `${this.#cloudFunctionUrl}?contentType=${fileType}&filename=${fileName}&folder=${folderName}`
    );
  }

  uploadFile(file: File, url: string) {
    const headers = new HttpHeaders({
      'x-amz-acl': 'public-read',
    });

    return this.#http.put(url, file, {
      headers,
      reportProgress: true,
      observe: 'events',
      withCredentials: false
    });
  }
  
  
}
