import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IntroPage } from './intro.page';
import { Router } from '@angular/router';
import { StorageService } from '../services/storage.service';
import { AnimationController, GestureController, ToastController } from '@ionic/angular';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('IntroPage', () => {
  let component: IntroPage;
  let fixture: ComponentFixture<IntroPage>;
  let storageService: jasmine.SpyObj<StorageService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const storageSpy = jasmine.createSpyObj('StorageService', ['get', 'set', 'remove']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [IntroPage],
      providers: [
        { provide: StorageService, useValue: storageSpy },
        { provide: Router, useValue: routerSpy },
        AnimationController,
        GestureController,
        ToastController,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(IntroPage);
    component = fixture.componentInstance;
    storageService = TestBed.inject(StorageService) as jasmine.SpyObj<StorageService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    
    // Mock storage responses
    storageService.get.and.returnValue(Promise.resolve(null));
    storageService.set.and.returnValue(Promise.resolve());
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have 4 slides', () => {
    expect(component.slides.length).toBe(4);
  });

  it('should start at index 0', () => {
    expect(component.currentIndex).toBe(0);
  });

  it('should navigate to next slide', () => {
    component.currentIndex = 0;
    component.next();
    expect(component.currentIndex).toBe(1);
  });

  it('should navigate to previous slide', () => {
    component.currentIndex = 1;
    component.prev();
    expect(component.currentIndex).toBe(0);
  });

  it('should not go below index 0', () => {
    component.currentIndex = 0;
    component.prev();
    expect(component.currentIndex).toBe(0);
  });

  it('should not exceed max index', () => {
    component.currentIndex = component.slides.length - 1;
    component.next();
    expect(component.currentIndex).toBe(component.slides.length - 1);
  });

  it('should save introSeen when going home', async () => {
    await component.goHome();
    expect(storageService.set).toHaveBeenCalledWith('introSeen', true);
  });

  it('should navigate to home when goHome is called', async () => {
    await component.goHome();
    expect(router.navigate).toHaveBeenCalledWith(['/home'], jasmine.any(Object));
  });

  it('should return safe slide for valid index', () => {
    const slide = component.getSafeSlide(0);
    expect(slide).toBe(component.slides[0]);
  });

  it('should return first slide for invalid index', () => {
    const slide = component.getSafeSlide(999);
    expect(slide).toBe(component.slides[0]);
  });

  it('should calculate progress correctly', () => {
    component.currentIndex = 0;
    expect(component.getProgressValue()).toBe(0.25); // 1/4
    
    component.currentIndex = 1;
    expect(component.getProgressValue()).toBe(0.5); // 2/4
  });

  it('should get current theme label', () => {
    component.slideTheme = 'theme-dark';
    expect(component.getCurrentThemeLabel()).toBe('Oscuro');
  });

  it('should handle image load', () => {
    component.imageLoaded = false;
    component.imageError = false;
    component.onImageLoad();
    expect(component.imageLoaded).toBe(true);
    expect(component.imageError).toBe(false);
  });

  it('should handle image error', () => {
    component.imageLoaded = false;
    component.imageError = false;
    component.onImageError();
    expect(component.imageError).toBe(true);
    expect(component.imageLoaded).toBe(false);
  });

  it('should respect reduced motion preference', () => {
    component.prefersReducedMotion = true;
    expect(component['shouldAnimate']()).toBe(false);
    
    component.prefersReducedMotion = false;
    expect(component['shouldAnimate']()).toBe(true);
  });
});
