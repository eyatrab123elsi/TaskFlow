import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  form: FormGroup;
  loading   = false;
  success   = false;
  token     = '';
  hideNew   = true;
  hideConf  = true;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private notify: NotificationService
  ) {
    this.form = this.fb.group({
      newPassword:     ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordsMatch });
  }

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';
    if (!this.token) {
      this.notify.error('Lien invalide. Veuillez refaire la demande.');
      this.router.navigate(['/auth/forgot-password']);
    }
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true;
    const { newPassword, confirmPassword } = this.form.value;
    this.authService.resetPassword(this.token, newPassword, confirmPassword).subscribe({
      next: () => { this.loading = false; this.success = true; },
      error: (err) => {
        this.loading = false;
        this.notify.error(err.error?.message ?? 'Lien expiré ou invalide');
      }
    });
  }

  private passwordsMatch(group: FormGroup) {
    const pw  = group.get('newPassword')?.value;
    const cpw = group.get('confirmPassword')?.value;
    return pw === cpw ? null : { mismatch: true };
  }

  hasSpecialChar(v: string): boolean { return /[!@#$%^&*(),.?":{}|<>]/.test(v); }

  getStrength(v: string): string {
    if (!v) return '';
    if (v.length < 8) return 'Faible';
    if (!this.hasSpecialChar(v)) return 'Moyen';
    return 'Fort';
  }

  get newPassword()     { return this.form.get('newPassword')!; }
  get confirmPassword() { return this.form.get('confirmPassword')!; }
}
