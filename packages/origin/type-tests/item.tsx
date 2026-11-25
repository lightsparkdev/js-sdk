import { Item, type ItemProps } from "../src";

interface WrapperProps extends ItemProps {
  analyticsName: string;
}

function ItemWrapper({ analyticsName, ...props }: WrapperProps) {
  return <Item data-analytics-name={analyticsName} {...props} />;
}

<ItemWrapper
  analyticsName="settings"
  title="Account settings"
  disclosure
  trailing={<span>Custom action</span>}
/>;
