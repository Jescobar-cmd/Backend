import { describe, expect, it } from 'vitest';
import { actualizarPerfilFreelancerSchema } from '../../src/application/validators/perfil.schemas';
import {
  actualizarPortafolioItemSchema,
  crearPortafolioItemSchema,
} from '../../src/application/validators/portafolio.schemas';

describe('Validadores del freelancer', () => {
  it('acepta habilidades con nivel en el perfil', () => {
    const resultado = actualizarPerfilFreelancerSchema.safeParse({
      habilidades: [{ id: 1, nivel: 'avanzado' }],
    });
    expect(resultado.success).toBe(true);
  });

  it('rechaza un nivel de habilidad desconocido', () => {
    const resultado = actualizarPerfilFreelancerSchema.safeParse({
      habilidades: [{ id: 1, nivel: 'experto-mundial' }],
    });
    expect(resultado.success).toBe(false);
  });

  it('rechaza un ítem de portafolio sin título', () => {
    expect(crearPortafolioItemSchema.safeParse({}).success).toBe(false);
  });

  it('rechaza una actualización de portafolio vacía', () => {
    expect(actualizarPortafolioItemSchema.safeParse({}).success).toBe(false);
  });

  it('acepta una URL de imagen de Cloudinary', () => {
    const resultado = crearPortafolioItemSchema.safeParse({
      titulo: 'Proyecto',
      imagenUrl: 'https://res.cloudinary.com/demo/image/upload/v1/proyecto.png',
    });
    expect(resultado.success).toBe(true);
  });
});
