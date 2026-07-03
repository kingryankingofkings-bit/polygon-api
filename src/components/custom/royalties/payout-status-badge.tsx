import { Badge } from '@/components/ui/badge';

type Status = 'PENDING' | 'CALCULATED' | 'APPROVED' | 'PAID' | 'HELD';

const LABEL: Record<Status, string> = {
  PENDING: 'Pending',
  CALCULATED: 'Calculated',
  APPROVED: 'Approved',
  PAID: 'Paid',
  HELD: 'Held',
};

type BadgeVariant = 'default' | 'secondary' | 'outline' | 'destructive';

const VARIANT: Record<Status, BadgeVariant> = {
  PENDING: 'secondary',
  CALCULATED: 'outline',
  APPROVED: 'default',
  PAID: 'default',
  HELD: 'destructive',
};

interface Props {
  status: Status;
}

export function PayoutStatusBadge({ status }: Props) {
  return <Badge variant={VARIANT[status]}>{LABEL[status]}</Badge>;
}
