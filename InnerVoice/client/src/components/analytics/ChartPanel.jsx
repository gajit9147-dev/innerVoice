import GlassSurface from "../glass/GlassSurface";

// Shared wrapper so every chart on the Analytics page looks the same
function ChartPanel({ title, empty, emptyText = "Nothing to show yet.", children }) {
  return (
    <GlassSurface
      level={1}
      className="rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-white/[0.08] min-w-0"
    >
      <h2 className="font-serif text-lg sm:text-xl text-[#f5f2eb] font-normal mb-4 sm:mb-6">
        {title}
      </h2>
      {empty ? (
        <div className="h-48 sm:h-64 flex items-center justify-center text-xs text-[#9e9990] text-center px-4">
          {emptyText}
        </div>
      ) : (
        children
      )}
    </GlassSurface>
  );
}

export default ChartPanel;
