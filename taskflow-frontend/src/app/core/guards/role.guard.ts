import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    const required: string[] = route.data['roles'] ?? [];
    if (required.length === 0) return true;

    if (this.authService.hasRole(...required)) return true;

    return this.router.createUrlTree(['/dashboard']);
  }
}
