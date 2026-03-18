import {
  useState,
  useRef,
  use,
  createContext,
  type ReactNode,
  useCallback,
  useMemo,
  type ComponentType,
  type ComponentProps,
  useEffect,
  type MouseEvent,
  type CSSProperties,
  type SubmitEvent,
  type ChangeEvent,
  useLayoutEffect,
} from "react";
import { createPortal } from "react-dom";
import {
  formatMinutesAsTime,
  formatDateForInput,
  parseDateInput,
  WORKDAY_END_MIN,
  WORKDAY_START_MIN,
  minutesFromMidnight,
  isWeekend,
  getNextWeekday,
  getPreviousWeekday,
} from "../../lib/date-utils";

type FormValues = {
  name: string;
  description: string;
  date: string;
  start: string;
  end: string;
};

type ConfirmOptions = {
  title: string;
  style?: CSSProperties;
  step?: number;
  start?: Date;
  end?: Date;
  date?: Date;
  /** Date picker range in the form (YYYY-MM-DD). */
  minDate?: string;
  maxDate?: string;
  /** Returns true if a meeting already exists in the selected slot (time overlap). */
  checkOverlap?: (start: Date, end: Date) => boolean;
  /** Called when day/time changes in the form (to sync with ghost). */
  onDraftChange?: (start: Date, end: Date, date: Date) => void;
  /** Called when the meeting name changes in the form (to sync ghost label). */
  onDraftNameChange?: (name: string) => void;
  /** Returns the ghost block rect for positioning the modal next to it. */
  getAnchorRect?: () => DOMRect | null;
};

export type UpdateCreateFormDraft = (
  start: Date,
  end: Date,
  date: Date,
) => void;

/* Promise type for the confirm meeting creation */
type PromiseType =
  | { name: string; description: string; start: Date; end: Date }
  | false;

type ConfirmContextValue = {
  confirmMeetingCreation: (options: ConfirmOptions) => Promise<PromiseType>;
  updateCreateFormDraft: UpdateCreateFormDraft;
};

const ConfirmMeetingCreationContext = createContext<ConfirmContextValue>(
  null as unknown as ConfirmContextValue,
);

type ConfirmMeetingCreationProviderProps = {
  children?: ReactNode;
};

