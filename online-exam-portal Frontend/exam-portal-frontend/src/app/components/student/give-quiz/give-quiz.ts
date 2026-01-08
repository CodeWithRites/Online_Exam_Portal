import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NavbarComponent } from '../../navbar/navbar';
import { QuizService } from '../../../services/quiz';
import { interval, Subscription } from 'rxjs';

interface QuizAnswer {
  questionText: string;
  selectedOption: string | null;
  correctOption: string | null;
  isCorrect: boolean;
}

@Component({
  selector: 'app-give-quiz',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  templateUrl: './give-quiz.html',
  styleUrls: ['./give-quiz.css']
})
export class GiveQuizComponent implements OnInit, OnDestroy {
  quizzes: any[] = [];
  selectedQuiz: any = null;
  currentQuestionIndex = 0;
  answers: Record<number, any> = {};
  submitting = false;
  quizCompleted = false;
  showResults = false;
  resultSummary: QuizAnswer[] = [];

  remainingTime = 0;
  timerSub?: Subscription;

  constructor(private quizService: QuizService, private router: Router) {}

  ngOnInit(): void {
    this.loadQuizzes();
  }

  ngOnDestroy(): void {
    this.timerSub?.unsubscribe();
  }

  /** ✅ Load quizzes for students */
  loadQuizzes(): void {
    this.quizService.getPublicQuizzes().subscribe({
      next: (res: any) => {
        console.log('✅ Quizzes loaded:', res);
        this.quizzes = res?.data || [];
      },
      error: (err: any) => {
        console.error('❌ Failed to load quizzes:', err);
        alert('❌ Failed to load quizzes.');
      }
    });
  }

  /** ✅ Start a quiz */
  startQuiz(quiz: any): void {
    if (!quiz?.questions?.length) {
      alert('This quiz has no questions.');
      return;
    }
    this.selectedQuiz = quiz;
    this.currentQuestionIndex = 0;
    this.answers = {};
    this.quizCompleted = false;
    this.showResults = false;

    this.remainingTime = (quiz.durationMinutes || 1) * 60;
    this.startTimer();
  }

  /** ⏱ Timer logic */
  startTimer(): void {
    this.timerSub?.unsubscribe();
    this.timerSub = interval(1000).subscribe(() => {
      if (this.remainingTime > 0) {
        this.remainingTime--;
      } else {
        this.timerSub?.unsubscribe();
        alert('⏰ Time’s up! Submitting automatically.');
        this.submitQuiz();
      }
    });
  }

  selectAnswer(qId: number, option: any): void {
    this.answers[qId] = option;
  }

  nextQuestion(): void {
    if (this.currentQuestionIndex < this.selectedQuiz.questions.length - 1) {
      this.currentQuestionIndex++;
    }
  }

  prevQuestion(): void {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
    }
  }

  /** 🧾 Submit Quiz */
  submitQuiz(): void {
    if (!this.selectedQuiz || !this.selectedQuiz.questions?.length) {
      alert('⚠️ No quiz loaded.');
      return;
    }

    this.submitting = true;
    this.timerSub?.unsubscribe();

    const quizAnswers: QuizAnswer[] = this.selectedQuiz.questions.map((q: any) => {
      const selected = this.answers[q.id];
      const correct = q.options.find((o: any) => o.correct);
      return {
        questionText: q.questionText,
        selectedOption: selected ? selected.text : null,
        correctOption: correct ? correct.text : null,
        isCorrect: selected && correct && selected.text === correct.text
      };
    });

    const correctCount = quizAnswers.filter((a: QuizAnswer) => a.isCorrect).length;
    const totalQuestions = this.selectedQuiz.questions.length;

    this.resultSummary = quizAnswers;
    this.showResults = true;
    this.quizCompleted = true;
    this.submitting = false;

    alert(`✅ You scored ${correctCount}/${totalQuestions}`);
  }

  /** ⬅ Go Back to Student Dashboard */
  goBack(): void {
    this.router.navigate(['/student-dashboard']);
  }

  /** 🕒 Format timer */
  formatTime(): string {
    const m = Math.floor(this.remainingTime / 60);
    const s = this.remainingTime % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  /** 📊 Progress bar percent */
  progressPercent(): number {
    return ((this.currentQuestionIndex + 1) / this.selectedQuiz.questions.length) * 100;
  }
}
