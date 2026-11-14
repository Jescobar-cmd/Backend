import { prisma } from '../../config/conexionBd';
import { entorno } from '../../config/entorno';
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
import { PrismaRepositorioHabilidad } from '../persistence/postgres/PrismaRepositorioHabilidad';
import { PrismaCalificacionRepository } from '../persistence/postgres/PrismaCalificacionRepository';
import { PrismaPortafolioRepository } from '../persistence/postgres/PrismaPortafolioRepository';
import { PrismaEstadisticaFreelancerRepository } from '../persistence/postgres/PrismaEstadisticaFreelancerRepository';
import { PrismaDashboardFreelancerRepository } from '../persistence/postgres/PrismaDashboardFreelancerRepository';
import { PrismaDirectorioFreelancerRepository } from '../persistence/postgres/PrismaDirectorioFreelancerRepository';
import { PrismaDashboardClienteRepository } from '../persistence/postgres/PrismaDashboardClienteRepository';
import { PrismaPagoRepository } from '../persistence/postgres/PrismaPagoRepository';
import { PrismaNotificacionRepository } from '../persistence/postgres/PrismaNotificacionRepository';
import { PrismaEntregaContratoRepository } from '../persistence/postgres/PrismaEntregaContratoRepository';
import { PrismaDisputaRepository } from '../persistence/postgres/PrismaDisputaRepository';
import { PrismaReporteRepository } from '../persistence/postgres/PrismaReporteRepository';
import { PrismaLiquidacionRepository } from '../persistence/postgres/PrismaLiquidacionRepository';
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
import { ListarHabilidadesUseCase } from '../../application/use-cases/ListarHabilidadesUseCase';
import { ObtenerMiPerfilFreelancerUseCase } from '../../application/use-cases/ObtenerMiPerfilFreelancerUseCase';
import { ActualizarMiPerfilFreelancerUseCase } from '../../application/use-cases/ActualizarMiPerfilFreelancerUseCase';
import { CambiarEstadoContratoUseCase } from '../../application/use-cases/CambiarEstadoContratoUseCase';
import { CalificarContratoUseCase } from '../../application/use-cases/CalificarContratoUseCase';
import { ListarCalificacionesContratoUseCase } from '../../application/use-cases/ListarCalificacionesContratoUseCase';
import { ListarCalificacionesFreelancerUseCase } from '../../application/use-cases/ListarCalificacionesFreelancerUseCase';
import { RetirarPropuestaUseCase } from '../../application/use-cases/RetirarPropuestaUseCase';
import { ListarPortafolioUseCase } from '../../application/use-cases/ListarPortafolioUseCase';
import { CrearPortafolioItemUseCase } from '../../application/use-cases/CrearPortafolioItemUseCase';
import { ActualizarPortafolioItemUseCase } from '../../application/use-cases/ActualizarPortafolioItemUseCase';
import { EliminarPortafolioItemUseCase } from '../../application/use-cases/EliminarPortafolioItemUseCase';
import { RegistrarVisitaPerfilUseCase } from '../../application/use-cases/RegistrarVisitaPerfilUseCase';
import { ObtenerEstadisticasFreelancerUseCase } from '../../application/use-cases/ObtenerEstadisticasFreelancerUseCase';
import { ObtenerDashboardFreelancerUseCase } from '../../application/use-cases/ObtenerDashboardFreelancerUseCase';
import { BuscarFreelancersUseCase } from '../../application/use-cases/BuscarFreelancersUseCase';
import { ObtenerDashboardClienteUseCase } from '../../application/use-cases/ObtenerDashboardClienteUseCase';
import { ContratarServicioUseCase } from '../../application/use-cases/ContratarServicioUseCase';
import { RegistrarEntregaContratoUseCase } from '../../application/use-cases/RegistrarEntregaContratoUseCase';
import { ListarEntregasContratoUseCase } from '../../application/use-cases/ListarEntregasContratoUseCase';
import { AprobarEntregaUseCase } from '../../application/use-cases/AprobarEntregaUseCase';
import { AbrirDisputaUseCase } from '../../application/use-cases/AbrirDisputaUseCase';
import { ListarDisputasContratoUseCase } from '../../application/use-cases/ListarDisputasContratoUseCase';
import { ListarPagosClienteUseCase } from '../../application/use-cases/ListarPagosClienteUseCase';
import { ObtenerFacturaPagoUseCase } from '../../application/use-cases/ObtenerFacturaPagoUseCase';
import { ListarNotificacionesUseCase } from '../../application/use-cases/ListarNotificacionesUseCase';
import { MarcarNotificacionLeidaUseCase } from '../../application/use-cases/MarcarNotificacionLeidaUseCase';
import { MarcarTodasNotificacionesLeidasUseCase } from '../../application/use-cases/MarcarTodasNotificacionesLeidasUseCase';
import { ListarPagosFreelancerUseCase } from '../../application/use-cases/ListarPagosFreelancerUseCase';
import { ObtenerFacturaPagoFreelancerUseCase } from '../../application/use-cases/ObtenerFacturaPagoFreelancerUseCase';
import { ObtenerLiquidacionesFreelancerUseCase } from '../../application/use-cases/ObtenerLiquidacionesFreelancerUseCase';
import { SolicitarRetiroUseCase } from '../../application/use-cases/SolicitarRetiroUseCase';
import { ActualizarEntregaContratoUseCase } from '../../application/use-cases/ActualizarEntregaContratoUseCase';
import { RechazarEntregaUseCase } from '../../application/use-cases/RechazarEntregaUseCase';
import { ObtenerReporteAdminUseCase } from '../../application/use-cases/ObtenerReporteAdminUseCase';
import { CrearReporteUseCase } from '../../application/use-cases/CrearReporteUseCase';
import { ListarReportesAdminUseCase } from '../../application/use-cases/ListarReportesAdminUseCase';
import { ResolverReporteUseCase } from '../../application/use-cases/ResolverReporteUseCase';
import { ListarDisputasAdminUseCase } from '../../application/use-cases/ListarDisputasAdminUseCase';
import { ObtenerDisputaAdminUseCase } from '../../application/use-cases/ObtenerDisputaAdminUseCase';
import { ResolverDisputaUseCase } from '../../application/use-cases/ResolverDisputaUseCase';
import { ListarLiquidacionesAdminUseCase } from '../../application/use-cases/ListarLiquidacionesAdminUseCase';
import { AprobarRetiroUseCase } from '../../application/use-cases/AprobarRetiroUseCase';
import { ObtenerDashboardModeradorUseCase } from '../../application/use-cases/ObtenerDashboardModeradorUseCase';

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
const habilidades = new PrismaRepositorioHabilidad(prisma);
const calificaciones = new PrismaCalificacionRepository(prisma);
const portafolio = new PrismaPortafolioRepository(prisma);
const estadisticas = new PrismaEstadisticaFreelancerRepository(prisma);
const dashboardFreelancer = new PrismaDashboardFreelancerRepository(prisma);
const directorioFreelancers = new PrismaDirectorioFreelancerRepository(prisma);
const dashboardCliente = new PrismaDashboardClienteRepository(prisma);
const pagos = new PrismaPagoRepository(prisma);
const notificaciones = new PrismaNotificacionRepository(prisma);
const entregas = new PrismaEntregaContratoRepository(prisma);
const disputas = new PrismaDisputaRepository(prisma);
const reportes = new PrismaReporteRepository(prisma);
const liquidaciones = new PrismaLiquidacionRepository(prisma);
const comisionFreelancerPorcentaje =
  entorno.COMISION_PLATAFORMA_PORCENTAJE - entorno.COMISION_CLIENTE_PORCENTAJE;
