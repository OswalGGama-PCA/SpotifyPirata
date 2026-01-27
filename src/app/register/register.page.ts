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
    // Registro de íconos
    addIcons({
      personOutline,
      mailOutline,
      lockClosedOutline,
      logoGoogle,
      logoApple,
      musicalNotes
    });

    // Inicialización del formulario con validaciones
    this.registerForm = this.formBuilder.group({
      nombre: [
        '',
        Validators.compose([
          Validators.required,
          Validators.minLength(2) // Mínimo 2 caracteres para nombre
        ])
      ],
      apellido: [
        '',
        Validators.compose([
          Validators.required,
          Validators.minLength(2) // Mínimo 2 caracteres para apellido
        ])
      ],
      email: [
        '',
        Validators.compose([
          Validators.required,
          Validators.email // Validación de formato de email
        ])
      ],
      password: [
        '',
        Validators.compose([
          Validators.required,
          Validators.minLength(8) // 8 caracteres mínimo por seguridad
        ])
      ]
    });
  }

  /**
   * Al iniciar, por ahora no hago nada aquí, pero lo dejo listo.
   */
  ngOnInit() {}

  /**
   * Aquí es donde registro a los nuevos usuarios. Reviso que todo esté bien antes de enviarlo.
   */
  async register() {
    // Validar formulario
    if (this.registerForm.invalid) {
      await this.showToast('Por favor, completa todos los campos correctamente', 'warning');
      
      // Marcar todos los campos como touched para mostrar errores
      Object.keys(this.registerForm.controls).forEach(key => {
        this.registerForm.get(key)?.markAsTouched();
      });
      
      return;
    }

    // Mostrar loading
    this.isLoading = true;
    const loading = await this.loadingController.create({
      message: 'Creando tu cuenta...',
      spinner: 'crescent',
      cssClass: 'custom-loading'
    });
    await loading.present();

    try {
      // Preparar datos para el registro
      const registerData = {
        email: this.registerForm.value.email,
        password: this.registerForm.value.password,
        name: `${this.registerForm.value.nombre} ${this.registerForm.value.apellido}`
      };

      // Intentar registro
      await new Promise<void>((resolve, reject) => {
        this.authService.register(registerData).subscribe({
          next: (response) => {
            console.log('Registro exitoso:', response);
            resolve();
          },
          error: (error) => {
            console.error('Error en registro:', error);
            reject(error);
          }
        });
      });

      // Cerrar loading
      this.isLoading = false;
      await loading.dismiss();

      // Mostrar mensaje de éxito
      await this.showToast('¡Cuenta creada exitosamente! 🎉', 'success');

      // Pequeña pausa para que se vea el toast
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Navegar al login
      // Justificación: Después del registro, el usuario debe iniciar sesión
      // Esto es una práctica común y permite verificar las credenciales
      this.router.navigate(['/login'], { 
        replaceUrl: true,
        state: { 
          registered: true,
          email: this.registerForm.value.email 
        }
      });

    } catch (error: any) {
      // Cerrar loading
      this.isLoading = false;
      await loading.dismiss();

      // Mostrar error
      const errorMessage = error?.message || 'Error al crear la cuenta. Intenta nuevamente.';
      await this.showToast(errorMessage, 'danger');
    }
  }

  /**
   * Me ayuda a saber si la contraseña es segura o si es muy fácil de adivinar.
   */
  getPasswordStrength(): string {
    const password = this.registerForm.get('password')?.value || '';
    
    if (password.length === 0) return 'strength-none';
    if (password.length < 6) return 'strength-weak';
    if (password.length < 8) return 'strength-medium';
    
    // Verificar si tiene mayúsculas, minúsculas, números y caracteres especiales
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    const strength = [hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;
    
    if (strength >= 3 && password.length >= 10) return 'strength-strong';
    if (strength >= 2 && password.length >= 8) return 'strength-good';
    return 'strength-medium';
  }

  /**
   * Muestra qué tan segura es la contraseña con un texto amigable.
   */
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

  /**
   * Otra vez el helper para los avisos en pantalla.
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
   * Botón para regresar al login si ya tienes cuenta.
   */
  goToLogin() {
    this.router.navigate(['/login']);
  }
}
