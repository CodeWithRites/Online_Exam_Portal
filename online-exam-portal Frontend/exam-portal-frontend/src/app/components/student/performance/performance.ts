import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TeacherService } from '../../../services/teacher.service';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-performance',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './performance.html',
  styleUrls: ['./performance.css']
})
export class PerformanceComponent implements OnInit, OnDestroy {
  performances: any[] = [];
  loading = true;
  error = '';
  autoRefreshSub?: Subscription;
  lastUpdated: Date = new Date();
  examId?: number; // 👈 to store route param

  constructor(
    private teacherService: TeacherService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.examId = Number(this.route.snapshot.paramMap.get('examId')) || undefined;
    this.loadPerformance();
    this.autoRefreshSub = interval(10000).subscribe(() => this.loadPerformance(false));
  }

  ngOnDestroy(): void {
    this.autoRefreshSub?.unsubscribe();
  }

  /** ✅ Load performance data */
  loadPerformance(showLoading: boolean = true): void {
    if (showLoading) this.loading = true;

    this.teacherService.getStudentPerformance().subscribe(
      (res: any) => {
        console.log('✅ Performance data received:', res);

        const data = Array.isArray(res) ? res : [];
        // 👇 Filter if examId is passed
        this.performances = this.examId
          ? data.filter((p) => p.examTitle && p.examTitle.toLowerCase().includes(this.findExamTitle().toLowerCase()))
          : data;

        this.loading = false;
        this.lastUpdated = new Date();
      },
      (err) => {
        console.error('❌ Failed to load performance:', err);
        this.error = 'Unable to load performance records.';
        this.loading = false;
      }
    );
  }

  /** Helper: Get exam title from query param or fallback (for matching) */
  private findExamTitle(): string {
    // This can later be extended if you want to match by examId instead of title
    return ''; // Currently we filter by title only
  }

  /** 🏠 Navigate to Student Dashboard */
  goToDashboard(): void {
    this.router.navigate(['/student-dashboard']);
  }

  /** ✅ Status Helpers */
  getStatus(perf: any): string {
    if (perf.evaluated || perf.status === 'Evaluated') return 'Evaluated';
    if (perf.marksObtained && perf.marksObtained > 0) return 'Evaluated';
    return 'Pending';
  }

  getStatusClass(perf: any): string {
    return this.getStatus(perf) === 'Evaluated' ? 'evaluated' : 'pending';
  }
}
