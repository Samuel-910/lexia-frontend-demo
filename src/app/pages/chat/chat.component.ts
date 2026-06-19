import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ChatService } from '../../services/chat.service';
import { AlertService } from '../../core/services/alert.service';
import { MarkdownPipe } from '../../shared/pipes/markdown.pipe';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, MarkdownPipe],
  templateUrl: './chat.component.html',
  styles: [`
    :host {
      display: flex;
      flex: 1;
      flex-direction: column;
      overflow: hidden;
    }
  `]
})
export class ChatComponent implements OnInit {
  mode: string = 'consulta';
  conversations: any[] = [];
  activeConvId: number | null = null;
  messages: any[] = [];
  input: string = '';
  isTyping: boolean = false;
  docGenerated: boolean = false;
  attachedImage: string | null = null;
  attachedFiles: any[] = [];
  isDragging: boolean = false;

  @ViewChild('scrollMe') private myScrollContainer!: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private chatService: ChatService,
    private alertService: AlertService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['mode']) {
        this.mode = params['mode'];
      }
    });
    this.loadConversations();
  }

  loadConversations() {
    this.chatService.getConversations().subscribe({
      next: (data) => {
        this.conversations = data;
      }
    });
  }

  startNewConversation() {
    this.activeConvId = null;
    this.messages = [];
    this.docGenerated = false;
  }

  loadConversation(id: number) {
    this.activeConvId = id;
    this.chatService.getConversation(id).subscribe({
      next: (data) => {
        this.messages = data.messages || [];
      }
    });
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
    if (event.dataTransfer?.files) {
      this.handleFiles(event.dataTransfer.files);
    }
  }

  onFileSelected(event: any) {
    if (event.target.files) {
      this.handleFiles(event.target.files);
    }
  }

  handleFiles(files: FileList) {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onload = (e: any) => {
        if (file.type.startsWith('image/')) {
          this.attachedImage = e.target.result;
        } else {
          const base64Data = e.target.result.split(',')[1];
          this.attachedFiles.push({
            fileName: file.name,
            mimeType: file.type,
            base64Data: base64Data
          });
        }
      };
      reader.readAsDataURL(file);
    }
  }

  removeAttachedImage() {
    this.attachedImage = null;
  }

  removeAttachedFile(index: number) {
    this.attachedFiles.splice(index, 1);
  }

  handleSend() {
    if ((!this.input.trim() && !this.attachedImage && this.attachedFiles.length === 0) || this.isTyping) return;

    let displayContent = this.input || (this.attachedFiles.length > 0 ? 'Documentos enviados' : 'Imagen enviada');
    if (this.attachedFiles.length > 0) {
      const fileNames = this.attachedFiles.map(f => f.fileName).join('\n- ');
      displayContent += `\n\n**Archivos adjuntos:**\n- ${fileNames}`;
    }

    const userMessage = { role: 'user', content: displayContent };
    this.messages.push(userMessage);
    
    const contentToSend = this.input;
    const base64Data = this.attachedImage ? this.attachedImage.split(',')[1] : null;
    const imagesArray = base64Data ? [base64Data] : null;
    const documentsArray = this.attachedFiles.length > 0 ? [...this.attachedFiles] : null;

    this.input = '';
    this.attachedImage = null;
    this.attachedFiles = [];
    this.isTyping = true;
    this.scrollToBottom();

    if (!this.activeConvId) {
      this.chatService.startConversation(contentToSend, this.mode, imagesArray, documentsArray).subscribe({
        next: (data) => {
          this.activeConvId = data.id;
          this.loadConversations();
          this.typewriterEffect(data);
        },
        error: () => this.isTyping = false
      });
    } else {
      this.chatService.sendMessage(this.activeConvId, contentToSend, this.mode, imagesArray, documentsArray).subscribe({
        next: (data) => {
          this.typewriterEffect(data);
        },
        error: () => this.isTyping = false
      });
    }
  }

  typewriterEffect(data: any) {
    const newMessages = data.messages || [];
    const lastMessage = newMessages[newMessages.length - 1];

    if (lastMessage && lastMessage.role === 'assistant') {
      const fullContent = lastMessage.content;
      lastMessage.content = '';
      this.messages = newMessages;
      this.isTyping = false;
      this.scrollToBottom();

      let i = 0;
      const interval = setInterval(() => {
        lastMessage.content += fullContent.charAt(i);
        i++;
        if (i % 5 === 0) this.scrollToBottom();
        if (i >= fullContent.length) {
          clearInterval(interval);
          this.scrollToBottom();
        }
      }, 15);
    } else {
      this.messages = newMessages;
      this.isTyping = false;
      this.scrollToBottom();
    }
  }

  handleDownload() {
    this.alertService.toast('Descargando documento...', 'info');
  }

  scrollToBottom(): void {
    try {
      setTimeout(() => {
        this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
      }, 100);
    } catch(err) { }
  }
}
