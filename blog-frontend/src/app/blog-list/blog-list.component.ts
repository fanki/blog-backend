import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { BlogService } from '../blog.service';
import { Blog } from '../blog.model';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-blog-list',
  standalone: true,
  templateUrl: './blog-list.component.html',
  styleUrls: ['./blog-list.component.scss'],
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    FormsModule
  ]
})
export class BlogListComponent implements OnInit {

  blogs: Blog[] = [];
  filteredBlogs: Blog[] = [];
  loading = false;
  noBlogs = false;

  allTags: string[] = [];
  allCategories: string[] = [];

  searchTitle = '';
  selectedTag: string | null = null;
  selectedCategory: string | null = null;

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
        this.extractFilters();
        this.filterBlogs();
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

  extractFilters(): void {
    const tagsSet = new Set<string>();
    const categoriesSet = new Set<string>();

    this.blogs.forEach(blog => {
      blog.tags?.forEach(tag => tagsSet.add(tag));
      if (blog.category) categoriesSet.add(blog.category);
    });

    this.allTags = Array.from(tagsSet);
    this.allCategories = Array.from(categoriesSet);
  }

  filterBlogs(): void {
    this.filteredBlogs = this.blogs.filter(blog => {
      const titleMatches = !this.searchTitle || blog.title.toLowerCase().includes(this.searchTitle.toLowerCase());
      const tagMatches = !this.selectedTag || (blog.tags && blog.tags.includes(this.selectedTag));
      const categoryMatches = !this.selectedCategory || blog.category === this.selectedCategory;

      return titleMatches && tagMatches && categoryMatches;
    });
  }

  resetFilters(): void {
    this.searchTitle = '';
    this.selectedTag = null;
    this.selectedCategory = null;
    this.filterBlogs();
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
