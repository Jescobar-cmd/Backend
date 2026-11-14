import crypto from 'crypto';
import { HasheadorCodigo } from '../../domain/ports/services/HasheadorCodigo';

/** Hash HMAC-SHA256 de los códigos de 6 dígitos antes de persistirlos. */
export class HasheadorCodigoHmac implements HasheadorCodigo {
  constructor(private readonly secreto: string) {}

  hashear(codigo: string): string {
    return crypto.createHmac('sha256', this.secreto).update(codigo).digest('hex');
  }

  coincide(codigo: string, hash: string): boolean {
    const calculado = this.hashear(codigo);
    if (calculado.length !== hash.length) return false;
    return crypto.timingSafeEqual(Buffer.from(calculado), Buffer.from(hash));
  }
}
