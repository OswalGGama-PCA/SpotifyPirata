import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  IonContent,
  IonButton,
  IonIcon,
  IonItem,
  IonInput,
  IonInputPasswordToggle,
  IonSpinner,
  ToastController,
  LoadingController
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  personOutline,
  mailOutline,
  lockClosedOutline,
  logoGoogle,
  logoApple,
  musicalNotes
} from 'ionicons/icons';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonButton,
    IonIcon,
    IonItem,
    IonInput,
    IonInputPasswordToggle,
    IonSpinner,
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class RegisterPage implements OnInit {
  registerForm: FormGroup;
  isLoading = false;

  constructor(
    private router: Router,
    private toastController: ToastController,
    private loadingController: LoadingController,
    private formBuilder: FormBuilder,
    private authService: AuthService
  ) {
    // Icons Registration
    addIcons({
      personOutline,
      mailOutline,
      lockClosedOutline,
      logoGoogle,
      logoApple,
      musicalNotes
    });

    // Form Initialization with SENA requirements
    this.registerForm = this.formBuilder.group({
      name: [
        '',
        Validators.compose([Validators.required, Validators.minLength(2)])
      ],
      last_name: [
        '',
        Validators.compose([Validators.required, Validators.minLength(2)])
      ],
      email: [
        '',
        Validators.compose([Validators.required, Validators.email])
      ],
      password: [
        '',
        Validators.compose([Validators.required, Validators.minLength(8)])
      ],
      password_confirmation: [
        '',
        Validators.compose([Validators.required])
      ]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  ngOnInit() { }

  /**
   * Custom validator to check if passwords match
   */
  passwordMatchValidator(g: FormGroup) {
    const password = g.get('password')?.value;
    const confirm = g.get('password_confirmation')?.value;
    return password === confirm ? null : { mismatch: true };
  }

  /**
   * Registers a new user using the refactored AuthService
   */
  async register() {
    if (this.registerForm.invalid) {
      await this.showToast('Por favor, completa todos los campos correctamente', 'warning');
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const loading = await this.loadingController.create({
      message: 'Creando tu cuenta...',
      spinner: 'crescent',
      cssClass: 'custom-loading'
    });
    await loading.present();

    try {
      const formData = this.registerForm.value;

      // Call service and wait for response
      const response = await new Promise<any>((resolve, reject) => {
        this.authService.signup(formData).subscribe({
          next: (res) => resolve(res),
          error: (err) => reject(err)
        });
      });

      await loading.dismiss();
      this.isLoading = false;

      if (response && response.status === 'OK') {
        await this.showToast('¡Cuenta creada exitosamente! 🎉', 'success');

        // Wait a bit and redirect to login
        setTimeout(() => {
          this.router.navigate(['/login'], { replaceUrl: true });
        }, 1500);
      } else {
        throw new Error(response?.msg || 'Error en el registro');
      }

    } catch (error: any) {
      this.isLoading = false;
      await loading.dismiss();
      const errorMessage = error?.message || 'Error al crear la cuenta. Intenta nuevamente.';
      await this.showToast(errorMessage, 'danger');
    }
  }

  /**
   * Password strength logic (remains for UX)
   */
  getPasswordStrength(): string {
    const password = this.registerForm.get('password')?.value || '';
    if (password.length === 0) return 'strength-none';
    if (password.length < 8) return 'strength-weak';

    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const strength = [hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;

    if (strength >= 3 && password.length >= 10) return 'strength-strong';
    if (strength >= 2 && password.length >= 8) return 'strength-good';
    return 'strength-medium';
  }

  getPasswordStrengthText(): string {
    const strength = this.getPasswordStrength();
    const texts: Record<string, string> = {
      'strength-none': '',
      'strength-weak': 'Débil',
      'strength-medium': 'Media',
      'strength-good': 'Buena',
      'strength-strong': '¡Excelente!'
    };
    return texts[strength] || '';
  }

  private async showToast(message: string, color: 'success' | 'danger' | 'warning' = 'success') {
    const toast = await this.toastController.create({
      message,
      duration: 2500,
      position: 'bottom',
      color,
      cssClass: 'theme-toast'
    });
    await toast.present();
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
