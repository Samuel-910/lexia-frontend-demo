import { Component, AfterViewInit, NgZone } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { FormInputComponent } from '../../shared/components/forms/form-input/form-input.component';
import { AlertService } from '../../core/services/alert.service';

declare var google: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule, FormInputComponent],
  templateUrl: './login.component.html'
})
export class LoginComponent implements AfterViewInit {
  email = '';
  password = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private alertService: AlertService,
    private ngZone: NgZone
  ) {}

  ngAfterViewInit() {
    if (typeof google !== 'undefined') {
      google.accounts.id.initialize({
        client_id: '399080242195-t1a6co9rsj4nvl465vlblsvfi2lt0554.apps.googleusercontent.com',
        callback: this.handleGoogleResponse.bind(this)
      });
      google.accounts.id.renderButton(
        document.getElementById("google-btn"),
        { theme: "outline", size: "large", width: "100%" }
      );
    }
  }

  handleGoogleResponse(response: any) {
    this.ngZone.run(() => {
      this.authService.loginWithGoogle(response.credential).subscribe({
        next: (res) => {
          this.authService.saveToken(res.token);
          this.alertService.toast('¡Inicio de sesión con Google exitoso!', 'success');
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          console.error("Google Login Error: ", err);
          const errorMsg = typeof err.error === 'string' ? err.error : 'No se pudo iniciar sesión con Google';
          this.alertService.error('Error', errorMsg);
        }
      });
    });
  }

  onSubmit() {
    this.executeLogin(this.email, this.password);
  }

  loginAsAdmin() {
    this.executeLogin('admin@lexia.com', 'password123');
  }

  loginAsUser() {
    this.executeLogin('user@lexia.com', 'password123');
  }

  private executeLogin(email: string, pass: string) {
    this.authService.login({ email: email, password: pass }).subscribe({
      next: (res) => {
        this.authService.saveToken(res.token);
        this.alertService.toast('¡Inicio de sesión exitoso!', 'success');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.alertService.error('Error de autenticación', 'Correo o contraseña incorrectos');
      }
    });
  }
}
