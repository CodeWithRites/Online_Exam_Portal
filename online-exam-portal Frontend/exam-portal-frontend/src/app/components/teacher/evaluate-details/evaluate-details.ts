import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TeacherService } from '../../../services/teacher.service';

@Component({
  selector: 'app-evaluate-details',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './evaluate-details.html',
  styleUrls: ['./evaluate-details.css']
})
export class EvaluateDetailsComponent implements OnInit {
  submission: any = null;
  loading = true;
  marksMap: { [answerId: number]: number } = {};
  comment = '';
  error = '';

  constructor(private route: ActivatedRoute, private router: Router, private teacherService: TeacherService) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.error = 'Invalid submission ID';
      this.loading = false;
      return;
    }
    this.loadSubmission(id);
  }

  loadSubmission(id: number) {
    this.loading = true;
    this.teacherService.getSubmissionById(id).subscribe({
      next: (res: any) => {
        this.submission = res?.data || res;
        // prefill marksMap if answer objects have marks_awarded
        (this.submission?.answers || []).forEach((a: any) => {
          this.marksMap[a.id] = a.marksAwarded ?? a.marks_awarded ?? 0;
        });
        this.comment = this.submission?.teacherComments || '';
        this.loading = false;
      },
      error: (err) => {
        console.error('Load submission error', err);
        this.error = 'Failed to load submission';
        this.loading = false;
      }
    });
  }

  fileUrl(path: string) {
    // If backend serves files at full URL, return path directly
    return path;
  }

  submitEvaluation() {
    if (!this.submission || !this.submission.id) return;
    const payload = {
      marksAwarded: this.marksMap,
      comment: this.comment
    };
    this.teacherService.evaluateSubmission(this.submission.id, payload).subscribe({
      next: (res) => {
        alert('Evaluation submitted');
        this.router.navigate(['/teacher/evaluate']);
      },
      error: (err) => {
        console.error('Evaluation error', err);
        alert('Failed to submit evaluation');
      }
    });
  }
}
