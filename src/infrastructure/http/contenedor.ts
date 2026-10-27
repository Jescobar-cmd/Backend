import { prisma } from '../../config/conexionBd';
import { PrismaRepositorioUsuario } from '../persistence/postgres/PrismaRepositorioUsuario';
import { PrismaRepositorioToken } from '../persistence/postgres/PrismaRepositorioToken';
import { PrismaPerfilRepository } from '../persistence/postgres/PrismaPerfilRepository';
import { PrismaOfertaRepository } from '../persistence/postgres/PrismaOfertaRepository';
import { PrismaCategoriaRepository } from '../persistence/postgres/PrismaCategoriaRepository';
import { PrismaPublicacionRepository } from '../persistence/postgres/PrismaPublicacionRepository';
import { PrismaServicioRepository } from '../persistence/postgres/PrismaServicioRepository';
import { PrismaConversacionRepository } from '../persistence/postgres/PrismaConversacionRepository';
import { PrismaPropuestaRepository } from '../persistence/postgres/PrismaPropuestaRepository';
import { PrismaOfertaChatRepository } from '../persistence/postgres/PrismaOfertaChatRepository';
import { PrismaContratoRepository } from '../persistence/postgres/PrismaContratoRepository';
import { HasheadorContrasenaBcrypt } from '../security/HasheadorContrasenaBcrypt';
import { ServicioJwt } from '../security/ServicioJwt';
import { EnviadorCorreoNodemailer } from '../email/EnviadorCorreoNodemailer';
import { EnviadorCorreoBrevo } from '../email/EnviadorCorreoBrevo';
import { ServicioAutenticacionGoogle } from '../google/ServicioAutenticacionGoogle';
import { CasoUsoRegistrarUsuario } from '../../application/use-cases/CasoUsoRegistrarUsuario';
import { CasoUsoConfirmarCodigo } from '../../application/use-cases/CasoUsoConfirmarCodigo';
import { CasoUsoReenviarCodigo } from '../../application/use-cases/CasoUsoReenviarCodigo';
import { CasoUsoIniciarSesion } from '../../application/use-cases/CasoUsoIniciarSesion';
import { CasoUsoIniciarSesionGoogle } from '../../application/use-cases/CasoUsoIniciarSesionGoogle';
import { CasoUsoCompletarPerfilGoogle } from '../../application/use-cases/CasoUsoCompletarPerfilGoogle';
import { CasoUsoCambiarContrasena } from '../../application/use-cases/CasoUsoCambiarContrasena';
import { CasoUsoSolicitarRecuperacionContrasena } from '../../application/use-cases/CasoUsoSolicitarRecuperacionContrasena';
import { CasoUsoRestablecerContrasena } from '../../application/use-cases/CasoUsoRestablecerContrasena';
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
import { CrearConversacionUseCase } from '../../application/use-cases/CrearConversacionUseCase';
import { ListarConversacionesUseCase } from '../../application/use-cases/ListarConversacionesUseCase';
import { ObtenerConversacionUseCase } from '../../application/use-cases/ObtenerConversacionUseCase';
import { ListarMensajesUseCase } from '../../application/use-cases/ListarMensajesUseCase';
import { EnviarMensajeUseCase } from '../../application/use-cases/EnviarMensajeUseCase';
import { MarcarConversacionLeidaUseCase } from '../../application/use-cases/MarcarConversacionLeidaUseCase';
import { CrearPropuestaUseCase } from '../../application/use-cases/CrearPropuestaUseCase';
import { ListarMisPropuestasUseCase } from '../../application/use-cases/ListarMisPropuestasUseCase';
import { AceptarPropuestaUseCase } from '../../application/use-cases/AceptarPropuestaUseCase';
import { RechazarPropuestaUseCase } from '../../application/use-cases/RechazarPropuestaUseCase';
import { CrearOfertaChatUseCase } from '../../application/use-cases/CrearOfertaChatUseCase';
import { AceptarOfertaChatUseCase } from '../../application/use-cases/AceptarOfertaChatUseCase';
import { RechazarOfertaChatUseCase } from '../../application/use-cases/RechazarOfertaChatUseCase';
import { ContraofertarUseCase } from '../../application/use-cases/ContraofertarUseCase';
import { ListarContratosUseCase } from '../../application/use-cases/ListarContratosUseCase';
import { ObtenerContratoUseCase } from '../../application/use-cases/ObtenerContratoUseCase';

