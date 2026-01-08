import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TeacherService } from '../../../services/teacher.service';
import html2pdf from 'html2pdf.js';

@Component({
  selector: 'app-view-exam',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './view-exam.html',
  styleUrls: ['./view-exam.css']
})
export class ViewExamComponent implements OnInit {
  @ViewChild('pdfContent', { static: false }) pdfContent!: ElementRef;

  exam: any;
  loading = true;
  error = '';

  // ✅ Categorized question groups
  longQuestions: any[] = [];
  shortQuestions: any[] = [];
  otherQuestions: any[] = [];

  // ✅ Marks summary
  totalLongMarks = 0;
  totalShortMarks = 0;
  totalOtherMarks = 0;
  totalMarks = 0;

  constructor(
    private route: ActivatedRoute,
    private teacher: TeacherService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.teacher.getExamById(+id).subscribe({
        next: (data) => {
          this.exam = data;
          this.groupQuestions();
          this.calculateTotals();
          this.loading = false;
        },
        error: (err) => {
          console.error('❌ Failed to load exam:', err);
          this.error = 'Failed to load exam details.';
          this.loading = false;
        }
      });
    }
  }

  /** 🧩 Group questions into Long / Short / Other types */
  groupQuestions(): void {
    if (!this.exam?.questions) return;

    const all = this.exam.questions;

    this.longQuestions = all.filter(
      (q: any) => q.type?.trim()?.toLowerCase() === 'long'
    );
    this.shortQuestions = all.filter(
      (q: any) => q.type?.trim()?.toLowerCase() === 'short'
    );

    // ✅ Anything else (or null type) goes into "Other"
    this.otherQuestions = all.filter(
      (q: any) =>
        !['long', 'short'].includes(q.type?.trim()?.toLowerCase() || '')
    );
  }

  /** 🧮 Calculate total marks */
  calculateTotals(): void {
    const sum = (arr: any[]) => arr.reduce((s, q) => s + (q.marks || 0), 0);

    this.totalLongMarks = sum(this.longQuestions);
    this.totalShortMarks = sum(this.shortQuestions);
    this.totalOtherMarks = sum(this.otherQuestions);

    this.totalMarks =
      this.totalLongMarks + this.totalShortMarks + this.totalOtherMarks;
  }

  /** 📄 Export exam to PDF */
  downloadPDF(): void {
    const element = this.pdfContent.nativeElement;
    const options: any = {
      margin: 10,
      filename: `${this.exam.title.replace(/\s+/g, '_')}_exam.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    (html2pdf() as any).from(element).set(options).save();
  }

  /** ↩️ Back to Manage Exams */
  backToManage(): void {
    this.router.navigate(['/teacher/manage-exams']);
  }
}
