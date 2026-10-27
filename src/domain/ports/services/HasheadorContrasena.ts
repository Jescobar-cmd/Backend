export interface HasheadorContrasena {
  hashear(contrasena: string): Promise<string>;
  comparar(contrasena: string, contrasenaHasheada: string): Promise<boolean>;
}
