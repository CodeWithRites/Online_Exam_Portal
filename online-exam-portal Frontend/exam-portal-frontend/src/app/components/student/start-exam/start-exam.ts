import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { interval, Subscription } from 'rxjs';
import { TeacherService } from '../../../services/teacher.service';

@Component({
  selector: 'app-start-exam',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './start-exam.html',
  styleUrls: ['./start-exam.css']
})
export class StartExamComponent implements OnInit, OnDestroy {
  // --- Exam & State ---
  examId!: number;
  exam: any;
  questions: any[] = [];
  currentQuestionIndex = 0;
  submitted = false;
  loading = true;

  // --- Answers ---
  answers: { [key: number]: { textAnswer: string; filePath?: string | null } } = {};

  // --- Timer ---
  remainingSeconds = 0;
  timerSubscription?: Subscription;
  autosaveSubscription?: Subscription;
  warningTime = 5 * 60; // 5 minutes

  // --- Non-blocking Warnings ---
  showFullscreenWarning = false;
  tabWarned = false;
  screenshotWarned = false;

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private teacherService: TeacherService
  ) {}

  ngOnInit(): void {
    this.examId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadExam();

    // ✅ Friendly non-blocking tab switch alert
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && !this.tabWarned) {
        this.tabWarned = true;
        alert('⚠️ Tab switch detected! Please stay on the exam screen.');
      }
    });
  }

  ngOnDestroy(): void {
    this.stopAll();
  }

  /** ✅ Load Exam from Backend */
  loadExam(): void {
    this.teacherService.getExamById(this.examId).subscribe({
      next: (data: any) => {
        this.exam = data;
        this.questions = data.questions || [];
        this.remainingSeconds = (data.durationMinutes || 60) * 60;
        this.restoreProgress();
        this.startTimer();
        this.startAutoSave();
        this.loading = false;
      },
      error: (err: any) => {
        console.error('❌ Failed to load exam:', err);
        this.loading = false;
      }
    });
  }

  /** ✅ Timer Logic */
  startTimer(): void {
    this.timerSubscription = interval(1000).subscribe(() => {
      if (this.remainingSeconds > 0) {
        this.remainingSeconds--;
      } else {
        this.autoSubmitExam();
      }
    });
  }

  get formattedTime(): string {
    const h = Math.floor(this.remainingSeconds / 3600);
    const m = Math.floor((this.remainingSeconds % 3600) / 60);
    const s = this.remainingSeconds % 60;
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  }

  /** ✅ Auto Save Progress */
  startAutoSave(): void {
    this.autosaveSubscription = interval(60000).subscribe(() => this.saveProgress());
  }

  saveProgress(): void {
    const data = {
      examId: this.examId,
      answers: this.answers,
      remainingSeconds: this.remainingSeconds,
      currentQuestionIndex: this.currentQuestionIndex
    };
    localStorage.setItem(`exam-progress-${this.examId}`, JSON.stringify(data));
  }

  restoreProgress(): void {
    const saved = localStorage.getItem(`exam-progress-${this.examId}`);
    if (!saved) return;
    try {
      const data = JSON.parse(saved);
      if (data.examId === this.examId) {
        this.answers = data.answers || {};
        this.remainingSeconds = data.remainingSeconds || this.remainingSeconds;
        this.currentQuestionIndex = data.currentQuestionIndex || 0;
      }
    } catch (err) {
      console.warn('⚠️ Could not restore progress');
    }
  }

  /** ✅ Update Answers */
  updateAnswer(questionId: number, event: Event): void {
    const input = event.target as HTMLTextAreaElement;
    const text = input.value;
    if (!this.answers[questionId]) this.answers[questionId] = { textAnswer: '', filePath: null };
    this.answers[questionId].textAnswer = text;
    this.saveProgress();
  }

  /** ✅ File Upload (temporary store) */
  uploadFile(event: any, questionId: number): void {
    const file = event.target.files[0];
    if (file) {
      if (!this.answers[questionId]) this.answers[questionId] = { textAnswer: '', filePath: null };
      this.answers[questionId].filePath = file.name;
      this.saveProgress();
    }
  }

  /** ✅ File Helpers */
  getFileName(path?: string | null): string {
    if (!path) return '';
    return path.split(/[\\/]/).pop() || '';
  }

  getFileUrl(path?: string | null): string {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `http://localhost:8082/uploads/${path}`;
  }

  /** ✅ Navigation */
  nextQuestion(): void {
    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.currentQuestionIndex++;
      this.saveProgress();
    }
  }

  previousQuestion(): void {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
      this.saveProgress();
    }
  }

  /** ✅ Submit Exam */
  submitExam(): void {
    if (this.submitted) return;

    const confirmSubmit = confirm('Are you sure you want to submit your exam?');
    if (!confirmSubmit) return;

    const payload = {
      studentId: 1, // 🔧 Replace later with AuthService user ID
      examId: this.examId,
      answers: this.questions.map(q => ({
        textAnswer: this.answers[q.id]?.textAnswer || '',
        filePath: this.answers[q.id]?.filePath || null,
        question: { id: q.id }
      }))
    };

    this.teacherService.saveSubmission(payload).subscribe({
      next: (res) => {
        console.log('✅ Submission:', res);
        this.submitted = true;
        this.stopAll();
        localStorage.removeItem(`exam-progress-${this.examId}`);
        alert('✅ Exam submitted successfully!');
        this.router.navigate(['/student-dashboard']);
      },
      error: (err) => {
        console.error('❌ Submission failed:', err);
        alert('Failed to submit exam. Please try again.');
      }
    });
  }

  /** ⏰ Auto Submit */
  autoSubmitExam(): void {
    if (this.submitted) return;
    this.submitted = true;

    const payload = {
      studentId: 1,
      examId: this.examId,
      answers: this.questions.map(q => ({
        textAnswer: this.answers[q.id]?.textAnswer || '',
        filePath: this.answers[q.id]?.filePath || null,
        question: { id: q.id }
      }))
    };

    this.teacherService.saveSubmission(payload).subscribe({
      next: () => {
        this.stopAll();
        localStorage.removeItem(`exam-progress-${this.examId}`);
        alert('⏰ Time’s up! Exam auto-submitted.');
        this.router.navigate(['/student-dashboard']);
      },
      error: (err) => {
        console.error('❌ Auto-submit failed:', err);
        alert('Auto-submit failed. Please contact support.');
      }
    });
  }

  /** 🚫 Screenshot Warning (non-blocking) */
  @HostListener('document:keydown', ['$event'])
  detectScreenshot(event: KeyboardEvent): void {
    if (event.key === 'PrintScreen' && !this.screenshotWarned) {
      this.screenshotWarned = true;
      event.preventDefault();
      alert('⚠️ Screenshot detected! Please avoid taking screenshots during the exam.');
    }
  }

  /** ✅ Cleanup */
  stopAll(): void {
    this.timerSubscription?.unsubscribe();
    this.autosaveSubscription?.unsubscribe();
  }
}
