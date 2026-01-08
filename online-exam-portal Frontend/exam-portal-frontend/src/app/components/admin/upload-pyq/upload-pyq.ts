import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NavbarComponent } from '../../navbar/navbar';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-upload-pyq',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './upload-pyq.html',
  styleUrls: ['./upload-pyq.css']
})
export class UploadPyqComponent {
  selectedFile: File | null = null;
  subject: string = '';
  year: string = '';
  message: string = '';
  uploadInProgress: boolean = false;

  private apiUrl = 'http://localhost:8082/api/pyq/upload'; // ✅ update if different

  constructor(private http: HttpClient, private authService: AuthService) {}

  onFileChange(event: any) {
    this.selectedFile = event.target.files[0];
  }

  onUpload() {
    if (!this.selectedFile || !this.subject || !this.year) {
      this.message = '⚠️ Please fill all fields and select a PDF file.';
      return;
    }

    this.uploadInProgress = true;

    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('subject', this.subject);
    formData.append('year', this.year);

    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    this.http.post(this.apiUrl, formData, { headers, responseType: 'text' })
      .subscribe({
        next: (res) => {
          this.message = '✅ File uploaded successfully!';
          this.uploadInProgress = false;
          this.selectedFile = null;
          this.subject = '';
          this.year = '';
        },
        error: (err) => {
          console.error(err);
          this.message = '❌ Upload failed. Please try again.';
          this.uploadInProgress = false;
        }
      });
  }
}