export const ConfirmMeetingCreationProvider = ({
  children,
}: ConfirmMeetingCreationProviderProps) => {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [formValues, setFormValues] = useState<FormValues>({
    name: "New meeting",
    description: "",
    date: formatDateForInput(new Date()),
    start: formatMinutesAsTime(WORKDAY_START_MIN),
    end: formatMinutesAsTime(WORKDAY_START_MIN + 60),
  });
  const [overlapError, setOverlapError] = useState<string | null>(null);
  const awaitingPromiseRef = useRef<{
    resolve: (value: PromiseType) => void;
  } | null>(null);
  const cancelBtnRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const optionsRef = useRef<ConfirmOptions | null>(null);
  const [modalPosition, setModalPosition] = useState<{
    left: number;
    top: number;
  } | null>(null);
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  const MODAL_WIDTH = 300;
  const GAP = 8;
  useLayoutEffect(() => {
    const getAnchorRect = options?.getAnchorRect;
    const id = requestAnimationFrame(() => {
      if (!getAnchorRect) {
        setModalPosition(null);
        return;
      }
      const rect = getAnchorRect();
      if (!rect) {
        setModalPosition(null);
        return;
      }
      const win = typeof window !== "undefined" ? window : null;
      const maxLeft = win ? win.innerWidth - MODAL_WIDTH : 0;
      const maxTop = win ? win.innerHeight - 400 : 0;
      const viewportWidth = win ? win.innerWidth : 0;
      let left: number;
      if (rect.right + GAP + MODAL_WIDTH <= viewportWidth) {
        left = rect.right + GAP;
      } else if (rect.left - GAP - MODAL_WIDTH >= 0) {
        left = rect.left - GAP - MODAL_WIDTH;
      } else {
        left = Math.max(GAP, Math.min(maxLeft - GAP, rect.left));
      }
      const top = Math.max(GAP, Math.min(maxTop, rect.top));
      setModalPosition({ left, top });
    });
    return () => cancelAnimationFrame(id);
  }, [options]);

  const openModal = useCallback((opts: ConfirmOptions) => {
    setOptions(opts);
    setOverlapError(null);
    const baseDate = opts.date ?? opts.start ?? new Date();
    let dateStr = formatDateForInput(baseDate);
    if (opts.minDate && dateStr < opts.minDate) dateStr = opts.minDate;
    if (opts.maxDate && dateStr > opts.maxDate) dateStr = opts.maxDate;
    if (isWeekend(parseDateInput(dateStr))) {
      const d = getNextWeekday(parseDateInput(dateStr));
      dateStr = formatDateForInput(d);
      if (opts.minDate && dateStr < opts.minDate) dateStr = opts.minDate;
      if (opts.maxDate && dateStr > opts.maxDate) dateStr = opts.maxDate;
    }
    const startStr = opts.start
      ? formatMinutesAsTime(minutesFromMidnight(opts.start))
      : formatMinutesAsTime(WORKDAY_START_MIN);
    const endStr = opts.end
      ? formatMinutesAsTime(minutesFromMidnight(opts.end))
      : formatMinutesAsTime(WORKDAY_START_MIN + 60);
    setFormValues((prev) => ({
      ...prev,
      name: "New meeting",
      date: dateStr,
      start: startStr,
      end: endStr,
    }));
    return new Promise<PromiseType>((resolve) => {
      awaitingPromiseRef.current = { resolve };
    });
  }, []);

  const handleClose = useCallback(() => {
    if (awaitingPromiseRef.current) {
      awaitingPromiseRef.current.resolve(false);
    }
    setOverlapError(null);
    setModalPosition(null);
    setFormValues((prev) => ({
      ...prev,
      date: formatDateForInput(new Date()),
      start: formatMinutesAsTime(WORKDAY_START_MIN),
      end: formatMinutesAsTime(WORKDAY_START_MIN + 60),
    }));
    dialogRef.current?.close();
    setOptions(null);
  }, []);

  const handleConfirm = useCallback(
    async (e: SubmitEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const opts = options;
      if (!opts || !awaitingPromiseRef.current) return;

      const dateStr = formData.get("date") as string;
      const startStr = formData.get("start") as string;
      const endStr = formData.get("end") as string;
      const [startH, startM] = startStr.split(":").map(Number);
      const [endH, endM] = endStr.split(":").map(Number);

      const date = parseDateInput(dateStr);
      const start = new Date(date);
      start.setHours(startH, startM, 0, 0);
      const end = new Date(date);
      end.setHours(endH, endM, 0, 0);

      if (isWeekend(date)) {
        setOverlapError("Weekends are not available for meetings.");
        return;
      }
      const durationMs = end.getTime() - start.getTime();
      if (durationMs < 15 * 60 * 1000) {
        setOverlapError("Meeting must be at least 15 minutes.");
        return;
      }
      if (opts.checkOverlap?.(start, end)) {
        setOverlapError("A meeting already exists at this time.");
        return;
      }

      setOverlapError(null);
      awaitingPromiseRef.current.resolve({
        name: formData.get("name") as string,
        description: formData.get("description") as string,
        start,
        end,
      });
      dialogRef.current?.close();
      setOptions(null);
    },
    [options],
  );

  useEffect(() => {
    if (!options) return;
    dialogRef.current?.showModal();
  }, [options]);

  const handleDialogClick = (e: MouseEvent<HTMLDialogElement>) => {
    if (e.target !== e.currentTarget) return;
    const sel = window.getSelection();
    const hasSelectionInDialog =
      sel?.rangeCount &&
      sel.rangeCount > 0 &&
      dialogRef.current?.contains(sel.anchorNode);
    if (hasSelectionInDialog && sel?.toString().trim().length > 0) return;
    handleClose();
  };

  const handleFormChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormValues((prev) => {
        const opts = optionsRef.current;
        const next = {
          ...prev,
          [name]:
            name === "date" && isWeekend(parseDateInput(value))
              ? (() => {
                  const nextD = getNextWeekday(parseDateInput(value));
                  const prevD = getPreviousWeekday(parseDateInput(value));
                  const nextStr = formatDateForInput(nextD);
                  const prevStr = formatDateForInput(prevD);
                  if (opts?.maxDate && nextStr > opts.maxDate) return prevStr;
                  if (opts?.minDate && prevStr < opts.minDate) return nextStr;
                  let out = nextStr;
                  if (opts?.minDate && out < opts.minDate) out = opts.minDate;
                  if (opts?.maxDate && out > opts.maxDate) out = opts.maxDate;
                  return out;
                })()
              : value,
        };
        if (name === "name") {
          opts?.onDraftNameChange?.(value);
        } else if (
          opts?.onDraftChange &&
          (name === "date" || name === "start" || name === "end")
        ) {
          const dateStr = name === "date" ? next.date : prev.date;
          const startStr = name === "start" ? value : prev.start;
          const endStr = name === "end" ? value : prev.end;
          const d = parseDateInput(dateStr);
          const [startH, startM] = startStr.split(":").map(Number);
          const [endH, endM] = endStr.split(":").map(Number);
          const start = new Date(d);
          start.setHours(startH, startM, 0, 0);
          const end = new Date(d);
          end.setHours(endH, endM, 0, 0);
          opts.onDraftChange(start, end, d);
        }
        return next;
      });
    },
    [],
  );

  const updateCreateFormDraft = useCallback(
    (start: Date, end: Date, date: Date) => {
      if (!options) return;
      setFormValues((prev) => ({
        ...prev,
        date: formatDateForInput(date),
        start: formatMinutesAsTime(minutesFromMidnight(start)),
        end: formatMinutesAsTime(minutesFromMidnight(end)),
      }));
      setOptions((prev) => (prev ? { ...prev, start, end, date } : null));
    },
    [options],
  );

  const contextValue: ConfirmContextValue = useMemo(
    () => ({
      confirmMeetingCreation: openModal,
      updateCreateFormDraft,
    }),
    [openModal, updateCreateFormDraft],
  );

  return (
    <ConfirmMeetingCreationContext value={contextValue}>
      {children}
      {options &&
        createPortal(
          <dialog
            ref={dialogRef}
            className="animate-fade-in shadow-secondary-900/10 fixed w-[320px] rounded-2xl border border-white/60 bg-white/90 p-5 shadow-2xl backdrop-blur-xl backdrop:bg-transparent"
            onClick={handleDialogClick}
            onCancel={handleClose}
            style={
              modalPosition
                ? { left: modalPosition.left, top: modalPosition.top }
                : {
                    ...options.style,
                    left: "50%",
                    top: "50%",
                    transform: "translate(-50%, -50%)",
                  }
            }
          >
            <div className="flex flex-col gap-3">
              <div className="title-block">
                <h2 className="text-secondary-900 text-base font-semibold tracking-tight">
                  {options.title}
                </h2>
              </div>

              <form onSubmit={handleConfirm} className="flex flex-col gap-3.5">
                <input
                  name="name"
                  type="text"
                  placeholder="Meeting Name"
                  onChange={handleFormChange}
                  value={formValues.name}
                  required
                  className="border-secondary-200 text-secondary-900 placeholder:text-secondary-400 focus:border-primary-400 focus:ring-primary-100 rounded-xl border bg-white px-3 py-2 text-sm shadow-sm transition-colors duration-150 focus:ring-2 focus:outline-none"
                  aria-label="Meeting name"
                />
                <textarea
                  name="description"
                  placeholder="Meeting Description"
                  onChange={handleFormChange}
                  value={formValues.description}
                  className="border-secondary-200 text-secondary-900 placeholder:text-secondary-400 focus:border-primary-400 focus:ring-primary-100 resize-none rounded-xl border bg-white px-3 py-2 text-sm shadow-sm transition-colors duration-150 focus:ring-2 focus:outline-none"
                  maxLength={300}
                  rows={4}
                />
                {overlapError && (
                  <p
                    className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600"
                    role="alert"
                  >
                    {overlapError}
                  </p>
                )}
                <div className="flex flex-col gap-1.5">
                  <label
                    className="text-secondary-500 text-xs font-semibold tracking-wider uppercase"
                    htmlFor="date"
                  >
                    Day
                  </label>
                  <input
                    id="date"
                    name="date"
                    type="date"
                    min={options.minDate}
                    max={options.maxDate}
                    onChange={handleFormChange}
                    value={formValues.date}
                    className="border-secondary-200 text-secondary-900 focus:border-primary-400 focus:ring-primary-100 rounded-xl border bg-white px-3 py-2 text-sm shadow-sm transition-colors duration-150 focus:ring-2 focus:outline-none"
                    required
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    name="start"
                    type="time"
                    step={900}
                    min={formatMinutesAsTime(WORKDAY_START_MIN)}
                    max={formatMinutesAsTime(WORKDAY_END_MIN - 15)}
                    onChange={handleFormChange}
                    value={formValues.start}
                    className="border-secondary-200 text-secondary-900 focus:border-primary-400 focus:ring-primary-100 flex-1 rounded-xl border bg-white px-3 py-2 text-sm shadow-sm transition-colors duration-150 focus:ring-2 focus:outline-none"
                    required
                  />
                  <span className="text-secondary-400 text-sm">–</span>
                  <input
                    name="end"
                    type="time"
                    step={900}
                    min={(() => {
                      const [h, m] = formValues.start.split(":").map(Number);
                      const startMins = h * 60 + m;
                      return formatMinutesAsTime(
                        Math.min(startMins + 15, WORKDAY_END_MIN),
                      );
                    })()}
                    max={formatMinutesAsTime(WORKDAY_END_MIN)}
                    onChange={handleFormChange}
                    value={formValues.end}
                    required
                    className="border-secondary-200 text-secondary-900 focus:border-primary-400 focus:ring-primary-100 flex-1 rounded-xl border bg-white px-3 py-2 text-sm shadow-sm transition-colors duration-150 focus:ring-2 focus:outline-none"
                  />
                </div>

                <div className="flex gap-2 self-end pt-1">
                  <button
                    ref={cancelBtnRef}
                    className="border-secondary-200 text-secondary-700 hover:border-secondary-300 hover:bg-secondary-50 cursor-pointer rounded-xl border bg-white px-4 py-2 text-sm font-medium shadow-sm transition-all duration-200 active:scale-[0.97]"
                    onClick={handleClose}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="from-primary-500 to-primary-600 shadow-primary-500/20 hover:from-primary-600 hover:to-primary-700 hover:shadow-primary-500/25 cursor-pointer rounded-xl bg-linear-to-r px-4 py-2 text-sm font-medium text-white shadow-md transition-all duration-200 hover:shadow-lg active:scale-[0.97]"
                  >
                    Confirm
                  </button>
                </div>
              </form>
            </div>
          </dialog>,
          document.body,
        )}
    </ConfirmMeetingCreationContext>
  );
};

export const useConfirmMeetingCreation = () =>
  use(ConfirmMeetingCreationContext);

export const withConfirmMeetingCreationContext =
  // Any is expected
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  <T extends ComponentType<any>>(Component: T) =>
    (props: ComponentProps<T>) => (
      <ConfirmMeetingCreationProvider>
        <Component {...props} />
      </ConfirmMeetingCreationProvider>
    );
