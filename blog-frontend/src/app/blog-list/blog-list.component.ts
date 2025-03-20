import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
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
  loading = false;
  noBlogs = false;

  @Output() editBlog = new EventEmitter<Blog>();

  constructor(private blogService: BlogService) {}

  ngOnInit(): void {
    this.loadBlogs();
  }

  loadBlogs(): void {
    this.loading = true;
    this.blogService.getAllBlogs().subscribe({
      next: (data: Blog[]) => {
        this.blogs = data.map((blog) => ({
          ...blog,
          approved: [true, 1, '0x01'].includes(blog.approved)
        }));
        this.noBlogs = this.blogs.length === 0;
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

  onPostCreated(): void {
    console.log('Ein Blog wurde erstellt oder aktualisiert');
    this.loadBlogs();
  }

  onEditCanceled(): void {
    console.log('Bearbeiten wurde abgebrochen');
  }

  editBlogAction(blog: Blog): void {
    this.editBlog.emit(blog);
  }

  deleteBlog(blog: Blog): void {
    if (!confirm(`Möchtest du den Blog "${blog.title}" wirklich löschen?`)) return;

    this.blogService.deleteBlog(blog.id).subscribe({
      next: () => {
        console.log('Blog gelöscht:', blog.title);
        this.loadBlogs();
      },
      error: (err) => {
        console.error('Fehler beim Löschen:', err);
      }
    });
  }
}
