import Button from "@/components/Form/Button";

type DigitButtonProps = {
  digit: number,
  /** How many of this digit are still to be placed on the board */
  remaining: number,
  notesActive: boolean,
  disabled?: boolean,
  onClick?: () => void
}

const DigitButton = ({digit, remaining, notesActive, disabled = false, onClick}: DigitButtonProps) => {
  const placed = remaining <= 0;

  return (
    <Button
      variant={notesActive ? 'secondary' : 'primary'}
      density='square'
      onClick={onClick}
      disabled={disabled || placed}
      ariaLabel={
        notesActive
          ? `Toggle note ${digit}, ${remaining} left to place`
          : `Enter ${digit}, ${remaining} left to place`
      }
      className={`aspect-square text-2xl md:text-[32px] ${notesActive ? 'text-emerald-700 border-emerald-300' : ''}`}
    >
      {digit}
      {/* Remaining count, hidden from assistive tech since the label already says it */}
      <span
        aria-hidden='true'
        className={`absolute top-1 right-1.5 md:top-1.5 md:right-2.5 text-xs md:text-[15px] font-semibold leading-none ${notesActive ? 'text-emerald-600' : 'text-white/80'}`}
      >
        {remaining > 0 ? remaining : ''}
      </span>
    </Button>
  )
}

export default DigitButton;
