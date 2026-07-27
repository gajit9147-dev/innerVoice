import {
  BookOpen,
  Pin,
  Star,
  Trash2,
  Sparkles,
  Hourglass,
} from "lucide-react";

import StatsCard from "./StatsCard";

function StatsGrid({ stats }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <StatsCard
        title="Total Notes"
        value={stats.total}
        icon={<BookOpen />}
        color="text-blue-500"
      />

      <StatsCard
        title="Favorites"
        value={stats.favorite}
        icon={<Star />}
        color="text-yellow-500"
      />

      <StatsCard
        title="Pinned"
        value={stats.pinned}
        icon={<Pin />}
        color="text-cyan-500"
      />

      <StatsCard
        title="Trash"
        value={stats.trash}
        icon={<Trash2 />}
        color="text-red-500"
      />

      <StatsCard
        title="AI Completed"
        value={stats.ai_completed || 0}
        icon={<Sparkles />}
        color="text-violet-500"
      />

      <StatsCard
        title="AI Pending"
        value={stats.ai_pending || 0}
        icon={<Hourglass />}
        color="text-amber-500"
      />
    </div>
  );
}

export default StatsGrid;
