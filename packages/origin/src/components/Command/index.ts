import { Root, Input, Footer } from "./parts";

import type {
  RootProps,
  InputProps,
  FooterProps,
  CommandItem,
  CommandGroup,
  CommandChangeEventDetails,
} from "./parts";

export const Command = {
  Root,
  Input,
  Footer,
};

export type {
  RootProps as CommandRootProps,
  InputProps as CommandInputProps,
  FooterProps as CommandFooterProps,
  CommandItem,
  CommandGroup,
  CommandChangeEventDetails,
};
