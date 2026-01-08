import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TeacherService } from '../../../services/teacher.service';

@Component({
  selector: 'app-create-exam',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-exam.html',
  styleUrls: ['./create-exam.css']
})
export class CreateExamComponent {
  form: FormGroup;
  submitting = false;
  serverMessage = '';

  get questions(): FormArray {
    return this.form.get('questions') as FormArray;
  }

  constructor(
    private fb: FormBuilder,
    private teacher: TeacherService,
    private router: Router
  ) {
    this.form = this.fb.group({
      subject: ['', [Validators.required]],
      title: ['', [Validators.required]],
      durationMinutes: [60, [Validators.required, Validators.min(1)]],
      description: [''],
      questions: this.fb.array([this.createQuestionGroup()])
    });
  }

  createQuestionGroup(): FormGroup {
    return this.fb.group({
      type: ['Long', Validators.required],
      marks: [5, [Validators.required, Validators.min(1)]],
      text: ['', Validators.required],
      confirmed: [false]
    });
  }

  addQuestion() {
    const unconfirmed = this.questions.controls.find(q => !q.get('confirmed')?.value);
    if (unconfirmed) {
      alert('⚠️ Please confirm the current question before adding a new one.');
      return;
    }
    this.questions.push(this.createQuestionGroup());
  }

  confirmQuestion(index: number) {
    const question = this.questions.at(index);
    if (question.valid) {
      question.get('confirmed')?.setValue(true);
      question.disable();
    } else {
      alert('⚠️ Please fill all fields before confirming the question.');
    }
  }

  editQuestion(index: number) {
    const question = this.questions.at(index);
    question.enable();
    question.get('confirmed')?.setValue(false);
  }

  removeQuestion(index: number) {
    if (confirm('Are you sure you want to delete this question?')) {
      this.questions.removeAt(index);
    }
  }

  submit() {
    if (this.form.invalid || this.questions.length === 0) {
      alert('⚠️ Please complete all required fields before submitting.');
      return;
    }

    this.submitting = true;
    this.serverMessage = '';

    const payload = {
      subject: this.form.value.subject,
      title: this.form.value.title,
      durationMinutes: this.form.value.durationMinutes,
      description: this.form.value.description,
      questions: this.questions.getRawValue().map((q: any) => ({
        type: q.type,
        marks: q.marks,
        text: q.text
      }))
    };

    this.teacher.createExam(payload).subscribe({
      next: (res) => {
        console.log('✅ Response from backend:', res);
        this.serverMessage = res.message || '✅ Exam created successfully!';
        this.submitting = false;
        setTimeout(() => this.router.navigate(['/teacher/manage-exams']), 1200);
      },
      error: (err) => {
        console.error('❌ Backend error:', err);
        this.serverMessage = '❌ Failed to create exam.';
        this.submitting = false;
      }
    });
  }

  backToDashboard() {
    this.router.navigate(['/teacher-dashboard']);
  }
}
