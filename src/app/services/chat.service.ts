import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private mockConversations: any[] = [
    {
      id: 1,
      title: 'Duda sobre contrato de alquiler',
      createdAt: new Date().toISOString()
    }
  ];

  private mockMessages: any = {
    1: [
      { sender: 'user', content: '¿Qué pasa si el inquilino no paga?', timestamp: new Date().toISOString() },
      { sender: 'ai', content: 'Según la ley, si el inquilino no paga, el propietario tiene derecho a rescindir el contrato y solicitar el desalojo tras enviar un preaviso legal.', timestamp: new Date().toISOString() }
    ]
  };

  private idCounter = 2;

  constructor() { }

  getConversations(): Observable<any[]> {
    return of([...this.mockConversations]).pipe(delay(500));
  }

  getConversation(id: number): Observable<any> {
    const conv = this.mockConversations.find(c => c.id == id);
    if (!conv) return of(null);
    return of({
      ...conv,
      messages: this.mockMessages[id] || []
    }).pipe(delay(500));
  }

  startConversation(content: string, mode: string, images?: string[] | null, documents?: any[] | null): Observable<any> {
    const newConvId = this.idCounter++;
    const newConv = {
      id: newConvId,
      title: content.substring(0, 30) + '...',
      createdAt: new Date().toISOString()
    };
    this.mockConversations.unshift(newConv);
    this.mockMessages[newConvId] = [
      { sender: 'user', content, timestamp: new Date().toISOString() },
      { sender: 'ai', content: 'Analizando su consulta con nuestros modelos de IA simulados. En un entorno real, aquí procesaríamos la información usando la base de conocimientos RAG y el modelo Llama3 para brindar un asesoramiento preciso.', timestamp: new Date(new Date().getTime() + 1000).toISOString() }
    ];
    return of(newConvId).pipe(delay(1000));
  }

  sendMessage(conversationId: number, content: string, mode: string, images?: string[] | null, documents?: any[] | null): Observable<any> {
    if (!this.mockMessages[conversationId]) {
      this.mockMessages[conversationId] = [];
    }
    
    // Add user message immediately
    this.mockMessages[conversationId].push({ sender: 'user', content, timestamp: new Date().toISOString() });
    
    // Mock AI response
    const aiResponse = { sender: 'ai', content: 'Respuesta simulada generada por LexIA Demo. Aquí se presentaría la respuesta contextual basada en la base legal.', timestamp: new Date(new Date().getTime() + 1500).toISOString() };
    this.mockMessages[conversationId].push(aiResponse);

    return of(aiResponse).pipe(delay(1500));
  }
}
