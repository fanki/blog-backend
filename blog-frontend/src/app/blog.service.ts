import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<Blog>(this.apiUrl, blog, { headers });
  }


  updateBlog(blogId: number, blog: Partial<Blog>): Observable<Blog> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.put<Blog>(`${this.apiUrl}/${blogId}`, blog, { headers });
  }


  deleteBlog(blogId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${blogId}`);
  }

 
  suggestTags(title: string, content: string): Observable<string[]> {
    const payload = { title, content };
    return this.http.post<string[]>(`${this.apiUrl}/suggest-tags`, payload);
  }

  
  suggestTagsAndCategory(title: string, content: string): Observable<{ tags: string[], category: string }> {
    const payload = { title, content };
    return this.http.post<{ tags: string[], category: string }>(`${this.apiUrl}/suggest-tags-categories`, payload);
  }

  moderateBlog(title: string, content: string): Observable<{ safe: boolean }> {
    const payload = { title, content };
    return this.http.post<{ safe: boolean }>(`${this.apiUrl}/moderate`, payload);
  }
  
  
}