const hasheador = new HasheadorContrasenaBcrypt();
// Selección desacoplada de proveedor de correo (Factor IV - Backing Services)
const usarBrevo =
  entorno.EMAIL_PROVIDER === 'brevo' ||
  (!entorno.EMAIL_PROVIDER && Boolean(entorno.BREVO_API_KEY));
const correo = usarBrevo ? new EnviadorCorreoBrevo() : new EnviadorCorreoNodemailer();
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
  habilidades,
  calificaciones,
  portafolio,
  estadisticas,
  dashboardFreelancer,
  directorioFreelancers,
  dashboardCliente,
  pagos,
  notificaciones,
  entregas,
  disputas,
  liquidaciones,
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
  obtenerMiPerfilFreelancer: new ObtenerMiPerfilFreelancerUseCase(perfiles),
  actualizarMiPerfilFreelancer: new ActualizarMiPerfilFreelancerUseCase(perfiles, habilidades),
  obtenerPerfilPublico: new ObtenerPerfilPublicoUseCase(perfiles, estadisticas),
  listarHabilidades: new ListarHabilidadesUseCase(habilidades),
  crearOferta: new CrearOfertaUseCase(ofertas),
  listarMisOfertas: new ListarMisOfertasUseCase(ofertas),
  obtenerMiOferta: new ObtenerMiOfertaUseCase(ofertas),
  actualizarOferta: new ActualizarOfertaUseCase(ofertas),
  cambiarEstadoOferta: new CambiarEstadoOfertaUseCase(ofertas),
  listarPropuestasDeOferta: new ListarPropuestasDeOfertaUseCase(ofertas, estadisticas),
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
  retirarPropuesta: new RetirarPropuestaUseCase(propuestas),
  listarPortafolio: new ListarPortafolioUseCase(portafolio),
  crearPortafolioItem: new CrearPortafolioItemUseCase(portafolio),
  actualizarPortafolioItem: new ActualizarPortafolioItemUseCase(portafolio),
  eliminarPortafolioItem: new EliminarPortafolioItemUseCase(portafolio),
  registrarVisitaPerfil: new RegistrarVisitaPerfilUseCase(estadisticas),
  obtenerEstadisticasFreelancer: new ObtenerEstadisticasFreelancerUseCase(estadisticas),
  obtenerDashboardFreelancer: new ObtenerDashboardFreelancerUseCase(dashboardFreelancer),
  buscarFreelancers: new BuscarFreelancersUseCase(directorioFreelancers),
  obtenerDashboardCliente: new ObtenerDashboardClienteUseCase(dashboardCliente),
  contratarServicio: new ContratarServicioUseCase(
    servicios,
    contratos,
    notificaciones,
    entorno.COMISION_CLIENTE_PORCENTAJE
  ),
  registrarEntregaContrato: new RegistrarEntregaContratoUseCase(
    contratos,
    entregas,
    notificaciones
  ),
  listarEntregasContrato: new ListarEntregasContratoUseCase(contratos, entregas),
  actualizarEntregaContrato: new ActualizarEntregaContratoUseCase(
    contratos,
    entregas,
    notificaciones
  ),
  aprobarEntrega: new AprobarEntregaUseCase(
    contratos,
    entregas,
    notificaciones,
    liquidaciones,
    comisionFreelancerPorcentaje
  ),
  rechazarEntrega: new RechazarEntregaUseCase(contratos, entregas, notificaciones),
  abrirDisputa: new AbrirDisputaUseCase(contratos, disputas, notificaciones),
  listarDisputasContrato: new ListarDisputasContratoUseCase(contratos, disputas),
  listarPagosCliente: new ListarPagosClienteUseCase(pagos),
  obtenerFacturaPago: new ObtenerFacturaPagoUseCase(pagos),
  listarPagosFreelancer: new ListarPagosFreelancerUseCase(pagos),
  obtenerFacturaPagoFreelancer: new ObtenerFacturaPagoFreelancerUseCase(pagos),
  obtenerLiquidacionesFreelancer: new ObtenerLiquidacionesFreelancerUseCase(
    liquidaciones
  ),
  solicitarRetiro: new SolicitarRetiroUseCase(liquidaciones),
  crearReporte: new CrearReporteUseCase(reportes, notificaciones, usuarios),
  listarReportesAdmin: new ListarReportesAdminUseCase(reportes),
  obtenerReporteAdmin: new ObtenerReporteAdminUseCase(reportes),
  resolverReporteAdmin: new ResolverReporteUseCase(reportes, notificaciones),
  listarDisputasAdmin: new ListarDisputasAdminUseCase(disputas),
  obtenerDisputaAdmin: new ObtenerDisputaAdminUseCase(disputas, contratos),
  resolverDisputaAdmin: new ResolverDisputaUseCase(contratos, disputas, notificaciones),
  listarLiquidacionesAdmin: new ListarLiquidacionesAdminUseCase(liquidaciones),
  aprobarRetiroAdmin: new AprobarRetiroUseCase(liquidaciones, notificaciones),
  obtenerDashboardModerador: new ObtenerDashboardModeradorUseCase(
    reportes,
    disputas,
    liquidaciones
  ),
  listarNotificaciones: new ListarNotificacionesUseCase(notificaciones),
  marcarNotificacionLeida: new MarcarNotificacionLeidaUseCase(notificaciones),
  marcarTodasNotificacionesLeidas: new MarcarTodasNotificacionesLeidasUseCase(
    notificaciones
  ),
  listarMisPropuestas: new ListarMisPropuestasUseCase(propuestas),
  aceptarPropuesta: new AceptarPropuestaUseCase(propuestas),
  rechazarPropuesta: new RechazarPropuestaUseCase(propuestas),
  crearOfertaChat: new CrearOfertaChatUseCase(conversaciones, ofertasChat),
  aceptarOfertaChat: new AceptarOfertaChatUseCase(ofertasChat),
  rechazarOfertaChat: new RechazarOfertaChatUseCase(ofertasChat),
  contraofertar: new ContraofertarUseCase(ofertasChat),
  listarContratos: new ListarContratosUseCase(contratos),
  obtenerContrato: new ObtenerContratoUseCase(contratos),
  cambiarEstadoContrato: new CambiarEstadoContratoUseCase(
    contratos,
    liquidaciones,
    comisionFreelancerPorcentaje
  ),
  calificarContrato: new CalificarContratoUseCase(calificaciones, contratos),
  listarCalificacionesContrato: new ListarCalificacionesContratoUseCase(
    calificaciones,
    contratos
  ),
  listarCalificacionesFreelancer: new ListarCalificacionesFreelancerUseCase(calificaciones),
};
