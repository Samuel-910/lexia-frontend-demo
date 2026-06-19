import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterOutlet, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { AlertService } from '../../core/services/alert.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './main-layout.component.html'
})
export class MainLayoutComponent implements OnInit {
  isSidebarOpen = false;
  isRightSidebarOpen = false;
  isPricingModalOpen = false;
  notification: any = null;
  user: any = null;

  navItems: any[] = [];
  
  recentNotifications = [
    { title: 'Contrato generado', message: 'Tu contrato de arrendamiento está listo.', time: 'Hace 5 min', icon: 'fa-file-contract', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { title: 'Nueva funcionalidad', message: 'Ahora puedes firmar digitalmente.', time: 'Hace 2 horas', icon: 'fa-star', color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    { title: 'Análisis completado', message: 'Se encontraron 3 riesgos en tu documento.', time: 'Hace 1 día', icon: 'fa-shield-alt', color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' }
  ];

  constructor(
    public authService: AuthService,
    public themeService: ThemeService,
    private alertService: AlertService,
    private router: Router
  ) {}

  ngOnInit() {
    this.user = this.authService.getUserFromToken();
    if (!this.user) {
      this.router.navigate(['/login']);
      return;
    }
    this.user.plan = this.authService.getUserPlan();

    if (this.user.isAdmin) {
      this.navItems = [
        { path: '/dashboard', icon: 'fas fa-border-all', label: 'Dashboard General' },
        { path: '/equipo', icon: 'fas fa-users', label: 'Gestión de Usuarios' },
        { path: '/documentos', icon: 'fas fa-folder-open', label: 'Moderación Docs' },
        { path: '/admin/rag', icon: 'fas fa-gavel', label: 'Base RAG (Leyes)' },
        { path: '/leyes', icon: 'fas fa-scale-balanced', label: 'Biblioteca Legal' }
      ];
    } else {
      this.navItems = [
        { path: '/dashboard', icon: 'fas fa-border-all', label: 'Panel Principal' },
        { path: '/documentos', icon: 'fas fa-folder-open', label: 'Mis Documentos' },
        { path: '/generar', icon: 'fas fa-file-signature', label: 'Generar Contrato' },
        { path: '/constituir', icon: 'fas fa-building', label: 'Constituir Empresa' },
        { path: '/analizar', icon: 'fas fa-shield-halved', label: 'Analizar Contrato' },
        { path: '/chat', icon: 'fas fa-message', label: 'Consultar IA' },
        { path: '/leyes', icon: 'fas fa-scale-balanced', label: 'Biblioteca Legal' }
      ];
    }

    // Simulate notification
    setTimeout(() => {
      this.notification = {
        title: 'Actualización Legal',
        message: 'Se ha actualizado la plantilla de contrato de confidencialidad.'
      };
      setTimeout(() => this.notification = null, 5000);
    }, 15000);

    // Subscribe to global modal state
    this.authService.pricingModalOpen$.subscribe(isOpen => {
      this.isPricingModalOpen = isOpen;
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  handleUpgradeClick(plan: string, price: number) {
    this.isPricingModalOpen = false;
    this.alertService.info('Procesando Pago', `Iniciando pasarela segura (Culqi/Stripe) para el Plan ${plan}...`);
    
    // Simulate network delay for payment processing
    setTimeout(() => {
      this.authService.setUserPlan(plan);
      this.user.plan = plan;
      this.alertService.success('¡Pago Exitoso!', `Bienvenido al Plan ${plan}. Se ha cobrado S/ ${price}.`);
    }, 2500);
  }
}
