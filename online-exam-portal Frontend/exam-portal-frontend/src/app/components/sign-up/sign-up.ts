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
  selector: 'app-sign-up',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule,
    MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule
  ],
  templateUrl: './sign-up.html',
  styleUrls: ['./sign-up.css']
})
export class SignUpComponent implements OnInit {
  selectedRole: string | null = null;
  signUpForm: any;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    public router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.selectedRole = this.route.snapshot.paramMap.get('role');

    this.signUpForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      universityId: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.signUpForm.invalid) {
      alert('⚠️ Please fill all required fields.');
      return;
    }

    const email = this.signUpForm.get('email')?.value!;
    if (!this.validateEmailDomain(email)) return;

    const payload = {
      username: this.signUpForm.get('username')?.value,
      email,
      password: this.signUpForm.get('password')?.value,
      universityId: this.signUpForm.get('universityId')?.value,
      role: { name: `ROLE_${this.selectedRole?.toUpperCase()}` }
    };

    this.authService.register(payload).subscribe({
      next: () => {
        alert('✅ Registration successful!');
        this.router.navigate([`/sign-in/${this.selectedRole}`]);
      },
      error: (err) => {
        console.error(err);
        alert('❌ Registration failed. Try again.');
      }
    });
  }

  private validateEmailDomain(email: string): boolean {
    const valid =
      (this.selectedRole === 'teacher' && email.endsWith('@faculty.com')) ||
      (this.selectedRole === 'student' && email.endsWith('@student.com')) ||
      (this.selectedRole === 'admin' && email.endsWith('@admin.com'));

    if (!valid) alert(`Please use a valid ${this.selectedRole} email.`);
    return valid;
  }
}
