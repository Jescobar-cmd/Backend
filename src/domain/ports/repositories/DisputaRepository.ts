import { Disputa, NuevaDisputa } from '../../entities/Disputa';

export interface DisputaRepository {
  crear(datos: NuevaDisputa): Promise<Disputa>;

  listarPorContrato(contratoId: number): Promise<Disputa[]>;

  existeAbierta(contratoId: number): Promise<boolean>;
}
