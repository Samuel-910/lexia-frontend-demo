import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { AlertService } from '../../core/services/alert.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html',
  styles: [`
    :host {
      display: flex;
      flex: 1;
      flex-direction: column;
      overflow: hidden;
    }
  `]
})
export class SettingsComponent implements OnInit {
  user: any = null;
  activeTab: string = 'perfil';
  nameInput: string = '';

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private alertService: AlertService
  ) {}

  ngOnInit() {
    this.user = this.authService.getUserFromToken();
    if (this.user) {
      this.user.plan = this.authService.getUserPlan();
    }
    this.nameInput = this.user?.name || '';
  }

  saveProfile() {
    this.userService.updateProfile(this.nameInput).subscribe({
      next: () => {
        this.alertService.toast('Perfil actualizado', 'success');
      },
      error: () => {
        this.alertService.error('Error', 'No se pudo actualizar el perfil');
      }
    });
  }

  handleUpgradeClick(plan: string, price: number) {
    this.alertService.info('Procesando Pago', `Iniciando pasarela segura (Culqi/Stripe) para el Plan ${plan}...`);
    
    // Simulate network delay for payment processing
    setTimeout(() => {
      this.authService.setUserPlan(plan);
      if (this.user) this.user.plan = plan;
      this.alertService.success('¡Pago Exitoso!', `Bienvenido al Plan ${plan}. Se ha cobrado S/ ${price}.`);
    }, 2500);
  }
}
