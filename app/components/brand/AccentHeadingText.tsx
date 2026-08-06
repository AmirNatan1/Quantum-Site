import type { ReactNode } from "react";

export function AccentHeadingText({ text }: { text: string }) {
  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {text.split(/(\s+)/g).map((word, wordIndex) =>
          /^\s+$/.test(word) ? (
            word
          ) : (
            <span className="title-word" key={`${word}-${wordIndex}`}>
              {word.split(/(i)/g).map((part, partIndex) =>
                part === "i" ? (
                  <span className="title-i" key={`${wordIndex}-${partIndex}`}>{part}</span>
                ) : (
                  <span key={`${wordIndex}-${partIndex}`}>{part}</span>
                ),
              )}
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
}: {
  as: "h1" | "h2" | "h3";
  text: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <Element aria-label={text} className={className}>
      <AccentHeadingText text={text} />
      {children}
    </Element>
  );
}
