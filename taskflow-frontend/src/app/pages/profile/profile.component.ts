import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  user: User | null = null;
  loading = true;
  savingProfile = false;
  savingPassword = false;
  previewUrl: string | null = null;
  selectedFile: File | null = null;

  profileForm: FormGroup;
  passwordForm: FormGroup;
  hideCurrentPw = true;
  hideNewPw = true;
  hideConfirmPw = true;

  activeTab = 0;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private authService: AuthService,
    private notify: NotificationService
  ) {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName:  ['', [Validators.required, Validators.minLength(2)]],
      phone:     ['']
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword:     ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.userService.getProfile().subscribe({
      next: user => {
        this.user = user;
        this.previewUrl = this.userService.getAvatarUrl(user.profileImage);
        this.profileForm.patchValue({
          firstName: user.firstName,
          lastName:  user.lastName,
          phone:     user.phone
        });
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    this.selectedFile = input.files[0];

    const reader = new FileReader();
    reader.onload = e => { this.previewUrl = e.target?.result as string; };
    reader.readAsDataURL(this.selectedFile);

    this.userService.uploadProfileAvatar(this.selectedFile).subscribe({
      next: user => {
        this.user = user;
        this.authService.updateCurrentUser(user);
        this.notify.success('Photo de profil mise à jour !');
      },
      error: () => this.notify.error('Erreur lors du chargement de la photo')
    });
  }

  saveProfile(): void {
    if (this.profileForm.invalid) { this.profileForm.markAllAsTouched(); return; }
    this.savingProfile = true;
    this.userService.updateProfile(this.profileForm.value).subscribe({
      next: user => {
        this.user = user;
        this.authService.updateCurrentUser(user);
        this.savingProfile = false;
        this.notify.success('Profil mis à jour avec succès !');
      },
      error: err => {
        this.savingProfile = false;
        this.notify.error(err.error?.message ?? 'Erreur lors de la mise à jour');
      }
    });
  }

  changePassword(): void {
    if (this.passwordForm.invalid) { this.passwordForm.markAllAsTouched(); return; }
    const val = this.passwordForm.value;
    if (val.newPassword !== val.confirmPassword) {
      this.notify.error('Les mots de passe ne correspondent pas');
      return;
    }
    this.savingPassword = true;
    this.userService.changeProfilePassword(val).subscribe({
      next: () => {
        this.savingPassword = false;
        this.passwordForm.reset();
        this.notify.success('Mot de passe modifié avec succès !');
      },
      error: err => {
        this.savingPassword = false;
        this.notify.error(err.error?.message ?? 'Erreur lors du changement de mot de passe');
      }
    });
  }

  getInitials(): string {
    if (!this.user) return '';
    return this.userService.getInitials(this.user.firstName, this.user.lastName);
  }

  getRoleLabel(role: string): string {
    return { ADMIN: 'Administrateur', PROJECT_MANAGER: 'Chef de projet', MEMBER: 'Membre' }[role] ?? role;
  }

  get firstName() { return this.profileForm.get('firstName')!; }
  get lastName()  { return this.profileForm.get('lastName')!; }
}
