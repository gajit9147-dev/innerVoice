import React from "react";

const Tag = ({ text }) => {
  return (
    <span className="rounded-full bg-violet-100 px-3 py-1 text-sm font-medium text-violet-700 dark:bg-violet-900 dark:text-violet-300">
      #{text}
    </span>
  );
};

export default Tag;
