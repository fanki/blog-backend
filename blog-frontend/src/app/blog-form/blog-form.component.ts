import { Component, Output, EventEmitter } from '@angular/core';
import { BlogService } from '../blog.service';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-blog-form',
    templateUrl: './blog-form.component.html',
    styleUrls: ['./blog-form.component.scss'],
    imports: [FormsModule]
})
export class BlogFormComponent {
  title = '';
  content = '';

  @Output() postCreated = new EventEmitter<void>(); // Event nach erfolgreichem Post

  constructor(private blogService: BlogService) {}

  createPost(): void {
    const newBlog = { title: this.title, content: this.content };
    this.blogService.createBlog(newBlog).subscribe(() => {
      alert('Blog erfolgreich erstellt!');
      this.title = '';
      this.content = '';

      this.postCreated.emit(); // Event feuern!
    });
  }
}
