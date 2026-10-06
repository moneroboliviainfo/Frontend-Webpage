import type { FedexService } from '@/store/checkoutSlice';

const WEEKDAY_NAMES: Record<string, string> = {
  Mon: 'lunes',
  Tue: 'martes',
  Wed: 'miércoles',
  Thu: 'jueves',
  Fri: 'viernes',
  Sat: 'sábado',
  Sun: 'domingo',
};

export const formatFedexArrivalEstimate = (
  service: Pick<FedexService, 'commit'>,
): string | undefined => {
  const { dayOfWeek, dayFormat } = service.commit?.dateDetail || {};
  if (!dayFormat) return undefined;

  const date = new Date(`${dayFormat.slice(0, 10)}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) return undefined;

  const weekday =
    WEEKDAY_NAMES[dayOfWeek || ''] ||
    new Intl.DateTimeFormat('es-BO', {
      weekday: 'long',
      timeZone: 'UTC',
    }).format(date);
  const formattedDate = new Intl.DateTimeFormat('es-BO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);

  return `Llegada estimada en ${weekday}, ${formattedDate}`;
};
