import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor() { }

  updateProfile(name: string): Observable<any> {
    return of('Perfil actualizado correctamente (Simulado)').pipe(delay(800));
  }
}
