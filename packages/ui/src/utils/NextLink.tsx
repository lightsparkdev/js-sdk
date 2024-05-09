import {
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type ReactNode,
} from "react";

type NextLinkWrapperProps = {
  href: string;
  text: string;
  target?: "_blank" | undefined;
};

type NextLinkProps = {
  children: ReactNode;
  href: string;
  target?: "_blank" | undefined;
};

export function NextLink({ href, text, target }: NextLinkWrapperProps) {
  const NextLinkRef = useRef<null | ComponentType<NextLinkProps>>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    void (async () => {
      try {
        /* We need to dynamically load NextLink because it globally references process which doesn't
           exist in the browser and causes vite bundles to have a reference error */
        const nextLinkModule = await import("next/link.js");
        NextLinkRef.current =
          nextLinkModule.default as unknown as ComponentType<NextLinkProps>;
      } catch (e) {
        /* ignore, will fallback to default link */
      }
      setReady(true);
    })();
  });

  const InternalNextLink = NextLinkRef.current;

  if (!ready || !InternalNextLink) {
    return <a href={href}>{text}</a>;
  }

  return (
    <InternalNextLink href={href} target={target}>
      {text}
    </InternalNextLink>
  );
}