// Raíz de composición: conecta puertos e infraestructura con casos de uso
const usuarios = new PrismaRepositorioUsuario(prisma);
const tokens = new PrismaRepositorioToken(prisma);
const perfiles = new PrismaPerfilRepository(prisma);
const ofertas = new PrismaOfertaRepository(prisma);
const categorias = new PrismaCategoriaRepository(prisma);
const publicaciones = new PrismaPublicacionRepository(prisma);
const servicios = new PrismaServicioRepository(prisma);
const conversaciones = new PrismaConversacionRepository(prisma);
const propuestas = new PrismaPropuestaRepository(prisma);
const ofertasChat = new PrismaOfertaChatRepository(prisma);
const contratos = new PrismaContratoRepository(prisma);
const hasheador = new HasheadorContrasenaBcrypt();
// En Render (BREVO_API_KEY presente) se envía por API HTTPS;
// en local sin esa variable se usa Gmail SMTP, que ahí sí funciona.
const correo = process.env.BREVO_API_KEY ? new EnviadorCorreoBrevo() : new EnviadorCorreoNodemailer();
const jwt = new ServicioJwt();
const google = new ServicioAutenticacionGoogle();

export const contenedor = {
  usuarios,
  tokens,
  perfiles,
  ofertas,
  categorias,
  publicaciones,
  servicios,
  conversaciones,
  propuestas,
  ofertasChat,
  contratos,
  hasheador,
  correo,
  jwt,
  registrar: new CasoUsoRegistrarUsuario(usuarios, tokens, hasheador, correo),
  confirmarCodigo: new CasoUsoConfirmarCodigo(usuarios, tokens),
  reenviarCodigo: new CasoUsoReenviarCodigo(usuarios, tokens, correo),
  iniciarSesion: new CasoUsoIniciarSesion(usuarios, hasheador),
  iniciarSesionGoogle: new CasoUsoIniciarSesionGoogle(usuarios, google),
  completarPerfilGoogle: new CasoUsoCompletarPerfilGoogle(usuarios, google),
  cambiarContrasena: new CasoUsoCambiarContrasena(usuarios, hasheador),
  solicitarRecuperacion: new CasoUsoSolicitarRecuperacionContrasena(usuarios, tokens, correo),
  restablecerContrasena: new CasoUsoRestablecerContrasena(usuarios, tokens, hasheador),
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
  crearConversacion: new CrearConversacionUseCase(conversaciones, ofertas, servicios, usuarios),
  listarConversaciones: new ListarConversacionesUseCase(conversaciones),
  obtenerConversacion: new ObtenerConversacionUseCase(conversaciones),
  listarMensajes: new ListarMensajesUseCase(conversaciones),
  enviarMensaje: new EnviarMensajeUseCase(conversaciones),
  marcarConversacionLeida: new MarcarConversacionLeidaUseCase(conversaciones),
  crearPropuesta: new CrearPropuestaUseCase(propuestas, ofertas),
  listarMisPropuestas: new ListarMisPropuestasUseCase(propuestas),
  aceptarPropuesta: new AceptarPropuestaUseCase(propuestas),
  rechazarPropuesta: new RechazarPropuestaUseCase(propuestas),
  crearOfertaChat: new CrearOfertaChatUseCase(conversaciones, ofertasChat),
  aceptarOfertaChat: new AceptarOfertaChatUseCase(ofertasChat),
  rechazarOfertaChat: new RechazarOfertaChatUseCase(ofertasChat),
  contraofertar: new ContraofertarUseCase(ofertasChat),
  listarContratos: new ListarContratosUseCase(contratos),
  obtenerContrato: new ObtenerContratoUseCase(contratos),
};
