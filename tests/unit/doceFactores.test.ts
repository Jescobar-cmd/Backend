import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { builtinModules } from 'node:module';
import { join } from 'node:path';
import type { AddressInfo } from 'node:net';

/**
 * Auditoría automatizada de los 12 factores (https://12factor.net/es/).
 *
 * Estos tests no prueban reglas de negocio: verifican que la aplicación siga
 * siendo desplegable como un servicio stateless, configurable por entorno y
 * operable por un orquestador. Se ejecutan junto al resto de la suite y en CI.
 */

const RAIZ = process.cwd();

function ruta(relativa: string): string {
  return join(RAIZ, relativa);
}

function existe(relativa: string): boolean {
  return existsSync(ruta(relativa));
}

function leer(relativa: string): string {
  return readFileSync(ruta(relativa), 'utf8');
}

function listarFuente(directorio = 'src'): string[] {
  const encontrados: string[] = [];
  for (const entrada of readdirSync(ruta(directorio), { withFileTypes: true })) {
    const relativa = `${directorio}/${entrada.name}`;
    if (entrada.isDirectory()) {
      encontrados.push(...listarFuente(relativa));
    } else if (entrada.name.endsWith('.ts') && !entrada.name.endsWith('.d.ts')) {
      encontrados.push(relativa);
    }
  }
  return encontrados;
}

const FUENTE = listarFuente();
const packageJson = JSON.parse(leer('package.json')) as {
  scripts: Record<string, string>;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
};

function buscarEnFuente(patron: RegExp): string[] {
  return FUENTE.filter((archivo) => patron.test(leer(archivo)));
}

describe('Factor I - Código base: un repositorio, muchos despliegues', () => {
  it('el proyecto es un único repositorio con una sola aplicación', () => {
    expect(existe('.git')).toBe(true);
    expect(existe('package.json')).toBe(true);
    expect(existe('src/infrastructure/http/app.ts')).toBe(true);
    expect(existe('src/infrastructure/http/server.ts')).toBe(true);
  });

  it('no hay aplicaciones anidadas con su propio package.json dentro de src', () => {
    expect(FUENTE.filter((archivo) => leer(archivo).includes('"name":'))).toEqual([]);
    expect(existe('src/package.json')).toBe(false);
  });
});

