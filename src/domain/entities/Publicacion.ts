// Publicación del blog personal (estilo Instagram). El autor puede ser
// cualquier usuario; la imagen es una URL que sube el front a Cloudinary.

export interface PublicacionAutor {
  id: number;
  nombre: string;
  fotoPerfil: string | null;
  rol: number;
}

export interface Publicacion {
  id: number;
  titulo: string | null;
  contenido: string;
  imagenUrl: string | null;
  fechaPublicacion: Date;
  autor: PublicacionAutor;
  likes: {
    total: number;
    /** ¿El usuario que consulta ya le dio like? */
    meGusta: boolean;
  };
}

/** Datos para crear una publicación (contenido obligatorio). */
export interface NuevaPublicacion {
  titulo?: string | null;
  contenido: string;
  imagenUrl?: string | null;
}

export interface FiltrosPublicacion {
  page: number;
  limit: number;
  /** Opcional: solo publicaciones de este autor. */
  autorId?: number;
}

export interface PublicacionPaginada {
  page: number;
  limit: number;
  total: number;
  items: Publicacion[];
}
