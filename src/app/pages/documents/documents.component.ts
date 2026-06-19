import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { DocumentService } from '../../services/document.service';
import { AlertService } from '../../core/services/alert.service';

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './documents.component.html',
  styles: [`
    :host {
      display: flex;
      flex: 1;
      flex-direction: column;
      overflow: hidden;
    }
  `]
})
export class DocumentsComponent implements OnInit {
  docs: any[] = [];
  searchTerm = '';
  loading = true;

  // Signature State
  isSignatureModalOpen = false;
  docToSign: any = null;

  // Export State
  isExportModalOpen = false;
  docToExport: any = null;

  constructor(
    private documentService: DocumentService,
    private alertService: AlertService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadDocuments();
  }

  loadDocuments() {
    this.loading = true;
    this.documentService.getDocuments().subscribe({
      next: (data) => {
        this.docs = data;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  get filteredDocs() {
    return this.docs.filter(doc => 
      doc.name.toLowerCase().includes(this.searchTerm.toLowerCase()) || 
      doc.type.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  handleDuplicate(doc: any) {
    this.router.navigate(['/chat'], { queryParams: { mode: 'contrato', doc_id: doc.id } });
  }

  handleShare() {
    this.alertService.toast('Enlace copiado al portapapeles', 'success');
  }

  openSignature(doc: any) {
    this.docToSign = doc;
    this.isSignatureModalOpen = true;
  }

  saveSignature() {
    // Mocking the signature base64 for now
    const dummySignature = "base64_signature_string";
    this.documentService.signDocument(this.docToSign.id, dummySignature).subscribe({
      next: () => {
        this.alertService.success('Firma aplicada', 'El documento ha sido firmado digitalmente.').then(() => {
          this.isSignatureModalOpen = false;
          this.loadDocuments();
        });
      },
      error: () => {
        this.alertService.error('Error', 'No se pudo firmar el documento.');
      }
    });
  }

  openExport(doc: any) {
    this.docToExport = doc;
    this.isExportModalOpen = true;
  }

  exportDoc() {
    this.alertService.toast('Documento exportado', 'success');
    this.isExportModalOpen = false;
  }
}
