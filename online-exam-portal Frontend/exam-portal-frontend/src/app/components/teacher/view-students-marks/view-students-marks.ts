import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TeacherService } from '../../../services/teacher.service';

@Component({
  selector: 'app-view-student-marks',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './view-students-marks.html',
  styleUrls: ['./view-students-marks.css']
})
export class ViewStudentMarksComponent implements OnInit {
  marksList: any[] = [];
  loading = true;
  error = '';

  constructor(private teacherService: TeacherService, private router: Router) {}

  ngOnInit(): void {
    this.loadMarks();
  }

  /** 🧾 Load Student Marks */
  loadMarks(): void {
    this.teacherService.getAllStudentMarks().subscribe({
      next: (res: any[]) => {
        this.marksList = (res || []).sort(
          (a, b) => (b.totalMarks || 0) - (a.totalMarks || 0)
        );
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ Failed to fetch student marks:', err);
        this.error = 'Failed to load student marks.';
        this.loading = false;
      }
    });
  }

  /** 📊 Get Evaluation Status */
  getStatus(status: string): string {
    return status?.toLowerCase() === 'evaluated' ? 'Evaluated' : 'Pending';
  }

  /** 🎨 Status Color Class */
  getStatusClass(status: string): string {
    return status?.toLowerCase() === 'evaluated' ? 'evaluated' : 'pending';
  }

  /** 🏠 Navigate to Teacher Dashboard */
  goToTeacherDashboard(): void {
    this.router.navigate(['/teacher-dashboard']);
  }
}
