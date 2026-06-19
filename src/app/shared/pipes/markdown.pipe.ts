import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'markdown',
  standalone: true
})
export class MarkdownPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';
    let html = value;
    
    // Bold: **text**
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Italic: *text*
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // List items starting with * or - 
    html = html.replace(/^[\*\-]\s+(.*)$/gm, '<li class="ml-4 list-disc mb-1">$1</li>');
    
    // Numbered lists starting with 1. 
    html = html.replace(/^\d+\.\s+(.*)$/gm, '<li class="ml-4 list-decimal mb-1">$1</li>');
    
    // Newlines to <br> (only if not inside an HTML tag to avoid breaking our lists slightly, but a simple replace is fine for MVP)
    html = html.replace(/\n/g, '<br/>');

    // Clean up <br/> after <li>
    html = html.replace(/<\/li><br\/>/g, '<\/li>');

    return html;
  }
}
