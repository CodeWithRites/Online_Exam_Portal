import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './sign-in.html',
  styleUrls: ['./sign-in.css']
})
export class SignInComponent implements OnInit {
  selectedRole: string | null = null;
  signInForm: any;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    public router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.selectedRole = this.route.snapshot.paramMap.get('role');

    this.signInForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  /** ✅ Handle login */
  onLogin(): void {
    if (this.signInForm.invalid) {
      alert('⚠️ Please fill all required fields.');
      return;
    }

    this.loading = true;

    const payload = {
      username: this.signInForm.get('username')?.value,
      password: this.signInForm.get('password')?.value
    };

    this.authService.login(payload).subscribe({
      next: (res: any) => {
        // Response should contain token, username, and role
        this.authService.saveToken(res.token);

        const role = this.authService.getUserRole()?.toUpperCase() || '';
        alert(`✅ Welcome back, ${role}!`);

        // Role-based redirection
        if (role === 'ADMIN') {
          this.router.navigate(['/admin-dashboard']);
        } else if (role === 'TEACHER') {
          this.router.navigate(['/teacher-dashboard']);
        } else if (role === 'STUDENT') {
          this.router.navigate(['/student-dashboard']);
        } else {
          alert('⚠️ Unknown role detected, redirecting to home.');
          this.router.navigate(['/']);
        }

        this.loading = false;
      },
      error: (err) => {
        console.error('❌ Login failed:', err);
        alert('❌ Invalid credentials. Please try again.');
        this.loading = false;
      }
    });
  }

  /** ✅ Navigate to signup page */
  goToSignUp() {
    this.router.navigate([`/sign-up/${this.selectedRole || 'student'}`]);
  }
}