describe('Factor II - Dependencias: declaradas y aisladas', () => {
  it('declara dependencias y fija el árbol con package-lock.json', () => {
    expect(existe('package-lock.json')).toBe(true);
    expect(Object.keys(packageJson.dependencies).length).toBeGreaterThan(0);
  });

  it('no versiona node_modules ni artefactos de compilación', () => {
    const ignorados = leer('.gitignore');
    expect(ignorados).toMatch(/^node_modules\/?$/m);
    expect(ignorados).toMatch(/^dist\/?$/m);
  });

  it('todo import de terceros está declarado en package.json', () => {
    const declaradas = new Set([
      ...Object.keys(packageJson.dependencies),
      ...Object.keys(packageJson.devDependencies),
    ]);
    const integradas = new Set(builtinModules);
    const sinDeclarar: string[] = [];

    for (const archivo of FUENTE) {
      const contenido = leer(archivo);
      const importaciones = contenido.matchAll(
        /(?:from\s+|require\(\s*)['"]([^'"]+)['"]/g
      );

      for (const coincidencia of importaciones) {
        const especificador = coincidencia[1];
        if (
          especificador.startsWith('.') ||
          especificador.startsWith('/') ||
          especificador.startsWith('node:')
        ) {
          continue;
        }

        const nombre = especificador.startsWith('@')
          ? especificador.split('/').slice(0, 2).join('/')
          : especificador.split('/')[0];

        if (!integradas.has(nombre) && !declaradas.has(nombre)) {
          sinDeclarar.push(`${archivo}: ${especificador}`);
        }
      }
    }

    expect(sinDeclarar).toEqual([]);
  });
});

describe('Factor III - Configuración: todo en variables de entorno', () => {
  it('la configuración se valida al arrancar y falla rápido', () => {
    const entorno = leer('src/config/entorno.ts');
    expect(entorno).toContain('process.env');
    expect(entorno).toContain('safeParse');
    expect(entorno).toMatch(/throw new Error/);
  });

  it('el archivo .env es local y no se versiona', () => {
    expect(leer('.gitignore')).toMatch(/^\.env$/m);
    expect(existe('.env.example')).toBe(true);
  });

  it('todas las variables que exige la app están documentadas en .env.example', () => {
    const esquema = leer('src/config/entorno.ts');
    const claves = [...esquema.matchAll(/^\s{2}([A-Z][A-Z0-9_]*):/gm)].map(
      (coincidencia) => coincidencia[1]
    );
    const ejemplo = leer('.env.example');

    expect(claves.length).toBeGreaterThanOrEqual(10);
    const faltantes = claves.filter((clave) => !new RegExp(`^${clave}=`, 'm').test(ejemplo));
    expect(faltantes).toEqual([]);

    for (const obligatoria of ['PORT', 'DATABASE_URL', 'JWT_SECRET']) {
      expect(claves).toContain(obligatoria);
    }
  });

  it('no hay secretos ni credenciales escritos en el código', () => {
    const conSecreto = buscarEnFuente(
      /(JWT_SECRET\s*=\s*['"][^'"]+['"])|(postgres(ql)?:\/\/[^\s'"]+:[^\s'"]+@)/
    );
    expect(conSecreto).toEqual([]);
  });
});

describe('Factor IV - Servicios de respaldo: tratados como recursos adjuntos', () => {
  it('la base de datos se resuelve por URL de entorno, no por host fijo', () => {
    const conexion = leer('src/config/conexionBd.ts');
    expect(conexion).toContain('entorno.DATABASE_URL');

    const conHostFijo = buscarEnFuente(/localhost:5432|127\.0\.0\.1:5432/);
    expect(conHostFijo).toEqual([]);
  });

  it('expone una única instancia de conexión reutilizable', () => {
    expect(leer('src/config/conexionBd.ts')).toMatch(/export const prisma/);
  });
});

describe('Factor V - Construcción, entrega y ejecución', () => {
  it('separa la compilación del arranque', () => {
    const { build, start } = packageJson.scripts;
    expect(build).toBeTruthy();
    expect(start).toBeTruthy();
    expect(build).not.toBe(start);
  });

  it('el arranque usa el artefacto compilado, no el código fuente', () => {
    expect(packageJson.scripts.start).toContain('dist/');
    expect(packageJson.scripts.build).toContain('tsc');
  });
});

describe('Factor VI - Procesos: stateless y sin sesiones en memoria', () => {
  it('no guarda sesiones ni cachés en el proceso', () => {
    expect(packageJson.dependencies).not.toHaveProperty('express-session');
    const estadoGlobal = buscarEnFuente(/^(?:const|let|var)\s+\w+\s*=\s*new\s+(?:Map|Set)\b/m);
    expect(estadoGlobal).toEqual([]);
  });

  it('no persiste estado en disco local', () => {
    expect(buscarEnFuente(/writeFile|createWriteStream|appendFile/)).toEqual([]);
  });

  it('no usa WebSockets: el chat funciona por polling HTTP', () => {
    expect(packageJson.dependencies).not.toHaveProperty('ws');
    expect(packageJson.dependencies).not.toHaveProperty('socket.io');
  });
});

describe('Factor VII - Asignación de puertos: autónomo y configurable', () => {
  it('el puerto viene del entorno y el servidor se enlaza a él', () => {
    const servidor = leer('src/infrastructure/http/server.ts');
    expect(servidor).toContain('entorno.PORT');
    expect(servidor).toMatch(/app\.listen\(port/);
    expect(leer('src/config/entorno.ts')).toMatch(/default\('4000'\)/);
  });

  it('la app se puede montar en un puerto efímero en pruebas', () => {
    expect(leer('tests/integration/moderador.routes.test.ts')).toContain('listen(0)');
  });

  it('la imagen declara el mismo puerto por defecto', () => {
    const dockerfile = leer('Dockerfile');
    expect(dockerfile).toContain('ENV PORT=4000');
    expect(dockerfile).toContain('EXPOSE 4000');
  });
});

describe('Factor VIII - Concurrencia: escala por procesos', () => {
  it('la aplicación se crea con una fábrica, sin estado compartido global', () => {
    expect(leer('src/infrastructure/http/app.ts')).toMatch(/export function createApp/);
    expect(buscarEnFuente(/^\s*global\.\w+\s*=/m)).toEqual([]);
  });

  it('no depende de gestores de procesos dentro del contenedor', () => {
    const dependencias = JSON.stringify(packageJson.dependencies);
    expect(dependencias).not.toContain('pm2');
    expect(leer('Dockerfile')).toMatch(/^CMD \["node",/m);
  });
});

describe('Factor IX - Desechabilidad: arranque rápido y apagado limpio', () => {
  it('atiende señales del orquestador y cierra recursos', () => {
    const servidor = leer('src/infrastructure/http/server.ts');
    expect(servidor).toContain("'SIGTERM'");
    expect(servidor).toContain("'SIGINT'");
    expect(servidor).toContain('prisma.$disconnect()');
    expect(servidor).toMatch(/10000/);
  });

  it('un fallo no controlado derriba el proceso con código distinto de cero', () => {
    const servidor = leer('src/infrastructure/http/server.ts');
    expect(servidor).toMatch(/unhandledRejection[\s\S]{0,200}gracefulShutdown\([^)]*,\s*1\)/);
    expect(servidor).toMatch(/uncaughtException[\s\S]{0,200}gracefulShutdown\([^)]*,\s*1\)/);
  });

  it('responde /health sin tocar la base de datos', async () => {
    process.env.DATABASE_URL ??= 'postgresql://usuario:clave@localhost:5432/firstgig_test';
    process.env.JWT_SECRET ??= 'secreto-de-pruebas-con-longitud-suficiente';
    process.env.NODE_ENV = 'test';

    const { createApp } = await import('../../src/infrastructure/http/app');
    const servidor = createApp().listen(0);
    await new Promise<void>((resolver) => servidor.once('listening', () => resolver()));
    const { port } = servidor.address() as AddressInfo;

    const respuesta = await fetch(`http://127.0.0.1:${port}/health`);
    const cuerpo = (await respuesta.json()) as { status: string };

    expect(respuesta.status).toBe(200);
    expect(cuerpo.status).toBe('healthy');

    await new Promise<void>((resolver) => servidor.close(() => resolver()));
  }, 15000);
});

describe('Factor X - Paridad entre entornos', () => {
  it('desarrollo y producción usan el mismo motor de base de datos', () => {
    const compose = leer('docker-compose.yml');
    expect(compose).toContain('postgres:16');
    expect(compose).not.toContain('sqlite');
    expect(buscarEnFuente(/sqlite/i)).toEqual([]);
  });

  it('el contenedor compila el mismo código que se ejecuta en producción', () => {
    const dockerfile = leer('Dockerfile');
    expect(dockerfile).toContain('npm run build');
    expect(dockerfile).toContain('NODE_ENV=production');
    expect(dockerfile).toContain('npm prune --omit=dev');
  });
});

describe('Factor XI - Logs: flujo de eventos por stdout/stderr', () => {
  it('no escribe logs en archivos locales', () => {
    expect(buscarEnFuente(/writeFile|createWriteStream|appendFile/)).toEqual([]);
    expect(packageJson.dependencies).not.toHaveProperty('winston');
    expect(packageJson.dependencies).not.toHaveProperty('pino');
  });

  it('usa la salida estándar del proceso', () => {
    expect(buscarEnFuente(/console\.(log|error|warn)\(/).length).toBeGreaterThan(0);
  });
});

describe('Factor XII - Procesos de administración: tareas puntuales', () => {
  it('el seed y las migraciones se ejecutan como comandos aparte', () => {
    expect(existe('prisma/seed.ts')).toBe(true);
    expect(packageJson.scripts.seed).toContain('prisma/seed.ts');
    expect(existe('prisma/manual-migrations')).toBe(true);
  });

  it('el servidor no siembra ni migra la base de datos al arrancar', () => {
    const servidor = leer('src/infrastructure/http/server.ts');
    expect(servidor).not.toMatch(/\$executeRaw|prisma\.seed|seed\(/);
  });
});
