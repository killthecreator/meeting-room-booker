/**
 * Dashed vertical line at working/non-working boundary.
 * Uses border-dashed to achieve the dotted style.
 */
export function WorkBoundaryLine() {
  return (
    <span className="absolute left-0 top-0 bottom-0 w-0 border-r border-dashed border-secondary-400" />
  );
}
