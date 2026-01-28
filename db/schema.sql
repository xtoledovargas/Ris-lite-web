-- =========================================
-- RIS Lite - Schema
-- PostgreSQL / Supabase
-- =========================================
-- Este script permite reconstruir completamente
-- la base de datos del proyecto RIS Lite
-- en un nuevo proyecto Supabase o PostgreSQL.

CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    nombre TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    rol TEXT NOT NULL,
    activo BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS pacientes (
    id SERIAL PRIMARY KEY,
    rut TEXT NOT NULL UNIQUE,
    nombre TEXT NOT NULL,
    fecha_nacimiento DATE,
    activo BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS medico_solicitante (
    id SERIAL PRIMARY KEY,
    rut TEXT NOT NULL UNIQUE,
    nombre TEXT NOT NULL,
    especialidad TEXT,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tipo_examen (
    id SERIAL PRIMARY KEY,
    nombre TEXT NOT NULL,
    codigo TEXT,
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS estado_orden (
    id SERIAL PRIMARY KEY,
    nombre TEXT NOT NULL,
    orden INTEGER NOT NULL,
    activo BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS orden_radiologica (
    id SERIAL PRIMARY KEY,
    paciente_id INTEGER NOT NULL,
    medico_id INTEGER NOT NULL,
    tipo_examen_id INTEGER NOT NULL,
    estado_id INTEGER NOT NULL,
    prioridad TEXT NOT NULL,
    observaciones TEXT,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID,
    CONSTRAINT fk_orden_paciente FOREIGN KEY (paciente_id) REFERENCES pacientes(id),
    CONSTRAINT fk_orden_medico FOREIGN KEY (medico_id) REFERENCES medico_solicitante(id),
    CONSTRAINT fk_orden_tipo_examen FOREIGN KEY (tipo_examen_id) REFERENCES tipo_examen(id),
    CONSTRAINT fk_orden_estado FOREIGN KEY (estado_id) REFERENCES estado_orden(id),
    CONSTRAINT fk_orden_created_by FOREIGN KEY (created_by) REFERENCES usuarios(id)
);

CREATE TABLE IF NOT EXISTS log_sistema (
    id SERIAL PRIMARY KEY,
    entidad TEXT NOT NULL,
    entidad_id INTEGER NOT NULL,
    accion TEXT NOT NULL,
    detalle TEXT,
    user_email TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices recomendados
CREATE INDEX IF NOT EXISTS idx_orden_estado ON orden_radiologica(estado_id);
CREATE INDEX IF NOT EXISTS idx_orden_fecha ON orden_radiologica(created_at);
CREATE INDEX IF NOT EXISTS idx_log_entidad ON log_sistema(entidad, entidad_id);
