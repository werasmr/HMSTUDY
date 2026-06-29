import type { OrderStatus } from '../../types';
import { STATUS_LABELS, STATUS_BG, STATUS_COLORS } from '../../types';
import { cn } from '../../lib/utils';

interface StatusBadgeProps {
  status: OrderStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={cn('inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border', STATUS_BG[status], STATUS_COLORS[status])}>
      {STATUS_LABELS[status]}
    </span>
  );
}
