/**
 * Convierte una fecha UTC (ej. de Prisma) a la zona horaria local de Colombia
 * con el formato solicitado por la DIAN y el requerimiento visual.
 */
export const formatColombiaDate = (date: string | Date | undefined): string => {
  if (!date) return 'N/A';
  
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    
    // Validar si la fecha es válida
    if (isNaN(d.getTime())) return 'N/A';

    return d.toLocaleString('es-CO', {
      timeZone: 'America/Bogota',
      dateStyle: 'short',
      timeStyle: 'short',
      hour12: true
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return 'N/A';
  }
};
