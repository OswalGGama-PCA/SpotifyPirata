import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private initialized = false;

  constructor(private storage: Storage) {}

  // Inicializa el motor de almacenamiento (IndexedDB/localStorage). Se ejecuta automáticamente.
  async init(): Promise<void> {
    if (this.initialized) return;
    await this.storage.create();
    this.initialized = true;
  }

  // Guarda un valor con una clave. Acepta cualquier tipo (string, number, object, array).
  async set(key: string, value: any): Promise<void> {
    await this.init();
    await this.storage.set(key, value);
  }

  // Obtiene el valor de una clave. Retorna null si no existe.
  async get<T = any>(key: string): Promise<T | null> {
    await this.init();
    const value = await this.storage.get(key);
    return (value as T) ?? null;
  }

  // Elimina una clave específica y su valor del almacenamiento.
  async remove(key: string): Promise<void> {
    await this.init();
    await this.storage.remove(key);
  }

  // Borra todos los datos del almacenamiento. Resetea la app completamente.
  async clear(): Promise<void> {
    await this.init();
    await this.storage.clear();
  }

  // Retorna un array con todas las claves guardadas.
  async keys(): Promise<string[]> {
    await this.init();
    return await this.storage.keys();
  }

  // Retorna el número total de claves almacenadas.
  async length(): Promise<number> {
    await this.init();
    return await this.storage.length();
  }
}