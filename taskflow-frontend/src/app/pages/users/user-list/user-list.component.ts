import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { UserService } from '../../../core/services/user.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { User, Role, UserFilters } from '../../../core/models/user.model';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit, AfterViewInit {

  displayedColumns = ['avatar', 'fullName', 'email', 'phone', 'role', 'status', 'createdAt', 'actions'];

  users: User[] = [];
  totalElements = 0;
  loading = false;

  filters: UserFilters = {
    page: 0, size: 10, sort: 'createdAt', direction: 'desc',
    search: '', role: null, enabled: null
  };

  roles: Role[] = ['ADMIN', 'PROJECT_MANAGER', 'MEMBER'];

  private searchSubject = new Subject<string>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort)      matSort!: MatSort;

  constructor(
    private userService: UserService,
    private notify: NotificationService,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.searchSubject.pipe(debounceTime(400), distinctUntilChanged()).subscribe(val => {
      this.filters.search = val;
      this.filters.page = 0;
      this.load();
    });
    this.load();
  }

  ngAfterViewInit(): void {
    this.matSort.sortChange.subscribe((sort: Sort) => {
      this.filters.sort      = sort.active || 'createdAt';
      this.filters.direction = (sort.direction || 'desc') as 'asc' | 'desc';
      this.filters.page = 0;
      this.load();
    });
  }

  load(): void {
    this.loading = true;
    this.userService.getUsers(this.filters).subscribe({
      next: page => {
        this.users = page.content;
        this.totalElements = page.totalElements;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  onSearch(value: string): void { this.searchSubject.next(value); }

  onPage(event: PageEvent): void {
    this.filters.page = event.pageIndex;
    this.filters.size = event.pageSize;
    this.load();
  }

  onFilterChange(): void {
    this.filters.page = 0;
    this.load();
  }

  clearFilters(): void {
    this.filters = { ...this.filters, search: '', role: null, enabled: null, page: 0 };
    this.load();
  }

  edit(id: number): void { this.router.navigate(['/users', id, 'edit']); }

  toggleStatus(user: User): void {
    const action = user.enabled ? 'désactiver' : 'activer';
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: user.enabled ? 'Désactiver le compte' : 'Activer le compte',
        message: `Voulez-vous vraiment ${action} le compte de ${user.firstName} ${user.lastName} ?`,
        danger: user.enabled
      }
    });
    ref.afterClosed().subscribe(ok => {
      if (!ok) return;
      this.userService.toggleStatus(user.id).subscribe({
        next: () => { this.notify.success(`Compte ${user.enabled ? 'désactivé' : 'activé'} avec succès`); this.load(); },
        error: () => this.notify.error('Opération échouée')
      });
    });
  }

  delete(user: User): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Supprimer l\'utilisateur',
        message: `Cette action est irréversible. Supprimer ${user.firstName} ${user.lastName} ?`,
        confirmText: 'Supprimer',
        danger: true
      }
    });
    ref.afterClosed().subscribe(ok => {
      if (!ok) return;
      this.userService.delete(user.id).subscribe({
        next: () => { this.notify.success('Utilisateur supprimé'); this.load(); },
        error: () => this.notify.error('Suppression échouée')
      });
    });
  }

  getAvatarUrl(user: User): string | null {
    return this.userService.getAvatarUrl(user.profileImage);
  }

  getInitials(user: User): string {
    return this.userService.getInitials(user.firstName, user.lastName);
  }

  getRoleBadgeClass(role: Role): string {
    return { ADMIN: 'admin', PROJECT_MANAGER: 'pm', MEMBER: 'member' }[role] ?? '';
  }

  getRoleLabel(role: Role): string {
    return { ADMIN: 'Admin', PROJECT_MANAGER: 'Chef de projet', MEMBER: 'Membre' }[role] ?? role;
  }
}
