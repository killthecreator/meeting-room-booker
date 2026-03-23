import { useState, type KeyboardEvent, type MouseEvent } from "react";
import type { MeetingDTO } from "@meeting-calendar/shared";
import CheckIcon from "../Icons/CheckIcon";
import XIcon from "../Icons/XIcon";

type MeetingEditorProps = {
  meeting: MeetingDTO;
  onSave: (name: string, description: string) => void;
  onCancel: () => void;
};

export function MeetingEditor({
  meeting,
  onSave,
  onCancel,
}: MeetingEditorProps) {
  const [name, setName] = useState(meeting.name);
  const [description, setDescription] = useState(meeting.description || "");

  const handleSave = (
    e: MouseEvent | KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    e.stopPropagation();
    if (!name.trim()) return;
    onSave(name.trim(), description.trim());
  };

  const handleCancel = (
    e: MouseEvent | KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    e.stopPropagation();
    onCancel();
  };

  return (
    <div className="flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="focus:border-primary-500 w-full rounded-md border border-white/20 bg-white/10 px-2 py-1 text-[13px] font-semibold tracking-tight text-white placeholder:text-white/40 focus:outline-none"
        placeholder="Meeting name"
        autoFocus
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSave(e);
          if (e.key === "Escape") handleCancel(e);
        }}
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="focus:border-primary-500 min-h-[60px] w-full resize-none rounded-md border border-white/20 bg-white/10 px-2 py-1 text-xs text-white placeholder:text-white/40 focus:outline-none"
        placeholder="Meeting description"
        onKeyDown={(e) => {
          if (e.key === "Escape") handleCancel(e);
        }}
      />
      <div className="mt-1 flex justify-end gap-1">
        <button
          onClick={handleCancel}
          className="rounded-md p-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
          title="Cancel"
        >
          <XIcon className="size-3.5" />
        </button>
        <button
          onClick={handleSave}
          disabled={!name.trim()}
          className="text-primary-400 hover:text-primary-300 hover:bg-primary-400/10 disabled:hover:text-primary-400 rounded-md p-1.5 transition-colors disabled:opacity-50 disabled:hover:bg-transparent"
          title="Save"
        >
          <CheckIcon className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
