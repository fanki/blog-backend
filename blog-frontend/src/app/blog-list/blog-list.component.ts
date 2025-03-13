import { Component, OnInit } from '@angular/core';
import { BlogService } from '../blog.service';
import { Blog } from '../blog.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-blog-list',
  standalone: true,
  templateUrl: './blog-list.component.html',
  styleUrls: ['./blog-list.component.scss'],
  imports: [CommonModule]
})
export class BlogListComponent implements OnInit {
  blogs: Blog[] = [];
  loading = false; // Spinner-Status

  constructor(private blogService: BlogService) {}

  ngOnInit(): void {
    this.loadBlogs();
  }

  loadBlogs(): void {
    this.loading = true;
    this.blogService.getAllBlogs().subscribe({
      next: (data) => {
        this.blogs = data;
      },
      error: (err) => {
        console.error('Fehler beim Laden der Blogs:', err);
      },
      complete: () => {
        this.loading = false;
      }
    });
  }
}
