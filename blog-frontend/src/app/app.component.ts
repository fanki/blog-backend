import { Component, ViewChild } from '@angular/core';
import { BlogFormComponent } from './blog-form/blog-form.component';
import { BlogListComponent } from './blog-list/blog-list.component';
import { Blog } from './blog.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [BlogFormComponent, BlogListComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  @ViewChild('blogList') blogList!: BlogListComponent;

  selectedBlog?: Blog;

  onEditBlog(blog: Blog): void {
    console.log('Bearbeite Blog:', blog);
    this.selectedBlog = blog;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onPostCreated(): void {
    console.log('Blog erstellt oder bearbeitet!');
    this.blogList.loadBlogs();
    this.selectedBlog = undefined; 
  }

  onEditCanceled(): void {
    this.selectedBlog = undefined;
  }
}
