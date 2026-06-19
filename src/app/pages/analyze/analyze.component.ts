import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentService } from '../../services/document.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-analyze',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './analyze.component.html',
  styles: [`
    :host {
      display: flex;
      flex: 1;
      flex-direction: column;
      overflow: hidden;
    }
  `]
})
export class AnalyzeComponent {
  file: any = null;
  isAnalyzing = false;
  result: any = null;

  constructor(
    private documentService: DocumentService,
    private router: Router
  ) {}

  handleFileChange(event: any) {
    if (event.target.files && event.target.files[0]) {
      this.file = event.target.files[0];
    }
  }

  startAnalysis() {
    if (!this.file) return;
    this.isAnalyzing = true;

    const reader = new FileReader();
    reader.onload = () => {
      const base64String = (reader.result as string).split(',')[1];
      
      this.documentService.analyzeDocument(base64String, this.file.name).subscribe({
        next: (response) => {
          try {
            // Ollama a veces puede incluir markdown code blocks como ```json ... ```
            let jsonStr = response.analysis.trim();
            if (jsonStr.startsWith('```json')) {
              jsonStr = jsonStr.substring(7, jsonStr.length - 3).trim();
            } else if (jsonStr.startsWith('```')) {
              jsonStr = jsonStr.substring(3, jsonStr.length - 3).trim();
            }
            
            try {
              this.result = JSON.parse(jsonStr);
            } catch (firstError) {
              // Si falla, es muy probable que Ollama olvidara cerrar la llave principal al final
              try {
                this.result = JSON.parse(jsonStr + '}');
              } catch (secondError) {
                // Si aún falla, intentamos cerrar comillas y llaves
                this.result = JSON.parse(jsonStr + '"}');
              }
            }
          } catch (e) {
            console.error('Error parseando respuesta de Ollama:', e);
            // Fallback en caso de que no sea un JSON válido
            this.result = {
              risks: ["Error al interpretar la respuesta de la IA. Revisa el contrato manualmente."],
              gaps: ["La IA devolvió texto plano en lugar de datos estructurados."],
              recommendation: {
                status: 'negociar',
                text: "Ocurrió un error al formatear el análisis. Asegúrate de que Ollama funcione correctamente."
              }
            };
          }
          this.isAnalyzing = false;
        },
        error: (err) => {
          console.error(err);
          this.isAnalyzing = false;
          alert("Hubo un error al comunicarse con el backend.");
        }
      });
    };
    reader.readAsDataURL(this.file);
  }

  saveAnalysis() {
    this.documentService.createDocument({
      name: `Análisis_${this.file.name}`,
      type: 'Análisis de riesgos'
    }).subscribe(() => {
      this.router.navigate(['/documentos']);
    });
  }

  reset() {
    this.result = null;
    this.file = null;
  }
}
