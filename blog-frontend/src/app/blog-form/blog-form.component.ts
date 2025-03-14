import { Component, Output, EventEmitter } from '@angular/core';
import { BlogService } from '../blog.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { COMMA, ENTER } from '@angular/cdk/keycodes';

@Component({
  selector: 'app-blog-form',
  standalone: true,
  templateUrl: './blog-form.component.html',
  styleUrls: ['./blog-form.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    MatChipsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule
  ]
})
export class BlogFormComponent {

  title = '';
  content = '';
  category = '';                    // ➕ Kategorie
  suggestedTags: string[] = [];
  selectedTags: string[] = [];

  showToast = false;
  debounceTimer: any;

  separatorKeysCodes: number[] = [ENTER, COMMA];

  @Output() postCreated = new EventEmitter<void>();

  constructor(private blogService: BlogService) {}

  createPost(): void {
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
      tags: this.selectedTags,
      category: this.category  // ➕ Kategorie mitsenden
    };

    this.blogService.createBlog(newBlog).subscribe({
      next: () => {
        this.resetForm();
        this.postCreated.emit();
        this.showSuccessToast();
      },
      error: (err) => {
        console.error('Fehler beim Erstellen des Blogs:', err);
        alert('Fehler beim Erstellen des Blogs');
      }
    });
  }

  onInputChange(): void {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.getSuggestions();
    }, 500);
  }

  getSuggestions(): void {
    if (this.title.length < 3 && this.content.length < 5) {
      this.suggestedTags = [];
      this.selectedTags = [];
      this.category = '';
      return;
    }

    this.blogService.suggestTagsAndCategory(this.title, this.content).subscribe({
      next: (result) => {
        this.suggestedTags = result.tags;
        this.category = result.category;
        this.selectedTags = [...result.tags];
        console.log('Vorschläge erhalten:', result);
      },
      error: (error) => {
        console.error('Fehler beim Laden der Vorschläge:', error);
      }
    });
  }

  addTag(event: any): void {
    const inputElement = event.target as HTMLInputElement;
    const value = (inputElement.value || '').trim();

    if (value && !this.selectedTags.includes(value)) {
      this.selectedTags.push(value);
    }

    inputElement.value = '';
  }

  addSuggestedTag(tag: string): void {
    if (!this.selectedTags.includes(tag)) {
      this.selectedTags.push(tag);
    }
  }

  removeTag(tag: string): void {
    const index = this.selectedTags.indexOf(tag);
    if (index >= 0) {
      this.selectedTags.splice(index, 1);
    }
  }

  private resetForm(): void {
    this.title = '';
    this.content = '';
    this.category = '';
    this.suggestedTags = [];
    this.selectedTags = [];
  }

  private showSuccessToast(): void {
    this.showToast = true;
    setTimeout(() => {
      this.showToast = false;
    }, 3000);
  }
}
