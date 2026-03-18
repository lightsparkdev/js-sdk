import {
  DrawerProvider,
  DrawerRoot,
  DrawerTrigger,
  DrawerPortal,
  DrawerBackdrop,
  DrawerViewport,
  DrawerPopup,
  DrawerContent,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
  DrawerHandle,
  DrawerIndent,
  DrawerIndentBackground,
} from "./parts";

import { Drawer as BaseDrawerNamespace } from "@base-ui/react/drawer";

export {
  DrawerProvider as Provider,
  DrawerRoot as Root,
  DrawerTrigger as Trigger,
  DrawerPortal as Portal,
  DrawerBackdrop as Backdrop,
  DrawerViewport as Viewport,
  DrawerPopup as Popup,
  DrawerContent as Content,
  DrawerTitle as Title,
  DrawerDescription as Description,
  DrawerClose as Close,
  DrawerHandle as Handle,
  DrawerIndent as Indent,
  DrawerIndentBackground as IndentBackground,
} from "./parts";

export type {
  DrawerProviderProps,
  DrawerRootProps,
  DrawerTriggerProps,
  DrawerPortalProps,
  DrawerBackdropProps,
  DrawerViewportProps,
  DrawerPopupProps,
  DrawerContentProps,
  DrawerTitleProps,
  DrawerDescriptionProps,
  DrawerCloseProps,
  DrawerHandleProps,
  DrawerIndentProps,
  DrawerIndentBackgroundProps,
} from "./parts";

export { Drawer as BaseDrawer } from "@base-ui/react/drawer";

export const createHandle = BaseDrawerNamespace.createHandle;

export const Drawer = {
  Provider: DrawerProvider,
  Root: DrawerRoot,
  Trigger: DrawerTrigger,
  Portal: DrawerPortal,
  Backdrop: DrawerBackdrop,
  Viewport: DrawerViewport,
  Popup: DrawerPopup,
  Content: DrawerContent,
  Title: DrawerTitle,
  Description: DrawerDescription,
  Close: DrawerClose,
  Handle: DrawerHandle,
  Indent: DrawerIndent,
  IndentBackground: DrawerIndentBackground,
  createHandle: BaseDrawerNamespace.createHandle,
};
