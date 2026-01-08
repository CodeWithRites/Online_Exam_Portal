import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { QuizService } from '../../../services/quiz';

@Component({
  selector: 'app-view-quiz',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './view-quiz.html',
  styleUrls: ['./view-quiz.css']
})
export class ViewQuizComponent implements OnInit {
  quizId!: number;
  quiz: any = null;
  loading = true;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private quizService: QuizService
  ) {}

  ngOnInit(): void {
    this.quizId = Number(this.route.snapshot.paramMap.get('id'));
    this.fetchQuiz();
  }

  /** 🧠 Fetch quiz details from backend */
  fetchQuiz(): void {
    this.loading = true;
    this.quizService.getQuizById(this.quizId).subscribe({
      next: (res: any) => {
        if (res && res.success && res.data) {
          this.quiz = res.data;
        } else if (res && res.id) {
          this.quiz = res;
        } else {
          this.errorMessage = 'Quiz not found.';
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ Error loading quiz:', err);
        this.errorMessage = 'Failed to load quiz details.';
        this.loading = false;
      }
    });
  }

  /** 🔙 Navigate back to manage page */
  goBack(): void {
    this.router.navigate(['/teacher/manage-exams']);
  }
}
