interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function Toggle({ label, checked, onChange }: ToggleProps) {
  return (
    <div class="toggle-row">
      <span class="toggle-label">{label}</span>
      <label class="toggle">
        <input
          type="checkbox"
          class="toggle-input"
          checked={checked}
          onChange={(e) => onChange((e.target as HTMLInputElement).checked)}
        />
        <span class="toggle-track" />
      </label>
    </div>
  );
}
