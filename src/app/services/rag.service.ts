import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RagService {
  private mockDocuments: string[] = [
    'Constitucion_Nacional.pdf',
    'Codigo_Civil.pdf',
    'Ley_de_Sociedades.pdf'
  ];

  constructor() { }

  getDocuments(): Observable<string[]> {
    return of([...this.mockDocuments]).pipe(delay(500));
  }

  uploadDocument(fileName: string, base64Data: string): Observable<any> {
    this.mockDocuments.push(fileName);
    return of({ message: 'Documento indexado correctamente (Simulado)' }).pipe(delay(1500));
  }

  deleteDocument(documentName: string): Observable<any> {
    this.mockDocuments = this.mockDocuments.filter(d => d !== documentName);
    return of({ message: 'Documento eliminado del índice (Simulado)' }).pipe(delay(500));
  }

  queryRag(query: string, documentName?: string, limit: number = 5): Observable<any> {
    const mockResponse = {
      answer: 'Esta es una respuesta simulada por la base de conocimientos RAG. Basado en el contexto proporcionado, la información legal relevante indica que el procedimiento es acorde a la normativa general.',
      context: [
        'Extracto simulado del documento 1: Artículo 45 - Las partes tienen derecho a...',
        'Extracto simulado del documento 2: Consideraciones generales sobre responsabilidad civil.'
      ]
    };
    return of(mockResponse).pipe(delay(2000));
  }

  getDocumentStructure(documentName: string): Observable<any[]> {
    const mockStructure = [
      { section: 'Título I', content: 'Disposiciones generales' },
      { section: 'Título II', content: 'De los contratos' }
    ];
    return of(mockStructure).pipe(delay(800));
  }
}
