import { prisma } from '../../config/dbconnection';
import { PrismaUserRepository } from '../persistence/postgres/PrismaUserRepository';
import { PrismaTokenRepository } from '../persistence/postgres/PrismaTokenRepository';
import { PrismaPerfilRepository } from '../persistence/postgres/PrismaPerfilRepository';
import { PrismaOfertaRepository } from '../persistence/postgres/PrismaOfertaRepository';
import { PrismaCategoriaRepository } from '../persistence/postgres/PrismaCategoriaRepository';
import { PrismaPublicacionRepository } from '../persistence/postgres/PrismaPublicacionRepository';
import { PrismaServicioRepository } from '../persistence/postgres/PrismaServicioRepository';
import { BcryptPasswordHasher } from '../security/BcryptPasswordHasher';
import { JwtService } from '../security/JwtService';
import { NodemailerEmailSender } from '../email/NodemailerEmailSender';
import { BrevoEmailSender } from '../email/BrevoEmailSender';
import { GoogleAuthService } from '../google/GoogleAuthService';
import { RegisterUserUseCase } from '../../application/use-cases/RegisterUserUseCase';
import { ConfirmCodeUseCase } from '../../application/use-cases/ConfirmCodeUseCase';
import { ResendCodeUseCase } from '../../application/use-cases/ResendCodeUseCase';
import { LoginUseCase } from '../../application/use-cases/LoginUseCase';
import { LoginWithGoogleUseCase } from '../../application/use-cases/LoginWithGoogleUseCase';
import { CompleteGoogleProfileUseCase } from '../../application/use-cases/CompleteGoogleProfileUseCase';
import { ChangePasswordUseCase } from '../../application/use-cases/ChangePasswordUseCase';
import { RequestPasswordResetUseCase } from '../../application/use-cases/RequestPasswordResetUseCase';
import { ResetPasswordUseCase } from '../../application/use-cases/ResetPasswordUseCase';
import { ObtenerMiPerfilUseCase } from '../../application/use-cases/ObtenerMiPerfilUseCase';
import { ActualizarMiPerfilUseCase } from '../../application/use-cases/ActualizarMiPerfilUseCase';
import { ObtenerPerfilPublicoUseCase } from '../../application/use-cases/ObtenerPerfilPublicoUseCase';
import { CrearOfertaUseCase } from '../../application/use-cases/CrearOfertaUseCase';
import { ListarMisOfertasUseCase } from '../../application/use-cases/ListarMisOfertasUseCase';
import { ObtenerMiOfertaUseCase } from '../../application/use-cases/ObtenerMiOfertaUseCase';
import { ActualizarOfertaUseCase } from '../../application/use-cases/ActualizarOfertaUseCase';
import { CambiarEstadoOfertaUseCase } from '../../application/use-cases/CambiarEstadoOfertaUseCase';
import { ListarPropuestasDeOfertaUseCase } from '../../application/use-cases/ListarPropuestasDeOfertaUseCase';
import { ListarCategoriasUseCase } from '../../application/use-cases/ListarCategoriasUseCase';
import { CrearPublicacionUseCase } from '../../application/use-cases/CrearPublicacionUseCase';
import { ListarPublicacionesUseCase } from '../../application/use-cases/ListarPublicacionesUseCase';
import { ObtenerPublicacionUseCase } from '../../application/use-cases/ObtenerPublicacionUseCase';
import { EliminarPublicacionUseCase } from '../../application/use-cases/EliminarPublicacionUseCase';
import { AlternarMeGustaUseCase } from '../../application/use-cases/AlternarMeGustaUseCase';
import { CrearServicioUseCase } from '../../application/use-cases/CrearServicioUseCase';
import { ListarServiciosUseCase } from '../../application/use-cases/ListarServiciosUseCase';
import { ObtenerServicioUseCase } from '../../application/use-cases/ObtenerServicioUseCase';
import { ListarMisServiciosUseCase } from '../../application/use-cases/ListarMisServiciosUseCase';
import { ActualizarServicioUseCase } from '../../application/use-cases/ActualizarServicioUseCase';
import { CambiarEstadoServicioUseCase } from '../../application/use-cases/CambiarEstadoServicioUseCase';
import { ListarOfertasPublicasUseCase } from '../../application/use-cases/ListarOfertasPublicasUseCase';
import { ObtenerOfertaPublicaUseCase } from '../../application/use-cases/ObtenerOfertaPublicaUseCase';
import { ObtenerFeedUseCase } from '../../application/use-cases/ObtenerFeedUseCase';

