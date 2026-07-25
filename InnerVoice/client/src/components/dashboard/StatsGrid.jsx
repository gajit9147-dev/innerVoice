import { NotebookPen, Pin, Star, Lock, Trash2 } from "lucide-react";
import StatsCard from "./StatsCard";

function StatsGrid({ stats }) {
  const cards = [
    {
      title: "Total Notes",
      value: stats?.total || 0,
      icon: <NotebookPen size={20} />,
      color: "bg-blue-500 dark:bg-blue-600",
    },
    {
      title: "Pinned Notes",
      value: stats?.pinned || 0,
      icon: <Pin size={20} />,
      color: "bg-orange-500 dark:bg-orange-600",
    },
    {
      title: "Favorites",
      value: stats?.favorite || 0,
      icon: <Star size={20} />,
      color: "bg-yellow-500 dark:bg-yellow-600",
    },
    {
      title: "Private Vault",
      value: stats?.locked || 0,
      icon: <Lock size={20} />,
      color: "bg-purple-500 dark:bg-purple-600",
    },
    {
      title: "Trash Bin",
      value: stats?.trash || 0,
      icon: <Trash2 size={20} />,
      color: "bg-red-500 dark:bg-red-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
      {cards.map((card, idx) => (
        <StatsCard
          key={idx}
          title={card.title}
          value={card.value}
          icon={card.icon}
          color={card.color}
        />
      ))}
    </div>
  );
}

export default StatsGrid;
