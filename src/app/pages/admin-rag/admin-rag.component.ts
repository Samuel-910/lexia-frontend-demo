import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RagService } from '../../services/rag.service';
import { AlertService } from '../../core/services/alert.service';
import { firstValueFrom } from 'rxjs';

interface UploadQueueItem {
  file: File;
  status: 'pending' | 'uploading' | 'success' | 'error';
  errorMsg?: string;
  articlesCount?: number;
  estimatedTimeSeconds?: number;
}

@Component({
  selector: 'app-admin-rag',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-rag.component.html',
  styles: [`
    :host {
      display: flex;
      flex: 1;
      flex-direction: column;
      overflow: hidden;
    }
  `]
})
export class AdminRagComponent implements OnInit {
  documents: string[] = [];
  loadingDocs = false;
  uploading = false;
  dragOver = false;

  // Multi-File Upload Queue
  uploadQueue: UploadQueueItem[] = [];

  // RAG Query State
  queryText = '';
  queryLimit = 5;
  ragAnswer = '';
  querying = false;

  // Persisted mock metadata for update dates
  documentUpdates: { [key: string]: string } = {};

  constructor(
    private ragService: RagService,
    private alertService: AlertService
  ) {}

  ngOnInit() {
    this.loadDocumentUpdatesMap();
    this.loadDocuments();
  }

  loadDocuments() {
    this.loadingDocs = true;
    this.ragService.getDocuments().subscribe({
      next: (data) => {
        this.documents = data;
        this.loadingDocs = false;
        this.syncDocumentUpdates();
      },
      error: (err) => {
        console.error('Error loading RAG documents', err);
        this.alertService.error('Error', 'No se pudieron cargar las leyes del RAG.');
        this.loadingDocs = false;
      }
    });
  }

  // Load update dates from localStorage
  loadDocumentUpdatesMap() {
    const stored = localStorage.getItem('rag_document_updates');
    if (stored) {
      this.documentUpdates = JSON.parse(stored);
    }
  }

  // Save update dates to localStorage
  saveDocumentUpdatesMap() {
    localStorage.setItem('rag_document_updates', JSON.stringify(this.documentUpdates));
  }

  // Ensure every loaded document has an associated update date
  syncDocumentUpdates() {
    let updated = false;
    const now = new Date();
    
    this.documents.forEach((doc, index) => {
      if (!this.documentUpdates[doc]) {
        // Generate a random date in the last few days for existing documents
        const pastDate = new Date();
        pastDate.setDate(now.getDate() - (index + 1));
        pastDate.setHours(pastDate.getHours() - (index * 2));
        
        this.documentUpdates[doc] = pastDate.toLocaleString('es-PE', {
          day: '2-digit', month: '2-digit', year: 'numeric',
          hour: '2-digit', minute: '2-digit'
        });
        updated = true;
      }
    });

    if (updated) {
      this.saveDocumentUpdatesMap();
    }
  }

