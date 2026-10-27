import crypto from 'crypto';
import { Usuario } from '../../domain/entities/Usuario';
import { TokenRecuperacion } from '../../domain/entities/TokenRecuperacion';
import { RepositorioUsuario } from '../../domain/ports/repositories/RepositorioUsuario';
import { RepositorioToken } from '../../domain/ports/repositories/RepositorioToken';
import { HasheadorContrasena } from '../../domain/ports/services/HasheadorContrasena';
import { EnviadorCorreo } from '../../domain/ports/services/EnviadorCorreo';
import { ErrorSolicitudInvalida, ErrorConflicto } from '../../shared/errors/ErrorAplicacion';

export interface DTORegistroUsuario {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  rolId?: number; // 2: Freelancer, 3: Cliente
  telefono?: string | null;
  cedula?: string | null;
}

export class CasoUsoRegistrarUsuario {
  constructor(
    private repositorioUsuario: RepositorioUsuario,
    private repositorioToken: RepositorioToken,
    private hasheadorContrasena: HasheadorContrasena,
    private enviadorCorreo: EnviadorCorreo,
  ) {}

  async ejecutar(dto: DTORegistroUsuario): Promise<Usuario> {
    const correo = dto.email.trim().toLowerCase();
    const usuarioExistente = await this.repositorioUsuario.buscarPorEmail(correo);
    if (usuarioExistente) {
      throw new ErrorConflicto('El correo electrónico ya está registrado');
    }

    const rolId = dto.rolId === 2 ? 2 : 3;
    const cedula = dto.cedula?.trim() ? dto.cedula.trim() : null;
    const telefono = dto.telefono?.trim() ? dto.telefono.trim() : null;

    if (rolId === 2 && !cedula) {
      throw new ErrorSolicitudInvalida('La cédula es obligatoria para freelancers');
    }

    if (cedula) {
      const cedulaExistente = await this.repositorioUsuario.buscarPorCedula(cedula);
      if (cedulaExistente) {
        throw new ErrorConflicto('La cédula ya se encuentra registrada con otra cuenta');
      }
    }

    const contrasenaHasheada = await this.hasheadorContrasena.hashear(dto.password);

    const nombreCompleto = `${dto.nombre.trim()} ${dto.apellido.trim()}`.trim();
    const usuarioNuevo = new Usuario(
      null,
      nombreCompleto,
      correo,
      contrasenaHasheada,
      rolId,
      telefono,
      cedula,
      true,
      'inactivo',
      null
    );

    const usuarioGuardado = await this.repositorioUsuario.guardar(usuarioNuevo);

    // Invalida tokens previos e inserta el nuevo código de 6 dígitos
    if (usuarioGuardado.id !== null) {
      await this.repositorioToken.invalidarTodosPorUsuario(usuarioGuardado.id);
      const codigo = crypto.randomInt(100000, 1000000).toString();
      const token = new TokenRecuperacion(
        null,
        usuarioGuardado.id,
        codigo,
        new Date(Date.now() + 15 * 60 * 1000)
      );
      await this.repositorioToken.guardar(token);
      await this.enviadorCorreo.enviarCorreoVerificacion(usuarioGuardado.email, codigo);
    }

    return usuarioGuardado;
  }
}
