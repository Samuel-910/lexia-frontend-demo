import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { FormInputComponent } from '../../shared/components/forms/form-input/form-input.component';
import { AlertService } from '../../core/services/alert.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule, FormInputComponent],
  templateUrl: './forgot-password.component.html'
})
export class ForgotPasswordComponent {
  email = '';
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private alertService: AlertService
  ) {}

  onSubmit() {
    this.loading = true;
    this.alertService.loading('Enviando...', 'Espera un momento por favor.');
    
    this.authService.forgotPassword(this.email).subscribe({
      next: (res) => {
        this.loading = false;
        this.alertService.success('¡Correo enviado!', 'Revisa tu bandeja de entrada o la terminal del servidor para continuar.').then(() => {
            this.router.navigate(['/login']);
        });
      },
      error: (err) => {
        this.loading = false;
        this.alertService.error('Error', 'No se pudo enviar el correo o el usuario no existe.');
      }
    });
  }
}
