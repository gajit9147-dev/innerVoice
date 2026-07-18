import { useContext } from "react";
import { NoteContext } from "../context/NoteContext";

export function useNotes() {
  return useContext(NoteContext);
}