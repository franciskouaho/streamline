import { STATUS_COLORS } from '@/constants/StatusColors';

export const getProjectStatusTranslation = (status: string): string => {
  switch (status) {
    case 'active':
      return 'Actif';
    case 'in_progress':
      return 'En progression';
    case 'completed':
      return 'Terminé';
    case 'canceled':
      return 'Annulé';
    case 'ongoing':
      return 'En cours';
    default:
      return status;
  }
};

export const getStatusColor = (status: string): string => {
  const normalizedStatus = status.toLowerCase();
  switch (normalizedStatus) {
    case 'completed':
      return STATUS_COLORS.COMPLETED;
    case 'in_progress':
      return STATUS_COLORS.IN_PROGRESS;
    case 'ongoing':
      return STATUS_COLORS.ONGOING;
    case 'canceled':
      return STATUS_COLORS.CANCELED;
    default:
      return STATUS_COLORS.DEFAULT;
  }
};
