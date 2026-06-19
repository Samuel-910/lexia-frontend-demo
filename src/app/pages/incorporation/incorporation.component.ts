import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DocumentService } from '../../services/document.service';

@Component({
  selector: 'app-incorporation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './incorporation.component.html',
  styles: [`
    :host {
      display: flex;
      flex: 1;
      flex-direction: column;
      overflow: hidden;
    }
  `]
})
export class IncorporationComponent {
  step: number = 1;
  isGenerating: boolean = false;
  generatedContent: string = '';

  formData: any = {
    tipoSociedad: '',
    razonSocial: '',
    objetoSocial: '',
    domicilio: '',
    capitalSocial: '',
    sociosData: [], // Array to hold partners dynamically
    clausulasExtras: ''
  };

  newSocio = { nombre: '', dni: '', aporte: '' };

  companyTypes = [
    {
      id: 'S.A.C.',
      title: 'S.A.C.',
      subtitle: 'Sociedad Anónima Cerrada',
      description: 'Ideal para empresas familiares o con pocos socios (2 a 20). Las acciones no se transan en bolsa.',
      icon: 'fas fa-users',
      color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
    },
    {
      id: 'E.I.R.L.',
      title: 'E.I.R.L.',
      subtitle: 'Empresa Individual de Responsabilidad Limitada',
      description: 'Perfecta si emprendes solo. Tu patrimonio personal queda protegido de las deudas de la empresa.',
      icon: 'fas fa-user-tie',
      color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
    },
    {
      id: 'S.R.L.',
      title: 'S.R.L.',
      subtitle: 'Sociedad Comercial de Responsabilidad Limitada',
      description: 'Para negocios donde todos los socios (2 a 20) participan activamente en la gestión.',
      icon: 'fas fa-handshake',
      color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
    }
  ];

  constructor(private documentService: DocumentService) {}

  selectType(typeId: string) {
    this.formData.tipoSociedad = typeId;
    this.step = 2;
  }

  goToStep3() {
    if (!this.formData.razonSocial || !this.formData.objetoSocial || !this.formData.domicilio) {
      alert("Por favor completa todos los campos.");
      return;
    }
    this.step = 3;
  }

  goBack(toStep: number) {
    this.step = toStep;
  }

  addSocio() {
    if (this.newSocio.nombre && this.newSocio.dni && this.newSocio.aporte) {
      this.formData.sociosData.push({ ...this.newSocio });
      this.newSocio = { nombre: '', dni: '', aporte: '' };
    }
  }

  removeSocio(index: number) {
    this.formData.sociosData.splice(index, 1);
  }

  generateMinute() {
    if (this.formData.sociosData.length === 0) {
      alert("Debes agregar al menos un socio/titular.");
      return;
    }
    if (!this.formData.capitalSocial) {
      alert("Ingresa el capital social total.");
      return;
    }

    this.isGenerating = true;
    this.step = 4;

    // Convert partners array to string for the backend prompt
    let sociosString = this.formData.sociosData.map((s: any, i: number) => 
      `${i+1}. ${s.nombre} (DNI: ${s.dni}) aportando ${s.aporte}`
    ).join('; ');

    const requestData = {
      ...this.formData,
      socios: sociosString
    };
    delete requestData.sociosData; // Don't send the array directly

    this.documentService.generateDocument('constitucion', requestData).subscribe({
      next: (res) => {
        this.generatedContent = res.content;
        this.isGenerating = false;
      },
      error: (err) => {
        console.error(err);
        alert('Hubo un error al generar la minuta.');
        this.isGenerating = false;
        this.step = 3;
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
            "<head><meta charset='utf-8'><title>Minuta de Constitución</title></head><body>";
    const footer = "</body></html>";
    const sourceHTML = header + this.generatedContent + footer;
    
    const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
    const fileDownload = document.createElement("a");
    document.body.appendChild(fileDownload);
    fileDownload.href = source;
    fileDownload.download = `Minuta_Constitucion_${this.formData.tipoSociedad}.doc`;
    fileDownload.click();
    document.body.removeChild(fileDownload);
  }
}
