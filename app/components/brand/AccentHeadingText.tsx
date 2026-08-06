import type { ReactNode } from "react";

export function AccentHeadingText({
  text,
  reveal = false,
  accentI = false,
}: {
  text: string;
  reveal?: boolean;
  accentI?: boolean;
}) {
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
                {(accentI ? word.split(/(i)/g) : [word]).map((part, partIndex) =>
                  accentI && part === "i" ? (
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
  accentI,
}: {
  as: "h1" | "h2" | "h3";
  text: string;
  children?: ReactNode;
  className?: string;
  reveal?: boolean;
  accentI?: boolean;
}) {
  return (
    <Element aria-label={text} className={className}>
      <AccentHeadingText text={text} reveal={reveal ?? Element === "h2"} accentI={accentI} />
      {children}
    </Element>
  );
}
