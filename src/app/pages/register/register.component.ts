import { Component, AfterViewInit, NgZone } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { FormInputComponent } from '../../shared/components/forms/form-input/form-input.component';
import { AlertService } from '../../core/services/alert.service';

declare var google: any;

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule, FormInputComponent],
  templateUrl: './register.component.html'
})
export class RegisterComponent implements AfterViewInit {
  name = '';
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
        document.getElementById("google-btn-register"),
        { theme: "outline", size: "large", width: "100%", text: "signup_with" }
      );
    }
  }

  handleGoogleResponse(response: any) {
    this.ngZone.run(() => {
      this.authService.loginWithGoogle(response.credential).subscribe({
        next: (res) => {
          this.authService.saveToken(res.token);
          this.alertService.toast('¡Registro con Google exitoso!', 'success');
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.alertService.error('Error', 'No se pudo registrar con Google');
        }
      });
    });
  }

  onSubmit() {
    this.authService.register({ name: this.name, email: this.email, password: this.password }).subscribe({
      next: (res) => {
        this.alertService.success('Registro Exitoso', 'Tu cuenta ha sido creada. Ahora puedes iniciar sesión.').then(() => {
           this.router.navigate(['/login']);
        });
      },
      error: (err) => {
        this.alertService.error('Error', 'No se pudo registrar la cuenta. Es posible que el correo ya exista.');
      }
    });
  }
}
