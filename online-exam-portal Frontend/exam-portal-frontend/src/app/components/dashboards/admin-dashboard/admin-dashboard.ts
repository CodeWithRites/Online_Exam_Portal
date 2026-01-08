import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { NavbarComponent } from '../../navbar/navbar';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css']
})
export class AdminDashboardComponent {
  constructor(private router: Router) {}

  goToManagePyq() {
    this.router.navigate(['/admin/manage-pyq']);
  }

  goToUploadPyq() {
    this.router.navigate(['/admin/upload-pyq']);
  }
}
