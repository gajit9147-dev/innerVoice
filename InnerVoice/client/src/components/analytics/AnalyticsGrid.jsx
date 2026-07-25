import {
  BookOpen,
  Pin,
  Star,
  Archive,
  Trash2,
  Lock,
} from "lucide-react";

import AnalyticsCard from "./AnalyticsCard";

function AnalyticsGrid({ stats }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <AnalyticsCard
        title="Total Notes"
        value={stats.total}
        icon={<BookOpen />}
        color="text-blue-500"
      />

      <AnalyticsCard
        title="Pinned"
        value={stats.pinned}
        icon={<Pin />}
        color="text-cyan-500"
      />

      <AnalyticsCard
        title="Favorites"
        value={stats.favorite}
        icon={<Star />}
        color="text-yellow-500"
      />

      <AnalyticsCard
        title="Archived"
        value={stats.archived}
        icon={<Archive />}
        color="text-purple-500"
      />

      <AnalyticsCard
        title="Trash"
        value={stats.trash}
        icon={<Trash2 />}
        color="text-red-500"
      />

      <AnalyticsCard
        title="Locked"
        value={stats.locked}
        icon={<Lock />}
        color="text-green-500"
      />
    </div>
  );
}

export default AnalyticsGrid;
