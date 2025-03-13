import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BlogService } from '../blog.service';

@Component({
  selector: 'app-blog-form',
  standalone: true,
  imports: [FormsModule], // Formularbindung!
  templateUrl: './blog-form.component.html',
  styleUrls: ['./blog-form.component.scss']
})
export class BlogFormComponent {
  title = '';
  content = '';

  constructor(private blogService: BlogService) {}

  createPost(): void {
    const newBlog = { title: this.title, content: this.content };
    this.blogService.createBlog(newBlog).subscribe(() => {
      alert('Blog erfolgreich erstellt!');
      this.title = '';
      this.content = '';
    });
  }
}
