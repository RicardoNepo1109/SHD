import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html'
})
export class Login{
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  username = '';
  password = '';
  errorMessage = '';
  showPassword = false;
  loading = false;

  onLogin(): void {
    this.errorMessage = '';

    if (!this.username.trim() || !this.password.trim()) {
      this.errorMessage = 'Ingresa usuario y contraseña.';
      return;
    }

    this.loading = true;
    this.cdr.detectChanges();

    this.authService.login(this.username, this.password).subscribe({
      next: (ok) => {
        this.loading = false;
        if (ok) {
          this.router.navigate(['/posts']);
        } else {
          this.errorMessage = 'Credenciales incorrectas en FakeStoreAPI.';
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Error de red al validar usuario.';
        this.cdr.detectChanges();
      }
    });
  }
}