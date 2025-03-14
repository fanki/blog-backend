import { Component, Output, EventEmitter } from '@angular/core';
import { BlogService } from '../blog.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { MatChipsModule, MatChipInput, MatChipInputEvent } from '@angular/material/chips';
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
    MatChipInput,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule
  ]
})
export class BlogFormComponent {

  title = '';
  content = '';
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
      tags: this.selectedTags
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
      this.getSuggestedTags();
    }, 500);
  }

  getSuggestedTags(): void {
    if (this.title.length < 3 && this.content.length < 5) {
      this.suggestedTags = [];
      this.selectedTags = [];
      return;
    }

    this.blogService.suggestTags(this.title, this.content).subscribe({
      next: (tags) => {
        this.suggestedTags = tags;
        tags.forEach(tag => {
          if (!this.selectedTags.includes(tag)) {
            this.selectedTags.push(tag);
          }
        });
        console.log('Vorgeschlagene Tags:', tags);
      },
      error: (error) => {
        console.error('Fehler beim Laden der Tags:', error);
      }
    });
  }

  addTag(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const value = (inputElement.value || '').trim();
  
    if (value && !this.selectedTags.includes(value)) {
      this.selectedTags.push(value);
    }
  
    // Reset the input field
    inputElement.value = '';
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
