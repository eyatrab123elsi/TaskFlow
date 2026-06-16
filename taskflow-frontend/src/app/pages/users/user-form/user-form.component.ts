import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { NotificationService } from '../../../core/services/notification.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss']
})
export class UserFormComponent implements OnInit {

  form: FormGroup;
  isEdit = false;
  userId: number | null = null;
  loading = false;
  saving = false;
  hidePassword = true;

  selectedFile: File | null = null;
  previewUrl: string | null = null;
  currentUser: User | null = null;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private notify: NotificationService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.form = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName:  ['', [Validators.required, Validators.minLength(2)]],
      email:     ['', [Validators.required, Validators.email]],
      password:  ['', [Validators.required, Validators.minLength(8)]],
      phone:     [''],
      role:      ['MEMBER', Validators.required],
      enabled:   [true]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.userId = +id;
      this.loading = true;
      this.form.get('password')!.clearValidators();
      this.form.get('password')!.setValidators([Validators.minLength(8)]);
      this.form.get('password')!.updateValueAndValidity();

      this.userService.getById(this.userId).subscribe({
        next: user => {
          this.currentUser = user;
          this.previewUrl = this.userService.getAvatarUrl(user.profileImage);
          this.form.patchValue({
            firstName: user.firstName,
            lastName:  user.lastName,
            email:     user.email,
            phone:     user.phone,
            role:      user.role,
            enabled:   user.enabled
          });
          this.loading = false;
        },
        error: () => { this.loading = false; this.router.navigate(['/users']); }
      });
    }
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    this.selectedFile = input.files[0];
    const reader = new FileReader();
    reader.onload = e => { this.previewUrl = e.target?.result as string; };
    reader.readAsDataURL(this.selectedFile);
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    this.saving = true;
    const val = this.form.value;

    const action$ = this.isEdit && this.userId
      ? this.userService.update(this.userId, {
          firstName: val.firstName, lastName: val.lastName, email: val.email,
          phone: val.phone, role: val.role, enabled: val.enabled
        })
      : this.userService.create(val);

    action$.subscribe({
      next: user => {
        if (this.selectedFile && user.id) {
          this.userService.uploadAvatar(user.id, this.selectedFile).subscribe({
            next: () => this.finish(),
            error: () => this.finish()
          });
        } else {
          this.finish();
        }
      },
      error: err => {
        this.saving = false;
        this.notify.error(err.error?.message ?? 'Erreur lors de la sauvegarde');
      }
    });
  }

  private finish(): void {
    this.saving = false;
    this.notify.success(this.isEdit ? 'Utilisateur modifié !' : 'Utilisateur créé !');
    this.router.navigate(['/users']);
  }

  cancel(): void { this.router.navigate(['/users']); }

  getInitials(): string {
    const f = this.form.get('firstName')?.value ?? '';
    const l = this.form.get('lastName')?.value  ?? '';
    return `${f.charAt(0)}${l.charAt(0)}`.toUpperCase();
  }

  get firstName() { return this.form.get('firstName')!; }
  get lastName()  { return this.form.get('lastName')!; }
  get email()     { return this.form.get('email')!; }
  get password()  { return this.form.get('password')!; }
  get role()      { return this.form.get('role')!; }
}
