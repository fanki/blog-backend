import { Component, OnInit } from '@angular/core';
import { BlogService } from '../blog.service';
import { Blog } from '../blog.model';
import { CommonModule } from '@angular/common';
import { BlogFormComponent } from '../blog-form/blog-form.component'; // Das Formular zum Erstellen neuer Blogs

@Component({
  selector: 'app-blog-list',
  standalone: true,
  templateUrl: './blog-list.component.html',
  styleUrls: ['./blog-list.component.scss'],
  imports: [CommonModule, BlogFormComponent]
})
export class BlogListComponent implements OnInit {

  blogs: Blog[] = [];
  loading = false;
  noBlogs = false;

  constructor(private blogService: BlogService) {}

  ngOnInit(): void {
    this.loadBlogs();
  }

  /**
   * Lädt alle Blogs vom Backend
   */
  loadBlogs(): void {
    this.loading = true;
    this.noBlogs = false;

    this.blogService.getAllBlogs().subscribe({
      next: (data: Blog[]) => {
        this.blogs = data.map((blog) => ({
          ...blog,
          // approved wird als boolean normalisiert
          approved: [true, 1, '0x01'].includes(blog.approved)
        }));

        this.noBlogs = this.blogs.length === 0;

        console.log('Geladene Blogs:', this.blogs);
      },
      error: (err) => {
        console.error('Fehler beim Laden der Blogs:', err);
        this.noBlogs = true;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  /**
   * Wird vom BlogFormComponent getriggert, wenn ein neuer Post erstellt wurde
   */
  onPostCreated(): void {
    console.log('Blog wurde erstellt. Lade Blogs neu...');
    this.loadBlogs();
  }

}
