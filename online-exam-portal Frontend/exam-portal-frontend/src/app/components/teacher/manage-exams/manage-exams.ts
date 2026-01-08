import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ExamService } from '../../../services/exam';
import { QuizService } from '../../../services/quiz';

@Component({
  selector: 'app-manage-exams',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './manage-exams.html',
  styleUrls: ['./manage-exams.css']
})
export class ManageExamsComponent implements OnInit {
  activeTab: 'exams' | 'quizzes' = 'exams';
  exams: any[] = [];
  quizzes: any[] = [];
  serverMessage = '';

  constructor(
    public router: Router,
    private examService: ExamService,
    private quizService: QuizService
  ) {}

  ngOnInit(): void {
    this.loadExams();
  }

  /** 🔁 Switch Tabs */
  switchTab(tab: 'exams' | 'quizzes'): void {
    this.activeTab = tab;
    this.serverMessage = '';

    if (tab === 'exams') {
      this.loadExams();
    } else {
      this.loadQuizzes();
    }
  }

  /** 📘 Load Exams for Teacher */
  loadExams(): void {
    this.examService.getAllExams().subscribe({
      next: (res: any) => {
        if (res && res.success && res.data) {
          this.exams = res.data;
        } else if (Array.isArray(res)) {
          this.exams = res;
        } else {
          this.exams = [];
        }
        this.serverMessage =
          this.exams.length === 0 ? '⚠️ No exams found.' : '';
      },
      error: (err: any) => {
        console.error('❌ Error loading exams:', err);
        this.serverMessage = '❌ Failed to load exams.';
      }
    });
  }

  /** 🧩 Load Quizzes for Teacher */
  loadQuizzes(): void {
    this.quizService.getAllQuizzes().subscribe({
      next: (res: any) => {
        if (res && res.success && res.data) {
          this.quizzes = res.data;
        } else if (Array.isArray(res)) {
          this.quizzes = res;
        } else {
          this.quizzes = [];
        }
        this.serverMessage =
          this.quizzes.length === 0 ? '⚠️ No quizzes found.' : '';
      },
      error: (err: any) => {
        console.error('❌ Failed to load quizzes:', err);
        this.serverMessage = '❌ Failed to load quizzes.';
      }
    });
  }

  /** 🗑 Delete Exam */
  deleteExam(id: number): void {
    if (confirm('Are you sure you want to delete this exam?')) {
      this.examService.deleteExam(id).subscribe({
        next: (res: any) => {
          this.serverMessage = res.message || '✅ Exam deleted successfully!';
          this.loadExams();
        },
        error: (err: any) => {
          console.error('❌ Delete error:', err);
          this.serverMessage = '❌ Failed to delete exam.';
        }
      });
    }
  }

  /** 🗑 Delete Quiz */
  deleteQuiz(id: number): void {
    if (confirm('Are you sure you want to delete this quiz?')) {
      this.quizService.deleteQuiz(id).subscribe({
        next: (res: any) => {
          this.serverMessage = res.message || '✅ Quiz deleted successfully!';
          this.loadQuizzes();
        },
        error: (err: any) => {
          console.error('❌ Delete quiz error:', err);
          this.serverMessage = '❌ Failed to delete quiz.';
        }
      });
    }
  }

  /** ➕ Navigate to Create Exam */
  createExam(): void {
    this.router.navigate(['/teacher/create-exam']);
  }

  /** ➕ Navigate to Create Quiz */
  createQuiz(): void {
    this.router.navigate(['/teacher/create-quiz']);
  }

  /** 🏠 Navigate back to Teacher Dashboard */
  goToTeacherDashboard(): void {
    this.router.navigate(['/teacher-dashboard']); // ✅ FIXED route
  }
}
