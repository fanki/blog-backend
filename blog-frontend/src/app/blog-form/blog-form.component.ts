import { Component, Output, EventEmitter, Input, SimpleChanges } from '@angular/core';
import { BlogService } from '../blog.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Blog } from '../blog.model';


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

  @Output() postCreated = new EventEmitter<void>();
  @Output() editCanceled = new EventEmitter<void>();
  @Input() blogToEdit?: Blog;

  // Form Felder
  title = '';
  content = '';
  category = '';
  selectedTags: string[] = [];

  // Vorschläge
  suggestedTags: string[] = [];

  // UI State
  editMode = false;
  editingBlogId: number | null = null; // 🔧 ID speichern für updatePost()

  showToast = false;
  toastMessage = '';
  debounceTimer: any;
  separatorKeysCodes: number[] = [ENTER, COMMA];

  constructor(private blogService: BlogService) {}

  createPost(): void {
    if (this.isInvalid()) return;

    const newBlog = {
      title: this.title.trim(),
      content: this.content.trim(),
      tags: this.selectedTags,
      category: this.category
    };

    this.blogService.createBlog(newBlog).subscribe({
      next: () => {
        this.resetForm();
        this.postCreated.emit();
        this.showSuccessToast('✅ Blog wurde erstellt!');
      },
      error: (err) => {
        console.error('Fehler beim Erstellen des Blogs:', err);
        alert('Fehler beim Erstellen des Blogs');
      }
    });
  }

  updatePost(): void {
    if (this.isInvalid()) return;
    if (this.editingBlogId === null) {
      alert('Kein Blog zum Bearbeiten ausgewählt!');
      return;
    }

    const updatedBlog = {
      id: this.editingBlogId,
      title: this.title.trim(),
      content: this.content.trim(),
      category: this.category,
      tags: this.selectedTags
    };

    this.blogService.updateBlog(updatedBlog.id, updatedBlog).subscribe({
      next: () => {
        this.resetForm();
        this.postCreated.emit();
        this.showSuccessToast('✅ Blog wurde aktualisiert!');
      },
      error: (err) => {
        console.error('Fehler beim Aktualisieren:', err);
        alert('Fehler beim Aktualisieren');
      }
    });
  }

  cancelEdit(): void {
    this.resetForm();
    this.editCanceled.emit();
  }

  onInputChange(): void {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => this.getSuggestions(), 500);
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

  public resetForm(): void {
    this.title = '';
    this.content = '';
    this.category = '';
    this.selectedTags = [];
    this.suggestedTags = [];
    this.editMode = false;
    this.editingBlogId = null;
  }

  private isInvalid(): boolean {
    if (this.title.trim().length < 5) {
      alert('Der Titel muss mindestens 5 Zeichen enthalten!');
      return true;
    }

    if (this.content.trim().length < 10) {
      alert('Der Inhalt muss mindestens 10 Zeichen enthalten!');
      return true;
    }

    return false;
  }

  private showSuccessToast(message: string): void {
    this.toastMessage = message;
    this.showToast = true;
    setTimeout(() => this.showToast = false, 3000);
  }

  public loadBlogForEditing(blog: Blog): void {
    this.editMode = true;
    this.editingBlogId = blog.id; 
    this.title = blog.title;
    this.content = blog.content;
    this.category = blog.category;
    this.selectedTags = [...blog.tags];
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['blogToEdit'] && this.blogToEdit) {
      this.loadBlogForEditing(this.blogToEdit);
    }
  }

}
