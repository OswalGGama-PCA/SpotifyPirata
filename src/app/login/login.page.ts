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
  ToastController,
  LoadingController
} from '@ionic/angular/standalone';
import { Router, ActivatedRoute } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  mailOutline,
  lockClosedOutline,
  logoGoogle,
  logoApple,
  musicalNotes
} from 'ionicons/icons';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonButton,
    IonIcon,
    IonItem,
    IonInput,
    IonInputPasswordToggle,
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class LoginPage implements OnInit {
  loginForm: FormGroup;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private toastController: ToastController,
    private loadingController: LoadingController,
    private formBuilder: FormBuilder,
    private authService: AuthService
  ) {
    // Icons Registration
    addIcons({
      mailOutline,
      lockClosedOutline,
      logoGoogle,
      logoApple,
      musicalNotes
    });

    // Form Initialization with Validations
    this.loginForm = this.formBuilder.group({
      email: [
        '',
        Validators.compose([
          Validators.required,
          Validators.email
        ])
      ],
      password: [
        '',
        Validators.compose([
          Validators.required,
          Validators.minLength(6)
        ])
      ]
    });
  }

  ngOnInit() { }

  /**
   * Performs login using the refactored AuthService
   */
  async login() {
    if (this.loginForm.invalid) {
      await this.showToast('Por favor, completa todos los campos correctamente', 'warning');
      this.loginForm.markAllAsTouched();
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Iniciando sesión...',
      spinner: 'crescent',
      cssClass: 'custom-loading'
    });
    await loading.present();

    try {
      const credentials = this.loginForm.value;

      // Call service and wait for response
      const response = await new Promise<any>((resolve, reject) => {
        this.authService.login(credentials).subscribe({
          next: (res) => resolve(res),
          error: (err) => reject(err)
        });
      });

      await loading.dismiss();

      if (response && response.status === 'OK') {
        await this.showToast('¡Bienvenido de nuevo, pirata! 🏴‍☠️', 'success');

        // Navigation flow: Login -> Intro -> Home
        this.router.navigate(['/intro'], { replaceUrl: true });
      } else {
        throw new Error(response?.msg || 'Error en la autenticación');
      }

    } catch (error: any) {
      await loading.dismiss();
      const errorMessage = error?.message || 'Error al iniciar sesión. Intenta nuevamente.';
      await this.showToast(errorMessage, 'danger');
    }
  }

  /**
   * Simplified toast helper
   */
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

  /**
   * Redirect to register page
   */
  async goToRegister() {
    if (this.authService.isAuthenticated) {
      await this.authService.logout(false);
    }
    this.router.navigate(['/register']);
  }

  /**
   * Development placeholder for forgot password
   */
  goToForgotPassword() {
    this.showToast('Función en desarrollo', 'warning');
  }
}
