import { Pool } from 'pg';

// Pool de conexiones a PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Configuración adicional
  max: 20, // Máximo 20 conexiones
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Función helper para ejecutar queries
export async function query<T = any>(
  text: string,
  params?: any[]
): Promise<T[]> {
  const start = Date.now();
  
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    
    console.log('Query ejecutada:', { text, duration, rows: result.rowCount });
    
    return result.rows as T[];
  } catch (error) {
    console.error('Error en query:', error);
    throw error;
  }
}

// Exportar el pool por si se necesita
export default pool;