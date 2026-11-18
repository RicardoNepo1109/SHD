import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Post } from '../models/post';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private http = inject(HttpClient);
  private readonly API_URL = 'https://jsonplaceholder.typicode.com/posts';

  // GET: Listar publicaciones
  getPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.API_URL}?_limit=15`);
  }

  // POST: Crear publicación
  createPost(post: Post): Observable<Post> {
    return this.http.post<Post>(this.API_URL, post);
  }

  // PUT / PATCH: Actualizar publicación
  updatePost(id: number, post: Partial<Post>): Observable<Post> {
    return this.http.patch<Post>(`${this.API_URL}/${id}`, post);
  }

  // DELETE: Eliminar publicación
  deletePost(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}