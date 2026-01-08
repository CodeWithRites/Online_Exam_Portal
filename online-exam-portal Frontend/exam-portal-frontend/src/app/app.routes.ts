import { Routes } from '@angular/router';

// ---------------- DASHBOARDS ----------------
import { TeacherDashboardComponent } from './components/dashboards/teacher-dashboard/teacher-dashboard';
import { StudentDashboardComponent } from './components/dashboards/student-dashboard/student-dashboard';
import { AdminDashboardComponent } from './components/dashboards/admin-dashboard/admin-dashboard';

// ---------------- TEACHER PAGES ----------------
import { EvaluationComponent } from './components/teacher/evaluation/evaluation';
import { EvaluateSubmissionComponent } from './components/teacher/evaluate-submission/evaluate-submission';
import { ManageExamsComponent } from './components/teacher/manage-exams/manage-exams';
import { CreateExamComponent } from './components/teacher/create-exam/create-exam';
import { CreateQuizComponent } from './components/teacher/create-quiz/create-quiz';
import { ViewQuizComponent } from './components/teacher/view-quiz/view-quiz';
import { ViewExamComponent } from './components/teacher/view-exam/view-exam';
import { ViewStudentMarksComponent } from './components/teacher/view-students-marks/view-students-marks';

// ---------------- STUDENT PAGES ----------------
import { GiveExamComponent } from './components/student/give-exam/give-exam';
import { StartExamComponent } from './components/student/start-exam/start-exam';
import { GiveQuizComponent } from './components/student/give-quiz/give-quiz';
import { PerformanceComponent } from './components/student/performance/performance';
import { ViewPyqComponent } from './components/student/view-pyq/view-pyq';

// ---------------- ADMIN PAGES ----------------
import { ManagePyqComponent } from './components/admin/manage-pyq/manage-pyq';
import { UploadPyqComponent } from './components/admin/upload-pyq/upload-pyq';

// ---------------- AUTH PAGES ----------------
import { SignInComponent } from './components/sign-in/sign-in';
import { SignUpComponent } from './components/sign-up/sign-up';
import { RoleSelectionComponent } from './components/role-selection/role-selection';

// ---------------- GUARDS ----------------
import { AuthGuard } from './guards/auth-guard';

export const routes: Routes = [
  { path: '', component: RoleSelectionComponent },

  // ---------------- AUTH ----------------
  { path: 'sign-in/:role', component: SignInComponent },
  { path: 'sign-up/:role', component: SignUpComponent },

  // ---------------- STUDENT ROUTES ----------------
  { path: 'student-dashboard', component: StudentDashboardComponent, canActivate: [AuthGuard], data: { role: 'STUDENT' } },
  { path: 'student/give-exam', component: GiveExamComponent, canActivate: [AuthGuard], data: { role: 'STUDENT' } },
  { path: 'student/start-exam/:id', component: StartExamComponent, canActivate: [AuthGuard], data: { role: 'STUDENT' } },
  { path: 'student/give-quiz', component: GiveQuizComponent, canActivate: [AuthGuard], data: { role: 'STUDENT' } },
  { path: 'student/view-pyq', component: ViewPyqComponent, canActivate: [AuthGuard], data: { role: 'STUDENT' } },
  { path: 'student/performance', component: PerformanceComponent, canActivate: [AuthGuard], data: { role: 'STUDENT' } },
  { path: 'student/performance/:examId', component: PerformanceComponent, canActivate: [AuthGuard], data: { role: 'STUDENT' } },

  // ---------------- TEACHER ROUTES ----------------
  { path: 'teacher-dashboard', component: TeacherDashboardComponent, canActivate: [AuthGuard], data: { role: 'TEACHER' } },
  { path: 'teacher/create-exam', component: CreateExamComponent, canActivate: [AuthGuard], data: { role: 'TEACHER' } },
  { path: 'teacher/manage-exams', component: ManageExamsComponent, canActivate: [AuthGuard], data: { role: 'TEACHER' } },
  { path: 'teacher/view-exam/:id', component: ViewExamComponent, canActivate: [AuthGuard], data: { role: 'TEACHER' } },
  { path: 'teacher/create-quiz', component: CreateQuizComponent, canActivate: [AuthGuard], data: { role: 'TEACHER' } },
  { path: 'teacher/view-quiz/:id', component: ViewQuizComponent, canActivate: [AuthGuard], data: { role: 'TEACHER' } },
  { path: 'teacher/evaluate', component: EvaluationComponent, canActivate: [AuthGuard], data: { role: 'TEACHER' } },
  { path: 'teacher/evaluate/:id', component: EvaluateSubmissionComponent, canActivate: [AuthGuard], data: { role: 'TEACHER' } },
  { path: 'teacher/view-student-marks', component: ViewStudentMarksComponent, canActivate: [AuthGuard], data: { role: 'TEACHER' } },

  // ---------------- ADMIN ROUTES ----------------
  { path: 'admin-dashboard', component: AdminDashboardComponent, canActivate: [AuthGuard], data: { role: 'ADMIN' } },
  { path: 'admin/manage-pyq', component: ManagePyqComponent, canActivate: [AuthGuard], data: { role: 'ADMIN' } },
  { path: 'admin/upload-pyq', component: UploadPyqComponent, canActivate: [AuthGuard], data: { role: 'ADMIN' } },

  // ---------------- FALLBACK ----------------
  { path: '**', redirectTo: '' }
];
