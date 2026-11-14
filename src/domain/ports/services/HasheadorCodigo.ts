/**
 * Puerto para no guardar códigos de verificación/recuperación en texto plano.
 * El código se envía al usuario, pero en la base de datos solo vive su hash.
 */
export interface HasheadorCodigo {
  hashear(codigo: string): string;
  coincide(codigo: string, hash: string): boolean;
}
