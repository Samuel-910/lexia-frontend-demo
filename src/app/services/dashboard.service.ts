import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  constructor() { }

  getSummary(): Observable<any> {
    const mockSummary = {
      documentsAnalyzed: 145,
      hoursSaved: 87,
      activeCases: 12,
      recentActivity: [
        { action: 'Análisis de Contrato Comercial', date: new Date().toISOString() },
        { action: 'Consulta Legal con LexIA', date: new Date(new Date().getTime() - 86400000).toISOString() },
        { action: 'Firma de Acta Constitutiva', date: new Date(new Date().getTime() - 172800000).toISOString() }
      ]
    };
    return of(mockSummary).pipe(delay(600));
  }
}
