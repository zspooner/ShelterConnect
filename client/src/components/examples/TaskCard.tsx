import TaskCard from '../TaskCard';

export default function TaskCardExample() {
  //todo: remove mock functionality
  const mockTasks = [
    {
      id: "1",
      dogName: "Buddy",
      dogPhoto: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=100&h=100&fit=crop",
      channel: "IG" as const,
      status: "Open" as const,
      location: "Austin, TX",
      expiresAt: "in 2 days",
      urgencyLevel: "Critical" as const
    },
    {
      id: "2",
      dogName: "Luna", 
      dogPhoto: "https://images.unsplash.com/photo-1551717743-49959800b1f6?w=100&h=100&fit=crop",
      channel: "X" as const,
      status: "Claimed" as const,
      location: "San Francisco, CA",
      expiresAt: "in 4 days",
      claimedBy: "Sarah M."
    },
    {
      id: "3",
      dogName: "Max",
      dogPhoto: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=100&h=100&fit=crop",
      channel: "FB" as const,
      status: "Done" as const,
      location: "Denver, CO", 
      expiresAt: "yesterday"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl">
      {mockTasks.map(task => (
        <TaskCard key={task.id} {...task} />
      ))}
    </div>
  );
}