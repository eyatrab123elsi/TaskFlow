import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
  form: FormGroup;
  loading = false;
  sent    = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private notify: NotificationService
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true;

    this.authService.forgotPassword(this.form.value.email).subscribe({
      next: (res) => {
        this.loading = false;
        if (res?.token) {
          // Redirection automatique vers la page reset avec le token
          this.router.navigate(['/auth/reset-password'], {
            queryParams: { token: res.token }
          });
        } else {
          // Email non trouvé — on affiche quand même le succès (sécurité)
          this.sent = true;
        }
      },
      error: () => {
        this.loading = false;
        this.sent = true;
      }
    });
  }

  get email() { return this.form.get('email')!; }
}
