import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PostService } from '../../services/post';
import { AuthService } from '../../services/auth';
import { Post } from '../../models/post';

@Component({
  selector: 'app-posts',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './posts.html'
})
export class Posts implements OnInit {
  private postService = inject(PostService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);
  currentUser = this.authService.getCurrentUser();

  posts: Post[] = [];
  loading = false;
  toastMessage = '';
  toastType: 'success' | 'danger' | 'info' = 'success';

  // Formulario nuevo post
  newTitle = '';
  newBody = '';
  submitting = false;

  // Edición
  editingPostId: number | null = null;
  editTitle = '';
  editBody = '';

  ngOnInit(): void {
    this.loadPosts();
  }

  showAlert(msg: string, type: 'success' | 'danger' | 'info' = 'success'): void {
    this.toastMessage = msg;
    this.toastType = type;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.toastMessage = '';
      this.cdr.detectChanges();
    }, 3000);
  }

  // READ (GET)
  loadPosts(): void {
    this.loading = true;
    this.postService.getPosts().subscribe({
      next: (data) => {
        this.posts = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar posts:', err);
        this.loading = false;
        this.showAlert('Error al conectar con JSONPlaceholder', 'danger');
      }
    });
  }



  startEdit(post: Post): void {
    this.editingPostId = post.id ?? null;
    this.editTitle = post.title;
    this.editBody = post.body;
  }

  cancelEdit(): void {
    this.editingPostId = null;
    this.editTitle = '';
    this.editBody = '';
  }

  deletingId: number | null = null;

  // CREATE (POST)
  createPost(): void {
    if (!this.newTitle.trim() || !this.newBody.trim() || this.submitting) return;
    this.submitting = true;
    this.cdr.detectChanges();

    const payload: Post = {
      userId: 1,
      title: this.newTitle.trim(),
      body: this.newBody.trim()
    };

    this.postService.createPost(payload).subscribe({
      next: (created) => {
        const localPost: Post = { ...created, id: Date.now() };
        this.posts = [localPost, ...this.posts];
        this.newTitle = '';
        this.newBody = '';
        this.submitting = false;
        this.cdr.detectChanges();
        this.showAlert('Publicación creada correctamente (POST 201)', 'success');
      },
      error: (err) => {
        console.error(err);
        this.submitting = false;
        this.cdr.detectChanges();
        this.showAlert('No se pudo crear la publicación', 'danger');
      }
    });
  }

  // UPDATE (PATCH)
  saveEdit(post: Post): void {
    if (!post.id || !this.editTitle.trim() || !this.editBody.trim()) return;
    const apiId = post.id > 100 ? 1 : post.id;

    this.postService.updatePost(apiId, {
      title: this.editTitle.trim(),
      body: this.editBody.trim()
    }).subscribe({
      next: () => {
        this.posts = this.posts.map((p) =>
          p.id === post.id
            ? { ...p, title: this.editTitle.trim(), body: this.editBody.trim() }
            : p
        );
        this.cancelEdit();
        this.cdr.detectChanges(); 
        this.showAlert('Publicación actualizada (PATCH 200)', 'info');
      },
      error: (err) => {
        console.error(err);
        this.cdr.detectChanges();
        this.showAlert('Error al actualizar', 'danger');
      }
    });
  }

  // DELETE
  deletePost(id?: number): void {
    if (!id || this.deletingId === id) return;
    this.deletingId = id;
    const apiId = id > 100 ? 1 : id;

    this.postService.deletePost(apiId).subscribe({
      next: () => {
        this.posts = this.posts.filter((p) => p.id !== id);
        this.deletingId = null;
        this.cdr.detectChanges(); 
        this.showAlert('Publicación eliminada (DELETE 200)', 'danger');
      },
      error: (err) => {
        console.error(err);
        this.deletingId = null;
        this.cdr.detectChanges();
        this.showAlert('Error al eliminar', 'danger');
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }
}