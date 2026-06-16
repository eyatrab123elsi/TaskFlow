import { Component, OnInit } from '@angular/core';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { DashboardStats } from '../../core/models/page.model';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats | null = null;
  currentUser: User | null = null;
  loading = true;

  statCards = [
    { key: 'totalUsers',         label: 'Total utilisateurs',   icon: 'people',        color: '#3949ab', bg: '#ede9fe' },
    { key: 'activeUsers',        label: 'Utilisateurs actifs',  icon: 'check_circle',  color: '#16a34a', bg: '#dcfce7' },
    { key: 'inactiveUsers',      label: 'Désactivés',           icon: 'cancel',        color: '#dc2626', bg: '#fee2e2' },
    { key: 'adminCount',         label: 'Administrateurs',      icon: 'admin_panel_settings', color: '#7c3aed', bg: '#ede9fe' },
    { key: 'projectManagerCount',label: 'Chefs de projet',      icon: 'manage_accounts', color: '#1d4ed8', bg: '#dbeafe' },
    { key: 'memberCount',        label: 'Membres',              icon: 'person',        color: '#0369a1', bg: '#e0f2fe' },
  ];

  constructor(
    private userService: UserService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUser;

    if (this.authService.isAdmin()) {
      this.userService.getStats().subscribe({
        next: stats => { this.stats = stats; this.loading = false; },
        error: ()   => { this.loading = false; }
      });
    } else {
      this.loading = false;
    }
  }

  getStatValue(key: string): number {
    return this.stats ? (this.stats as any)[key] ?? 0 : 0;
  }
}
