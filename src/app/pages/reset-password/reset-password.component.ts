import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { FormInputComponent } from '../../shared/components/forms/form-input/form-input.component';
import { AlertService } from '../../core/services/alert.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule, FormInputComponent],
  templateUrl: './reset-password.component.html'
})
export class ResetPasswordComponent implements OnInit {
  token = '';
  newPassword = '';
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private alertService: AlertService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'] || '';
      if (!this.token) {
        this.alertService.error('Error', 'Token no proporcionado.').then(() => {
          this.router.navigate(['/login']);
        });
      }
    });
  }

  onSubmit() {
    if (!this.token || !this.newPassword) return;

    this.loading = true;
    this.authService.resetPassword(this.token, this.newPassword).subscribe({
      next: (res) => {
        this.loading = false;
        this.alertService.success('¡Contraseña actualizada!', 'Tu contraseña se ha restablecido correctamente.').then(() => {
            this.router.navigate(['/login']);
        });
      },
      error: (err) => {
        this.loading = false;
        this.alertService.error('Error', 'El token es inválido o ha expirado. Por favor, solicita uno nuevo.');
      }
    });
  }
}
