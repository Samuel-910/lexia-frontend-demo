import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TeamService {
  private mockMembers: any[] = [
    { id: 1, email: 'admin@lexia.com', role: 'Administrador', status: 'Activo' },
    { id: 2, email: 'abogado@lexia.com', role: 'Usuario', status: 'Activo' },
    { id: 3, email: 'invitado@lexia.com', role: 'Usuario', status: 'Pendiente' }
  ];

  private idCounter = 4;

  constructor() { }

  getMembers(): Observable<any[]> {
    return of([...this.mockMembers]).pipe(delay(600));
  }

  inviteMember(email: string): Observable<any> {
    const newMember = {
      id: this.idCounter++,
      email: email,
      role: 'Usuario',
      status: 'Pendiente'
    };
    this.mockMembers.push(newMember);
    return of({ message: `Invitación enviada a ${email} (Simulado)` }).pipe(delay(1000));
  }
}
