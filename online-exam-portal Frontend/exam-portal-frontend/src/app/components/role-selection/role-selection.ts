import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-role-selection',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './role-selection.html',
  styleUrls: ['./role-selection.css']
})
export class RoleSelectionComponent {}
