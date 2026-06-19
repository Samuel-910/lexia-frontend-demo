import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DocumentService } from '../../services/document.service';
import { DashboardService } from '../../services/dashboard.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-generate',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './generate.component.html',
  styles: [`
    :host {
      display: flex;
      flex: 1;
      flex-direction: column;
      overflow: hidden;
    }
  `]
})
export class GenerateComponent implements OnInit {
  step: number = 1;
  selectedTemplate: any = null;
  formData: any = {};
  isGenerating: boolean = false;
  generatedContent: string = '';
  summary: any = null;

  templates = [
    {
      id: 'alquiler',
      title: 'Contrato de Alquiler de Inmueble',
      description: 'Ideal para arrendar casas, departamentos o locales comerciales de forma segura.',
      icon: 'fas fa-home',
      color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
      fields: [
        { name: 'arrendador', label: 'Nombre del Arrendador', placeholder: 'Ej. Juan Pérez' },
        { name: 'dniArrendador', label: 'DNI del Arrendador', placeholder: 'Ej. 70000000' },
        { name: 'arrendatario', label: 'Nombre del Arrendatario', placeholder: 'Ej. María Gómez' },
        { name: 'dniArrendatario', label: 'DNI del Arrendatario', placeholder: 'Ej. 71111111' },
        { name: 'direccion', label: 'Dirección del inmueble', placeholder: 'Ej. Av. Los Laureles 123' },
        { name: 'renta', label: 'Monto de la renta mensual', placeholder: 'Ej. S/ 1,500.00' }
      ]
    },
    {
      id: 'trabajo',
      title: 'Contrato de Trabajo (Plazo Fijo)',
      description: 'Acuerdo laboral temporal bajo régimen general.',
      icon: 'fas fa-briefcase',
      color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
      fields: [
        { name: 'empresa', label: 'Nombre de la Empresa', placeholder: 'Ej. Mi Empresa S.A.C.' },
        { name: 'trabajador', label: 'Nombre del Trabajador', placeholder: 'Ej. Carlos Ruiz' }
      ]
    },
    {
      id: 'nda',
      title: 'Acuerdo de Confidencialidad (NDA)',
      description: 'Protege tu información sensible antes de compartirla con terceros.',
      icon: 'fas fa-user-secret',
      color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
      fields: [
        { name: 'parteA', label: 'Parte Reveladora', placeholder: 'Ej. Startup Innovadora' },
        { name: 'parteB', label: 'Parte Receptora', placeholder: 'Ej. Consultor Externo' }
      ]
    },
    {
      id: 'servicios',
      title: 'Contrato de Prestación de Servicios',
      description: 'Formaliza el trabajo de profesionales independientes (cuarta categoría).',
      icon: 'fas fa-handshake',
      color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
      fields: [
        { name: 'cliente', label: 'Nombre del Cliente', placeholder: 'Ej. Empresa XYZ' },
        { name: 'proveedor', label: 'Nombre del Proveedor/Consultor', placeholder: 'Ej. Juan Diseño' }
      ]
    },
    {
      id: 'otros',
      title: 'Otro tipo de Contrato (IA Libre)',
      description: 'Dile a LexIA qué contrato necesitas y ella lo redactará desde cero.',
      icon: 'fas fa-wand-magic-sparkles',
      color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400',
      fields: [
        { name: 'tema', label: '¿Qué tipo de contrato necesitas?', placeholder: 'Ej. Contrato de compraventa de un vehículo usado' }
      ]
    }
  ];

  constructor(
    private documentService: DocumentService,
    private dashboardService: DashboardService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.dashboardService.getSummary().subscribe({
      next: (data) => {
        this.summary = data;
        const simulatedPlan = this.authService.getUserPlan();
        if (simulatedPlan !== 'Gratuito') {
          this.summary.planType = simulatedPlan.toLowerCase();
        }
      }
    });
  }

  selectTemplate(template: any) {
    if (this.summary?.planType === 'free' && this.summary?.contractsUsed >= this.summary?.contractsLimit) {
      this.authService.pricingModalOpen$.next(true);
      return;
    }

    this.selectedTemplate = template;
    this.formData = {};
    this.step = 2;
  }

  goBackToTemplates() {
    this.step = 1;
    this.selectedTemplate = null;
  }

  generateContract() {
    this.isGenerating = true;
    this.step = 3;

    this.documentService.generateDocument(this.selectedTemplate.id, this.formData).subscribe({
      next: (res) => {
        this.generatedContent = res.content;
        this.isGenerating = false;
        if (this.summary) {
          this.summary.contractsUsed++;
        }
      },
      error: (err) => {
        console.error(err);
        alert('Hubo un error al generar el contrato.');
        this.isGenerating = false;
        this.step = 2;
      }
    });
  }

  printPDF() {
    window.print();
  }

  exportWord() {
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' " +
            "xmlns:w='urn:schemas-microsoft-com:office:word' " +
            "xmlns='http://www.w3.org/TR/REC-html40'>" +
            "<head><meta charset='utf-8'><title>Export HTML to Word Document con LexIA</title></head><body>";
    const footer = "</body></html>";
    const sourceHTML = header + this.generatedContent + footer;
    
    const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
    const fileDownload = document.createElement("a");
    document.body.appendChild(fileDownload);
    fileDownload.href = source;
    fileDownload.download = `Contrato_${this.selectedTemplate.id}.doc`;
    fileDownload.click();
    document.body.removeChild(fileDownload);
  }
}
