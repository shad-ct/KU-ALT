import React from 'react';

/**
 * Format system role codes into plain, human-friendly titles
 */
const formatRoleLabel = (role) => {
  if (!role) return '';
  switch (role.toUpperCase()) {
    case 'GUIDE':
      return 'Research Guide';
    case 'CENTRE_HEAD':
      return 'Research Centre Head';
    case 'DRC_CONVENOR':
      return 'DRC Convenor';
    case 'STAFF':
      return 'Section Staff';
    case 'ADMIN':
      return 'Administrator';
    default:
      return role.replace(/_/g, ' ').toLowerCase();
  }
};

/**
 * StatusChip - Soft rounded chip per product specification
 * Height 24px, padding 0 8px, radius-sm (6px), soft bg + status text colour, 13/20 500, with a 6px dot at left (gap 6px).
 */
export const StatusChip = ({
  status,
  currentActorRole = null,
  showSubline = false,
  className = '',
}) => {
  const normStatus = (status || '').toUpperCase();

  let bgClass = 'bg-neutral-bg text-neutral-text';
  let dotColor = 'bg-neutral-text';
  let label = status || 'Unknown';

  switch (normStatus) {
    case 'DRAFT':
      bgClass = 'bg-neutral-bg text-neutral-text';
      dotColor = 'bg-neutral-text';
      label = 'Draft';
      break;

    case 'SUBMITTED':
    case 'IN_PROGRESS':
    case 'PENDING':
    case 'ACTIVE':
      bgClass = 'bg-info-bg text-info-text';
      dotColor = 'bg-info-text';
      label = 'In progress';
      break;

    case 'APPROVED':
    case 'DONE':
    case 'COMPLETED':
      bgClass = 'bg-success-bg text-success-text';
      dotColor = 'bg-success-text';
      label = 'Approved';
      break;

    case 'RETURNED':
    case 'RETURNED_FOR_CHANGES':
      bgClass = 'bg-warning-bg text-warning-text';
      dotColor = 'bg-warning-text';
      label = 'Returned for changes';
      break;

    case 'REJECTED':
      bgClass = 'bg-danger-bg text-danger-text';
      dotColor = 'bg-danger-text';
      label = 'Rejected';
      break;

    case 'SCHEDULED':
      bgClass = 'bg-info-bg text-info-text';
      dotColor = 'bg-info-text';
      label = 'Scheduled';
      break;

    case 'CANCELLED':
      bgClass = 'bg-neutral-bg text-neutral-text';
      dotColor = 'bg-neutral-text';
      label = 'Cancelled';
      break;

    case 'PROVISIONAL':
      bgClass = 'bg-warning-bg text-warning-text';
      dotColor = 'bg-warning-text';
      label = 'Pending approval';
      break;

    default:
      bgClass = 'bg-neutral-bg text-neutral-text';
      dotColor = 'bg-neutral-text';
      label = status;
      break;
  }

  const waitingLabel = currentActorRole ? `Waiting on ${formatRoleLabel(currentActorRole)}` : null;

  return (
    <div className={`inline-flex flex-col ${className}`}>
      <span
        className={`inline-flex items-center h-[24px] px-[8px] rounded-sm text-[13px] leading-[20px] font-medium ${bgClass}`}
      >
        <span className={`w-[6px] h-[6px] rounded-full mr-[6px] ${dotColor} flex-shrink-0`} />
        <span>{label}</span>
      </span>
      {showSubline && waitingLabel && (
        <span className="text-[13px] text-text-muted mt-1 font-normal">
          {waitingLabel}
        </span>
      )}
    </div>
  );
};

export default StatusChip;
