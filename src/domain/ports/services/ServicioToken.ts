export interface DatosToken {
  id: number;
  email: string;
  rol: number;
}

export interface ServicioToken {
  generarToken(datos: DatosToken): string;
  verificarToken(token: string): DatosToken;
}
