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
    // Registro de íconos
    addIcons({
      mailOutline,
      lockClosedOutline,
      logoGoogle,
      logoApple,
      musicalNotes
    });

    // Inicialización del formulario con validaciones
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

  /**
   * Al cargar: por ahora no necesito hacer nada especial aquí.
   */
  ngOnInit() {}

  /**
   * Esta es la función principal que hace toda la magia del login.
   */
  async login() {
    // Validar formulario
    if (this.loginForm.invalid) {
      await this.showToast('Por favor, completa todos los campos correctamente', 'warning');
      
      // Marcar todos los campos como touched para mostrar errores
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
      
      return;
    }

    // Mostrar loading
    const loading = await this.loadingController.create({
      message: 'Iniciando sesión...',
      spinner: 'crescent',
      cssClass: 'custom-loading'
    });
    await loading.present();

    try {
      // Intentar login
      const credentials = this.loginForm.value;
      
      await new Promise<void>((resolve, reject) => {
        this.authService.login(credentials).subscribe({
          next: (response) => {
            console.log('Login exitoso:', response);
            resolve();
          },
          error: (error) => {
            console.error('Error en login:', error);
            reject(error);
          }
        });
      });

      // Cerrar loading
      await loading.dismiss();

      // Mostrar mensaje de éxito
      await this.showToast('¡Bienvenido abordo, pirata! 🏴‍☠️', 'success');

      // Pequeña pausa para que se vea el toast
      await new Promise(resolve => setTimeout(resolve, 500));

      // FLUJO: Login → Intro → Menu/Home
      // Siempre mostramos la intro al iniciar sesión por defecto, para cumplir el flujo.
      this.router.navigate(['/intro'], { replaceUrl: true });

    } catch (error: any) {
      // Cerrar loading
      await loading.dismiss();

      // Mostrar error
      const errorMessage = error?.message || 'Error al iniciar sesión. Intenta nuevamente.';
      await this.showToast(errorMessage, 'danger');
    }
  }

  /**
   * Un helper rápido para mostrar mensajes flotantes en pantalla.
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
   * Nos manda a la pantalla de registro si aún no tienes cuenta.
   */
  async goToRegister() {
    console.log('🚀 Navegando a /register');
    
    // Si el usuario está autenticado, hacer logout primero (sin redirigir)
    if (this.authService.isAuthenticated) {
      await this.authService.logout(false); // false = no redirigir
    }
    
    this.router.navigate(['/register']);
  }

  /**
   * Redirige a la recuperación de contraseña (por ahora solo muestra un aviso).
   */
  goToForgotPassword() {
    // TODO: Implementar página de recuperación
    this.showToast('Función en desarrollo', 'warning');
  }
}
