import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Blog } from './blog.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BlogService {
  private apiUrl = 'http://localhost:8080/blogs';

  constructor(private http: HttpClient) {}

  getAllBlogs(): Observable<Blog[]> {
    return this.http.get<Blog[]>(this.apiUrl);
  }

  createBlog(blog: Partial<Blog>): Observable<Blog> {
    return this.http.post<Blog>(this.apiUrl, blog);
  }
}