  // File selection handlers
  onFileSelected(event: any) {
    const files = event.target.files;
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        this.handleFile(files[i]);
      }
    }
    event.target.value = ''; // Reset input to allow selecting same file again if needed
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.dragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.dragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.dragOver = false;
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        this.handleFile(files[i]);
      }
    }
  }

  handleFile(file: File) {
    const allowedExtensions = ['.txt', '.pdf', '.docx'];
    const fileName = file.name.toLowerCase();
    const isValid = allowedExtensions.some(ext => fileName.endsWith(ext));

    if (!isValid) {
      this.alertService.error('Archivo no admitido', `"${file.name}" no tiene una extensión permitida (.txt, .pdf, .docx).`);
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      this.alertService.error('Archivo muy pesado', `"${file.name}" supera el límite de 10MB.`);
      return;
    }

    // Check if file is already in queue
    const alreadyExists = this.uploadQueue.some(item => item.file.name === file.name);
    if (alreadyExists) {
      this.alertService.toast(`"${file.name}" ya está en la lista`, 'info');
      return;
    }

    this.uploadQueue.push({
      file,
      status: 'pending'
    });
  }

  removeFromQueue(index: number) {
    this.uploadQueue.splice(index, 1);
  }

  clearQueue() {
    this.uploadQueue = [];
  }

  async uploadAllFiles() {
    if (this.uploadQueue.length === 0) return;

    this.uploading = true;
    let successfulUploadsCount = 0;
    
    let lastArticlesCount = 0;
    let lastEstimatedTime = 0;
    let lastFileName = '';

    for (let i = 0; i < this.uploadQueue.length; i++) {
      const item = this.uploadQueue[i];
      if (item.status === 'success') continue;

      item.status = 'uploading';
      const fileName = item.file.name;

      try {
        const base64String = await this.fileToBase64(item.file);
        
        // El backend responde ahora con los metadatos de pre-procesamiento
        const res = await firstValueFrom(this.ragService.uploadDocument(fileName, base64String));
        
        item.status = 'success';
        item.articlesCount = res.articlesCount;
        item.estimatedTimeSeconds = res.estimatedTimeSeconds;
        
        lastArticlesCount = res.articlesCount;
        lastEstimatedTime = res.estimatedTimeSeconds;
        lastFileName = fileName;
        
        successfulUploadsCount++;
        
        // Save actual upload timestamp
        const now = new Date();
        this.documentUpdates[fileName] = now.toLocaleString('es-PE', {
          day: '2-digit', month: '2-digit', year: 'numeric',
          hour: '2-digit', minute: '2-digit'
        });
        this.saveDocumentUpdatesMap();
      } catch (err: any) {
        console.error(`Error uploading ${fileName}`, err);
        item.status = 'error';
        item.errorMsg = err.error?.error || err.message || 'Error al indexar';
      }
    }

    this.uploading = false;
    this.loadDocuments();

    const hasErrors = this.uploadQueue.some(item => item.status === 'error');
    if (successfulUploadsCount > 0 && !hasErrors) {
      if (successfulUploadsCount === 1) {
        this.alertService.success(
          'Procesamiento Iniciado', 
          `El documento "${lastFileName}" se está indexando en segundo plano de forma segura.\n\n` +
          `• Artículos jurídicos detectados: ${lastArticlesCount}\n` +
          `• Tiempo estimado para completarse: ~${lastEstimatedTime} segundos.`
        );
      } else {
        this.alertService.success(
          'Indexación Iniciada', 
          'Los archivos seleccionados se están procesando y generando embeddings en segundo plano.'
        );
      }
      this.clearQueue();
    } else if (successfulUploadsCount > 0 && hasErrors) {
      this.alertService.toast('Algunos archivos fallaron al indexarse.', 'error');
      // Keep only failed files in queue
      this.uploadQueue = this.uploadQueue.filter(item => item.status !== 'success');
    } else if (successfulUploadsCount === 0 && hasErrors) {
      this.alertService.error('Error al Subir', 'No se pudo indexar ninguno de los archivos seleccionados.');
    }
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = () => reject(new Error('Error al leer el archivo.'));
      reader.readAsDataURL(file);
    });
  }

  deleteDocument(docName: string) {
    this.alertService.toast(`Eliminando ${docName}...`, 'info');
    
    this.ragService.deleteDocument(docName).subscribe({
      next: () => {
        this.alertService.success('Eliminado', `El documento "${docName}" fue retirado del RAG.`);
        
        // Remove from local metadata
        delete this.documentUpdates[docName];
        this.saveDocumentUpdatesMap();
        
        this.loadDocuments();
      },
      error: (err) => {
        console.error(err);
        this.alertService.error('Error', 'No se pudo eliminar el documento del RAG.');
      }
    });
  }

  // RAG testing console query
  testQuery() {
    if (!this.queryText.trim()) return;

    this.querying = true;
    this.ragAnswer = '';

    this.ragService.queryRag(this.queryText, undefined, this.queryLimit).subscribe({
      next: (res) => {
        this.ragAnswer = res.response;
        this.querying = false;
      },
      error: (err) => {
        console.error(err);
        this.alertService.error('Error en Consulta', 'Ocurrió un problema al procesar la respuesta con la IA.');
        this.querying = false;
      }
    });
  }
}
