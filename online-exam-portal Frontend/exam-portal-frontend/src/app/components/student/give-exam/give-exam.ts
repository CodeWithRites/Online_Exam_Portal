import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NavbarComponent } from '../../navbar/navbar';
import { ExamService } from '../../../services/exam';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-give-exam',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  templateUrl: './give-exam.html',
  styleUrls: ['./give-exam.css']
})
export class GiveExamComponent implements OnInit {
  exams: any[] = [];
  attemptedExamIds: number[] = [];
  loading = true;
  errorMessage = '';

  private apiUrl = 'http://localhost:8082/api/result/my-submissions';

  constructor(
    private examService: ExamService,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadExams();
  }

  /** ✅ Load exams and user's attempted ones */
  loadExams(): void {
    this.loading = true;

    this.examService.getPublicExams().subscribe({
      next: (res: any) => {
        this.exams = res?.data || [];

        // ✅ Fetch attempted exams for logged-in student
        this.http.get<any[]>(this.apiUrl, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }).subscribe({
          next: (subs) => {
            this.attemptedExamIds = subs.map((s: any) => s.examId);
            this.loading = false;
          },
          error: (err) => {
            console.error('❌ Failed to fetch attempted exams:', err);
            this.loading = false;
          }
        });
      },
      error: (err: any) => {
        console.error('❌ Error loading exams:', err);
        this.loading = false;
        this.errorMessage = '❌ Failed to load exams. Please try again.';
      }
    });
  }

  /** ✅ Check if exam already attempted */
  isExamAttempted(examId: number): boolean {
    return this.attemptedExamIds.includes(examId);
  }

  /** 🚀 Start Exam */
  startExam(examId: number): void {
    if (this.isExamAttempted(examId)) {
      alert('⚠️ You have already attempted this exam.');
      return;
    }
    this.router.navigate(['/student/start-exam', examId]);
  }

  /** 📊 View Performance */
viewPerformance(examId: number): void {
  this.router.navigate(['/student/performance', examId]);
}


  /** ⬅ Back to Dashboard */
  goToStudentDashboard(): void {
    this.router.navigate(['/student-dashboard']);
  }
}
