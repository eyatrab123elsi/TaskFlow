import { Component, Input } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  roles?: string[];
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  @Input() collapsed = false;

  navItems: NavItem[] = [
    { label: 'Tableau de bord', icon: 'dashboard',   route: '/dashboard' },
    { label: 'Utilisateurs',    icon: 'people',       route: '/users',    roles: ['ADMIN'] },
    { label: 'Mon profil',      icon: 'person',       route: '/profile' },
  ];

  constructor(public authService: AuthService) {}

  isVisible(item: NavItem): boolean {
    if (!item.roles) return true;
    return this.authService.hasRole(...item.roles);
  }
}
