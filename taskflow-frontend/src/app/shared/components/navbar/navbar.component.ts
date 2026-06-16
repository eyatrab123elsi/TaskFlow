import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  @Output() toggleSidebar = new EventEmitter<void>();

  currentUser$ = this.authService.currentUser$;

  constructor(
    public authService: AuthService,
    public userService: UserService,
    private router: Router
  ) {}

  logout(): void {
    this.authService.logout();
  }

  goToProfile(): void {
    this.router.navigate(['/profile']);
  }

  getInitials(user: User): string {
    return this.userService.getInitials(user.firstName, user.lastName);
  }

  getAvatarUrl(user: User): string | null {
    return this.userService.getAvatarUrl(user.profileImage);
  }

  getRoleBadge(role: string): string {
    const map: Record<string, string> = {
      ADMIN: 'Administrateur',
      PROJECT_MANAGER: 'Chef de projet',
      MEMBER: 'Membre'
    };
    return map[role] ?? role;
  }
}
