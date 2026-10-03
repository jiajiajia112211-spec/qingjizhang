import { motion } from 'framer-motion';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

/** iOS 风格开关（51×31，绿色 #34C759） */
export function Switch({ checked, onChange, disabled }: SwitchProps) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative h-[31px] w-[51px] shrink-0 rounded-full transition-colors duration-200 ${
        checked ? 'bg-ios-green' : 'bg-black/15 dark:bg-white/20'
      } ${disabled ? 'opacity-40' : ''}`}
    >
      <motion.span
        className="absolute top-[2px] h-[27px] w-[27px] rounded-full bg-white shadow-md"
        animate={{ left: checked ? 22 : 2 }}
        transition={{ type: 'spring', damping: 24, stiffness: 500 }}
      />
    </button>
  );
}
