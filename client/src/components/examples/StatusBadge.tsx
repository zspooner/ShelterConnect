import StatusBadge from '../StatusBadge';

export default function StatusBadgeExample() {
  return (
    <div className="flex gap-4 flex-wrap">
      <StatusBadge status="Available" />
      <StatusBadge status="Available" urgencyLevel="Soon" />
      <StatusBadge status="Available" urgencyLevel="Critical" />
      <StatusBadge status="Adopted" />
      <StatusBadge status="Hold" />
      <StatusBadge status="Urgent" />
    </div>
  );
}