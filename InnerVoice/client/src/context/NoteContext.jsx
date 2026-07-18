import { createContext, useMemo, useState } from "react";

export const NoteContext = createContext(null);

export function NoteProvider({ children }) {
  const [notes, setNotes] = useState([]);

  const value = useMemo(
    () => ({
      notes,
      setNotes,
      addNote: (note) => setNotes((prev) => [note, ...prev])
    }),
    [notes]
  );

  return <NoteContext.Provider value={value}>{children}</NoteContext.Provider>;
}