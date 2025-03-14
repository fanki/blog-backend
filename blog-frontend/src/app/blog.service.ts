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

  /**
   * Alle Blogs abrufen
   */
  getAllBlogs(): Observable<Blog[]> {
    return this.http.get<Blog[]>(this.apiUrl);
  }

  /**
   * Blog-Eintrag erstellen
   */
  createBlog(blog: Partial<Blog>): Observable<Blog> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<Blog>(this.apiUrl, blog, { headers });
  }

  /**
   * Nur Tags vorschlagen (Optional, wenn noch gebraucht)
   */
  suggestTags(title: string, content: string): Observable<string[]> {
    const payload = { title, content };
    return this.http.post<string[]>(`${this.apiUrl}/suggest-tags`, payload);
  }

  /**
   * Tags UND Kategorie vorschlagen (empfohlen)
   */
  suggestTagsAndCategory(title: string, content: string): Observable<{ tags: string[], category: string }> {
    const payload = { title, content };
    return this.http.post<{ tags: string[], category: string }>(`${this.apiUrl}/suggest-tags-categories`, payload);
  }
}
