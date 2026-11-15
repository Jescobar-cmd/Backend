// Proyecto publicado por un cliente (bolsa de trabajo).
// Vista de moderación: incluye los campos de retiro y al autor.

export interface Proyecto {
  id: number;
  titulo: string;
  descripcion: string | null;
  /** Presupuesto estimado; puede ser null si el cliente no lo definió. */
  presupuesto: number | null;
  estado: string;
  fechaPublicacion: Date;
  clienteId: number;
  categoriaId: number | null;
  moderacionRetirada: boolean;
  moderacionEstadoAnterior: string | null;
  moderacionMotivo: string | null;
  cliente: {
    id: number;
    nombre: string;
    fotoPerfil: string | null;
    estado: string;
  } | null;
  categoria: { id: number; nombre: string } | null;
}