// Composition root: conecta puertos e infraestructura con casos de uso
const users = new PrismaUserRepository(prisma);
const tokens = new PrismaTokenRepository(prisma);
const perfiles = new PrismaPerfilRepository(prisma);
const ofertas = new PrismaOfertaRepository(prisma);
const categorias = new PrismaCategoriaRepository(prisma);
const publicaciones = new PrismaPublicacionRepository(prisma);
const servicios = new PrismaServicioRepository(prisma);
const hasher = new BcryptPasswordHasher();
// En Render (BREVO_API_KEY presente) se envía por API HTTPS;
// en local sin esa variable se usa Gmail SMTP, que ahí sí funciona.
const mail = process.env.BREVO_API_KEY ? new BrevoEmailSender() : new NodemailerEmailSender();
const jwt = new JwtService();
const google = new GoogleAuthService();

export const container = {
  users,
  tokens,
  perfiles,
  ofertas,
  categorias,
  publicaciones,
  servicios,
  hasher,
  mail,
  jwt,
  register: new RegisterUserUseCase(users, tokens, hasher, mail),
  confirmCode: new ConfirmCodeUseCase(users, tokens),
  resendCode: new ResendCodeUseCase(users, tokens, mail),
  login: new LoginUseCase(users, hasher),
  loginWithGoogle: new LoginWithGoogleUseCase(users, google),
  completeGoogleProfile: new CompleteGoogleProfileUseCase(users, google),
  changePassword: new ChangePasswordUseCase(users, hasher),
  requestReset: new RequestPasswordResetUseCase(users, tokens, mail),
  resetPassword: new ResetPasswordUseCase(users, tokens, hasher),
  obtenerMiPerfil: new ObtenerMiPerfilUseCase(perfiles),
  actualizarMiPerfil: new ActualizarMiPerfilUseCase(perfiles),
  obtenerPerfilPublico: new ObtenerPerfilPublicoUseCase(perfiles),
  crearOferta: new CrearOfertaUseCase(ofertas),
  listarMisOfertas: new ListarMisOfertasUseCase(ofertas),
  obtenerMiOferta: new ObtenerMiOfertaUseCase(ofertas),
  actualizarOferta: new ActualizarOfertaUseCase(ofertas),
  cambiarEstadoOferta: new CambiarEstadoOfertaUseCase(ofertas),
  listarPropuestasDeOferta: new ListarPropuestasDeOfertaUseCase(ofertas),
  listarCategorias: new ListarCategoriasUseCase(categorias),
  crearPublicacion: new CrearPublicacionUseCase(publicaciones),
  listarPublicaciones: new ListarPublicacionesUseCase(publicaciones),
  obtenerPublicacion: new ObtenerPublicacionUseCase(publicaciones),
  eliminarPublicacion: new EliminarPublicacionUseCase(publicaciones),
  alternarMeGusta: new AlternarMeGustaUseCase(publicaciones),
  crearServicio: new CrearServicioUseCase(servicios),
  listarServicios: new ListarServiciosUseCase(servicios),
  obtenerServicio: new ObtenerServicioUseCase(servicios),
  listarMisServicios: new ListarMisServiciosUseCase(servicios),
  actualizarServicio: new ActualizarServicioUseCase(servicios),
  cambiarEstadoServicio: new CambiarEstadoServicioUseCase(servicios),
  listarOfertasPublicas: new ListarOfertasPublicasUseCase(ofertas),
  obtenerOfertaPublica: new ObtenerOfertaPublicaUseCase(ofertas),
  obtenerFeed: new ObtenerFeedUseCase(publicaciones, ofertas, servicios),
};
