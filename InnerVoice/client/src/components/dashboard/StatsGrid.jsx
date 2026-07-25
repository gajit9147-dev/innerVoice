import {
  BookOpen,
  Pin,
  Star,
  Archive,
  Trash2,
  Lock,
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
        title="Pinned"
        value={stats.pinned}
        icon={<Pin />}
        color="text-cyan-500"
      />

      <StatsCard
        title="Favorites"
        value={stats.favorite}
        icon={<Star />}
        color="text-yellow-500"
      />

      <StatsCard
        title="Archived"
        value={stats.archived}
        icon={<Archive />}
        color="text-purple-500"
      />

      <StatsCard
        title="Trash"
        value={stats.trash}
        icon={<Trash2 />}
        color="text-red-500"
      />

      <StatsCard
        title="Locked"
        value={stats.locked}
        icon={<Lock />}
        color="text-green-500"
      />

    </div>
  );
}

export default StatsGrid;
