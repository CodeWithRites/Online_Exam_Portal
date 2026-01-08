import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TeacherService } from '../../../services/teacher.service';

@Component({
  selector: 'app-create-quiz',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-quiz.html',
  styleUrls: ['./create-quiz.css']
})
export class CreateQuizComponent {
  quiz = {
    subject: '',
    title: '',
    durationMinutes: 0,
    questions: [] as any[]
  };

  serverMessage = '';

  constructor(private teacher: TeacherService, private router: Router) {}

  addQuestion() {
    this.quiz.questions.push({
      text: '',
      options: [
        { text: '', correct: false },
        { text: '', correct: false }
      ],
      marks: 1
    });
  }

  removeQuestion(index: number) {
    this.quiz.questions.splice(index, 1);
  }

  addOption(questionIndex: number) {
    this.quiz.questions[questionIndex].options.push({ text: '', correct: false });
  }

  removeOption(questionIndex: number, optionIndex: number) {
    this.quiz.questions[questionIndex].options.splice(optionIndex, 1);
  }

  setCorrectOption(questionIndex: number, optionIndex: number) {
    const question = this.quiz.questions[questionIndex];
    question.options.forEach((opt: any, i: number) => (opt.correct = i === optionIndex));
  }

  confirmQuestion(index: number) {
    const q = this.quiz.questions[index];
    if (!q.text.trim()) {
      this.serverMessage = '⚠️ Please enter question text before confirming.';
      return;
    }
    if (q.options.length < 2) {
      this.serverMessage = '⚠️ Add at least two options.';
      return;
    }
    if (!q.options.some((opt: any) => opt.correct)) {
      this.serverMessage = '⚠️ Please mark one option as correct.';
      return;
    }
    this.serverMessage = `✅ Question ${index + 1} confirmed!`;
  }

  createQuiz() {
    if (!this.quiz.title.trim()) {
      this.serverMessage = '⚠️ Quiz title is required.';
      return;
    }
    if (this.quiz.questions.length === 0) {
      this.serverMessage = '⚠️ Please add at least one question.';
      return;
    }

    const formattedQuiz = {
      title: this.quiz.title,
      description: this.quiz.subject,
      durationMinutes: this.quiz.durationMinutes || 10,
      questions: this.quiz.questions.map((q) => ({
        questionText: q.text,
        marks: q.marks,
        options: q.options.map((opt: any) => ({
          text: opt.text,
          correct: opt.correct
        }))
      }))
    };

    console.log('📤 Sending Quiz Payload:', JSON.stringify(formattedQuiz, null, 2));

    this.teacher.createQuiz(formattedQuiz).subscribe({
      next: (res: any) => {
        console.log('✅ Backend Response:', res);
        this.serverMessage = res.message || '✅ Quiz created successfully!';
        setTimeout(() => this.router.navigate(['/teacher/manage-exams']), 1500);
      },
      error: (err) => {
        console.error('❌ Backend error:', err);
        this.serverMessage = '❌ Failed to create quiz.';
      }
    });
  }

  backToDashboard() {
    this.router.navigate(['/teacher-dashboard']);
  }
}
