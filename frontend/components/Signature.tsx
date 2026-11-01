export default function Signature({
  compact = false,
}: {
  compact?: boolean;
}) {
  return (
    <div className="sig-plate">
      <span className="sig-mark" aria-hidden>
        AK
      </span>
      <div className="min-w-0">
        <p className="sig-label">{compact ? 'Author' : 'Operator signature'}</p>
        <p className="sig-name">Андрій Коносюк КІм-26-1</p>
      </div>
    </div>
  );
}
