import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Posts } from './pages/posts/posts';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'posts', component: Posts, canActivate: [authGuard] },
  { path: '', redirectTo: '/login', pathMatch: 'full' }
];
