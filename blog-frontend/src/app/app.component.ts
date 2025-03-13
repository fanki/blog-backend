import { Component } from '@angular/core';
import { BlogFormComponent } from './blog-form/blog-form.component';
import { BlogListComponent } from './blog-list/blog-list.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [BlogFormComponent, BlogListComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  blogList!: BlogListComponent; // Referenz auf BlogListComponent

  onPostCreated(): void {
    // Hier triggern wir die Aktualisierung der Liste
    if (this.blogList) {
      this.blogList.loadBlogs();
    }
  }

  // Optional: Zugriff auf BlogListComponent per TemplateRef oder ChildComponent
}
