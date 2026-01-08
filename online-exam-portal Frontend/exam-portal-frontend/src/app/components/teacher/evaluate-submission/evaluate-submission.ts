import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TeacherService } from '../../../services/teacher.service';

@Component({
  selector: 'app-evaluate-submission',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './evaluate-submission.html',
  styleUrls: ['./evaluate-submission.css']
})
export class EvaluateSubmissionComponent implements OnInit {
  submission: any = null;
  loading = true;
  error = '';
  totalMarks = 0;
  maxMarks = 0;
  comment = '';

  constructor(
    private route: ActivatedRoute,
    private teacherService: TeacherService,
    public router: Router
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.error = 'Invalid submission ID';
      this.loading = false;
      return;
    }
    this.loadSubmission(id);
  }

  loadSubmission(id: number): void {
    this.loading = true;
    this.teacherService.getSubmissionById(id).subscribe({
      next: (res: any) => {
        this.submission = res;
        this.comment = res.teacherComments || '';
        if (!this.submission.answers) this.submission.answers = [];

        // Normalize answers
        this.submission.answers.forEach((a: any) => {
          a.marks = a.marks ?? 0;
          a.marksAwarded = a.marksAwarded ?? 0;
          a.textAnswer = a.textAnswer ?? '';
          a.filePath = a.filePath ? this.formatFilePath(a.filePath) : null;
        });

        this.calculateTotal();
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ Load submission error:', err);
        this.error = 'Failed to load submission.';
        this.loading = false;
      }
    });
  }

  // Fix file paths (ensure correct backend link)
  formatFilePath(path: string): string {
    if (path.startsWith('http') || path.startsWith('/assets')) {
      return path;
    }
    // ✅ Replace "localhost:4200" route with backend file API base
    return `http://localhost:8080/files/${encodeURIComponent(path)}`;
  }

  calculateTotal(): void {
    if (!this.submission?.answers) {
      this.totalMarks = 0;
      this.maxMarks = 0;
      return;
    }

    this.totalMarks = this.submission.answers
      .map((a: any) => Number(a.marksAwarded || 0))
      .reduce((sum: number, val: number) => sum + val, 0);

    this.maxMarks = this.submission.answers
      .map((a: any) => Number(a.marks || 0))
      .reduce((sum: number, val: number) => sum + val, 0);
  }

  submitEvaluation(): void {
    // ✅ Prevent invalid marking
    for (const ans of this.submission.answers) {
      if (Number(ans.marksAwarded) > Number(ans.marks)) {
        alert(`⚠️ Marks for "${ans.questionText}" exceed the maximum allowed (${ans.marks}).`);
        return;
      }
    }

    const marksMap: { [id: number]: number } = {};
    this.submission.answers.forEach((a: any) => {
      marksMap[a.id] = Number(a.marksAwarded || 0);
    });

    const payload = {
      marksAwarded: marksMap,
      comment: this.comment
    };

    this.teacherService.evaluateSubmission(this.submission.id, payload).subscribe({
      next: () => {
        alert('✅ Evaluation saved successfully!');
        this.router.navigate(['/teacher/evaluate']);
      },
      error: (err) => {
        console.error('❌ Evaluation error:', err);
        alert('Failed to save evaluation.');
      }
    });
  }

  deleteSubmission(): void {
    if (!confirm('Are you sure you want to delete this submission?')) return;
    this.teacherService.deleteSubmission(this.submission.id).subscribe({
      next: () => {
        alert('✅ Submission deleted successfully!');
        this.router.navigate(['/teacher/evaluate']);
      },
      error: (err) => {
        console.error('❌ Delete error:', err);
        alert('Failed to delete submission.');
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/teacher/evaluate']);
  }
}
