import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { DashboardService } from '../../services/dashboard.service';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styles: [`
    :host {
      display: flex;
      flex: 1;
      flex-direction: column;
      overflow: hidden;
    }
  `]
})
export class DashboardComponent implements OnInit {
  summary: any = null;
  loading = true;
  showLimitModal = false;
  currentDate = new Date().toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  constructor(
    private dashboardService: DashboardService,
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.dashboardService.getSummary().subscribe({
      next: (data) => {
        this.summary = data;
        const simulatedPlan = this.authService.getUserPlan();
        if (simulatedPlan !== 'Gratuito') {
          this.summary.planType = simulatedPlan.toLowerCase();
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching dashboard summary', err);
        this.loading = false;
      }
    });
  }

  handleCreateContract() {
    if (this.summary?.planType === 'free' && this.summary?.contractsUsed >= this.summary?.contractsLimit) {
      this.showLimitModal = true;
      return;
    }
    this.router.navigate(['/generar']);
  }

  closeModal() {
    this.showLimitModal = false;
  }
}
