/** Text that rolls up to a duplicate copy on hover, letter by letter. */
export function RollText({ text }: { text: string }) {
  const chars = Array.from(text);
  return (
    <span className="roll" aria-label={text}>
      <span className="roll__row" aria-hidden="true">
        {chars.map((c, i) => (
          <span key={i} className="roll__char" style={{ transitionDelay: `${i * 18}ms` }}>
            {c === " " ? " " : c}
          </span>
        ))}
      </span>
      <span className="roll__row roll__row--b" aria-hidden="true">
        {chars.map((c, i) => (
          <span key={i} className="roll__char" style={{ transitionDelay: `${i * 18}ms` }}>
            {c === " " ? " " : c}
          </span>
        ))}
      </span>
    </span>
  );
}
