# RIS Lite Web – Centro Médico Sinaí

## Descripción
RIS Lite es una aplicación web desarrollada como proyecto de título, orientada a
centros médicos pequeños para digitalizar la gestión de órdenes radiológicas,
mejorando la trazabilidad clínica y el control operativo.

## Demo
- Sitio web: https://xtoledovargas.github.io/Ris-lite-web/login.html
- Repositorio: https://github.com/xtoledovargas/Ris-lite-web

## Tecnologías utilizadas
- Frontend: HTML, CSS y JavaScript
- Backend: Supabase (PostgreSQL + Auth + seguridad)
- Hosting Frontend: GitHub Pages

## Arquitectura
Arquitectura web cliente–servidor desacoplada.
El frontend se ejecuta en el navegador y el backend es provisto por Supabase,
permitiendo separación de responsabilidades, seguridad y escalabilidad futura.

## Base de Datos
La base de datos es relacional (PostgreSQL) y puede reconstruirse completamente
mediante los scripts incluidos en este repositorio:

- `db/schema.sql` → estructura completa de la base de datos
- `db/seed.sql` → datos de demostración (opcional)

Esto permite reconstruir el sistema en caso de caída del servicio externo.

## Configuración Supabase
1. Crear un nuevo proyecto en Supabase
2. Ejecutar `db/schema.sql`
3. (Opcional) Ejecutar `db/seed.sql`
4. Crear usuarios en Supabase Auth según roles
5. Configurar en el frontend la URL y Anon Key de Supabase

## Demostración recomendada
1. Login como Médico → crear orden radiológica
2. Logout → login como Tecnólogo Médico
3. Cambiar estado de la orden
4. Revisar trazabilidad (logs)

## Usuarios Demo
Los usuarios se crean directamente en Supabase Auth y se asignan roles
según el diseño del sistema.

## Uso académico
Proyecto desarrollado con fines académicos.
