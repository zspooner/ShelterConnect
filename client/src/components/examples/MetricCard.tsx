import MetricCard from '../MetricCard';
import { Eye, Heart, Share, Users } from 'lucide-react';

export default function MetricCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl">
      <MetricCard
        title="Total Views"
        value="1,234"
        description="Last 7 days"
        trend="up"
        trendValue="+12%"
        icon={<Eye className="h-4 w-4" />}
      />
      <MetricCard
        title="Inquiries"
        value="23"
        description="This week"
        trend="up"
        trendValue="+5"
        icon={<Heart className="h-4 w-4" />}
      />
      <MetricCard
        title="Shares"
        value="89"
        description="All time"
        icon={<Share className="h-4 w-4" />}
      />
      <MetricCard
        title="Active Volunteers"
        value="47"
        description="This month"
        trend="neutral"
        icon={<Users className="h-4 w-4" />}
      />
    </div>
  );
}