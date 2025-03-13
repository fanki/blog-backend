import { Component, Output, EventEmitter } from '@angular/core';
import { BlogService } from '../blog.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-blog-form',
  standalone: true,
  templateUrl: './blog-form.component.html',
  styleUrls: ['./blog-form.component.scss'],
  imports: [FormsModule, CommonModule],
})
export class BlogFormComponent {
  title = '';
  content = '';
  showToast = false;

  @Output() postCreated = new EventEmitter<void>(); // Event für Parent-Komponente

  constructor(private blogService: BlogService) {}

  createPost(): void {
    // Validierung
    if (this.title.trim().length < 5) {
      alert('Der Titel muss mindestens 5 Zeichen enthalten!');
      return;
    }

    if (this.content.trim().length < 10) {
      alert('Der Inhalt muss mindestens 10 Zeichen enthalten!');
      return;
    }

    const newBlog = {
      title: this.title.trim(),
      content: this.content.trim(),
    };

    this.blogService.createBlog(newBlog).subscribe({
      next: () => {
        this.title = '';
        this.content = '';

        this.postCreated.emit(); // Aktualisieren der Blogliste
        this.showSuccessToast(); // Toast anzeigen
      },
      error: (err) => {
        console.error('Fehler beim Erstellen des Blogs:', err);
        alert('Fehler beim Erstellen des Blogs');
      },
    });
  }

  private showSuccessToast(): void {
    this.showToast = true;
    setTimeout(() => {
      this.showToast = false;
    }, 3000); // Nach 3 Sekunden ausblenden
  }
}
