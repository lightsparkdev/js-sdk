"use client";
import styled from "@emotion/styled";
import { z } from "@lightsparkdev/ui/styles/z-index";
import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";

interface BoundingRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const LightboxImage = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [boundingRect, setBoundingRect] = useState<BoundingRect>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const imageRef = useRef<HTMLImageElement>(null);

  const handleMouseUp = async () => {
    setIsOpen(!isOpen);
  };

  const handleSetBoundingRect = (ref: RefObject<HTMLImageElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (rect) {
      setBoundingRect({
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
      });
    }
  };

  useEffect(() => {
    handleSetBoundingRect(imageRef);
  }, [imageRef]);

  return (
    <>
      <DummyImage isOpen={isOpen} boundingRect={boundingRect} />
      <StyledImage
        isOpen={isOpen}
        ref={imageRef}
        boundingRect={boundingRect}
        onMouseDown={() => handleSetBoundingRect(imageRef)}
        onMouseUp={handleMouseUp}
      >
        {children}
      </StyledImage>

      <Lightbox isOpen={isOpen} onClick={handleMouseUp}></Lightbox>
    </>
  );
};

// Keeps the document body from scrolling when the lightbox is open
const DummyImage = styled.div<{ isOpen: boolean; boundingRect: BoundingRect }>`
  ${(props) =>
    props.isOpen
      ? `height: ${props.boundingRect.height}px; width: ${props.boundingRect.width}px;`
      : ``}
`;

const StyledImage = styled.div<{ isOpen: boolean; boundingRect: BoundingRect }>`
  display: flex;
  justify-content: start;
  align-items: center;
  z-index: ${z.modalContainer};

  animation-duration: 0.4s;
  animation-fill-mode: forwards;
  transition: all 0.2s ease-out;

  ${(props) =>
    props.isOpen
      ? `
    animation-direction: normal;
    position: fixed;
    animation-name: zoomIn;
    pointer-events: none;
  `
      : `
    &:hover {
      cursor: zoom-in;
    }
  `}

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  @keyframes zoomIn {
    from {
      ${(props) => {
        const { x, y, width, height } = props.boundingRect;
        return `
          top: ${y}px;
          left: ${x}px;
          width: ${width}px;
          height: ${height}px;
        `;
      }}
    }
    to {
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      padding: 24px;
    }
  }
`;

const Lightbox = styled.div<{ isOpen: boolean }>`
  transition: opacity 0.2s ease-out;
  position: fixed;
  opacity: 0;
  z-index: ${z.modalOverlay};
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;

  ${({ theme, isOpen }) =>
    isOpen
      ? `
    opacity: 1;
    background: ${theme.bg};

    &:hover {
      cursor: zoom-out;
    }
  `
      : `
    pointer-events: none;
  `}
`;
