import type { ReactNode } from "react";

export function AccentHeadingText({ text, reveal = false }: { text: string; reveal?: boolean }) {
  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" {...(reveal ? { "data-heading-reveal": "" } : {})}>
        {text.split(/(\s+)/g).map((word, wordIndex) =>
          /^\s+$/.test(word) ? (
            word
          ) : (
            <span className="title-word" key={`${word}-${wordIndex}`}>
              <span className="title-word-inner">
                {word.split(/(i)/g).map((part, partIndex) =>
                  part === "i" ? (
                    <span className="title-i" key={`${wordIndex}-${partIndex}`}>{part}</span>
                  ) : (
                    <span key={`${wordIndex}-${partIndex}`}>{part}</span>
                  ),
                )}
              </span>
            </span>
          ),
        )}
      </span>
    </>
  );
}

export function AccessibleHeading({
  as: Element,
  text,
  children,
  className,
  reveal,
}: {
  as: "h1" | "h2" | "h3";
  text: string;
  children?: ReactNode;
  className?: string;
  reveal?: boolean;
}) {
  return (
    <Element aria-label={text} className={className}>
      <AccentHeadingText text={text} reveal={reveal ?? Element === "h2"} />
      {children}
    </Element>
  );
}
