import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Wenn du *ngFor oder Pipes nutzt
import { BlogService } from '../blog.service';
import { Blog } from '../blog.model';

@Component({
  selector: 'app-blog-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './blog-list.component.html',
  styleUrls: ['./blog-list.component.scss']
})
export class BlogListComponent implements OnInit {
  blogs: Blog[] = [];

  constructor(private blogService: BlogService) {}

  ngOnInit(): void {
    this.loadBlogs();
  }

  loadBlogs(): void {
    this.blogService.getAllBlogs().subscribe((data) => {
      this.blogs = data;
    });
  }
}
