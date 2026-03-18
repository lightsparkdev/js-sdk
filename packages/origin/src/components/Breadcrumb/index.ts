// Namespace export for compound component pattern
import {
  BreadcrumbRoot,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbEllipsis,
  BreadcrumbSeparator,
} from "./parts";

export {
  BreadcrumbRoot as Root,
  BreadcrumbList as List,
  BreadcrumbItem as Item,
  BreadcrumbLink as Link,
  BreadcrumbPage as Page,
  BreadcrumbEllipsis as Ellipsis,
  BreadcrumbSeparator as Separator,
  type BreadcrumbRootProps,
  type BreadcrumbListProps,
  type BreadcrumbItemProps,
  type BreadcrumbLinkProps,
  type BreadcrumbPageProps,
  type BreadcrumbEllipsisProps,
  type BreadcrumbSeparatorProps,
} from "./parts";

export const Breadcrumb = {
  Root: BreadcrumbRoot,
  List: BreadcrumbList,
  Item: BreadcrumbItem,
  Link: BreadcrumbLink,
  Page: BreadcrumbPage,
  Ellipsis: BreadcrumbEllipsis,
  Separator: BreadcrumbSeparator,
};
