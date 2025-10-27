const PADDING_MAP = {
  sm: 'py-12 sm:py-16',
  md: 'py-20 sm:py-24',
  lg: 'py-24 sm:py-28',
};

export default function SectionBand({ children, size = 'md', withSpine = false, className = '', containerClassName = '', ...rest }) {
  const padding = PADDING_MAP[size] || PADDING_MAP.md;
  const outerClasses = ['band', withSpine ? 'spine' : '', padding, className].filter(Boolean).join(' ');
  const innerClasses = ['relative mx-auto w-full max-w-5xl', containerClassName].filter(Boolean).join(' ');

  return (
    <section {...rest} className={outerClasses}>
      <div className={innerClasses}>{children}</div>
    </section>
  );
}
