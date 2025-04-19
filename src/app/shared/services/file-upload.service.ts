import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Upload } from '@aws-sdk/lib-storage';

export interface UploadProgress {
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  private readonly s3Client: S3Client;
  private readonly BUCKET_NAME = environment.digitalOceanSpaces.bucketName;

  constructor() {
    this.s3Client = new S3Client({
      endpoint: environment.digitalOceanSpaces.endpoint,
      region: environment.digitalOceanSpaces.region,
      credentials: {
        accessKeyId: environment.digitalOceanSpaces.accessKeyId,
        secretAccessKey: environment.digitalOceanSpaces.secretAccessKey
      },
      forcePathStyle: true // Required for DigitalOcean Spaces
    });
  }

  uploadFile(file: File, userId: string, folder: string): Observable<UploadProgress> {
    const progressSubject = new Subject<UploadProgress>();
    
    // Create a unique filename
    const timestamp = new Date().getTime();
    const fileExtension = file.name.split('.').pop();
    const fileName = `${folder}/${userId}/${timestamp}.${fileExtension}`;

    // Create the upload
    const upload = new Upload({
      client: this.s3Client,
      params: {
        Bucket: this.BUCKET_NAME,
        Key: fileName,
        Body: file,
        ACL: 'public-read',
        ContentType: file.type
      }
    });

    // Handle upload progress
    upload.on('httpUploadProgress', (progress) => {
      const percent = Math.round((progress.loaded! / progress.total!) * 100);
      progressSubject.next({
        progress: percent,
        status: 'uploading'
      });
    });

    // Start the upload
    upload.done()
      .then(() => {
        progressSubject.next({ progress: 100, status: 'completed' });
        progressSubject.complete();
      })
      .catch(error => {
        console.error('Upload error:', error);
        progressSubject.next({ 
          progress: 0, 
          status: 'error', 
          error: 'Failed to upload file. Please try again.' 
        });
        progressSubject.complete();
      });

    return progressSubject.asObservable();
  }

  async getFileUrl(fileName: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.BUCKET_NAME,
      Key: fileName
    });

    try {
      // Generate a presigned URL that expires in 1 hour
      const url = await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
      return url;
    } catch (error) {
      console.error('Error generating presigned URL:', error);
      throw error;
    }
  }
}
