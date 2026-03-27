/**
 * Test fixtures for Autocomplete component.
 * Used by Playwright component tests.
 */
import * as React from "react";
import * as Autocomplete from "./parts";
import { CentralIcon } from "@/components/Icon";

interface Fruit {
  value: string;
  label: string;
}

const fruits: Fruit[] = [
  { value: "apple", label: "Apple" },
  { value: "banana", label: "Banana" },
  { value: "cherry", label: "Cherry" },
  { value: "date", label: "Date" },
  { value: "elderberry", label: "Elderberry" },
];

const groupedItems = [
  {
    label: "Fruits",
    items: [
      { value: "apple", label: "Apple" },
      { value: "banana", label: "Banana" },
    ],
  },
  {
    label: "Vegetables",
    items: [
      { value: "carrot", label: "Carrot" },
      { value: "broccoli", label: "Broccoli" },
    ],
  },
];

/**
 * Basic autocomplete with items
 */
export function BasicAutocomplete() {
  return (
    <Autocomplete.Root items={fruits}>
      <Autocomplete.Input placeholder="Search fruits..." />
      <Autocomplete.Portal>
        <Autocomplete.Positioner>
          <Autocomplete.Popup>
            <Autocomplete.Empty>No results found.</Autocomplete.Empty>
            <Autocomplete.List>
              {(item: Fruit) => (
                <Autocomplete.Item key={item.value} value={item}>
                  {item.label}
                </Autocomplete.Item>
              )}
            </Autocomplete.List>
          </Autocomplete.Popup>
        </Autocomplete.Positioner>
      </Autocomplete.Portal>
    </Autocomplete.Root>
  );
}

/**
 * Autocomplete with leading icons
 */
export function WithLeadingIcon() {
  return (
    <Autocomplete.Root items={fruits}>
      <Autocomplete.Input placeholder="Search fruits..." />
      <Autocomplete.Portal>
        <Autocomplete.Positioner>
          <Autocomplete.Popup>
            <Autocomplete.Empty>No results found.</Autocomplete.Empty>
            <Autocomplete.List>
              {(item: Fruit) => (
                <Autocomplete.Item
                  key={item.value}
                  value={item}
                  leadingIcon={<CentralIcon name="IconGlobe2" size={16} />}
                >
                  {item.label}
                </Autocomplete.Item>
              )}
            </Autocomplete.List>
          </Autocomplete.Popup>
        </Autocomplete.Positioner>
      </Autocomplete.Portal>
    </Autocomplete.Root>
  );
}

/**
 * Autocomplete with disabled items
 */
export function WithDisabledItems() {
  return (
    <Autocomplete.Root items={fruits}>
      <Autocomplete.Input placeholder="Search fruits..." />
      <Autocomplete.Portal>
        <Autocomplete.Positioner>
          <Autocomplete.Popup>
            <Autocomplete.Empty>No results found.</Autocomplete.Empty>
            <Autocomplete.List>
              {(item: Fruit) => (
                <Autocomplete.Item
                  key={item.value}
                  value={item}
                  disabled={item.value === "cherry"}
                >
                  {item.label}
                </Autocomplete.Item>
              )}
            </Autocomplete.List>
          </Autocomplete.Popup>
        </Autocomplete.Positioner>
      </Autocomplete.Portal>
    </Autocomplete.Root>
  );
}

/**
 * Disabled autocomplete
 */
export function DisabledAutocomplete() {
  return (
    <Autocomplete.Root items={fruits} disabled>
      <Autocomplete.Input placeholder="Search fruits..." />
      <Autocomplete.Portal>
        <Autocomplete.Positioner>
          <Autocomplete.Popup>
            <Autocomplete.List>
              {(item: Fruit) => (
                <Autocomplete.Item key={item.value} value={item}>
                  {item.label}
                </Autocomplete.Item>
              )}
            </Autocomplete.List>
          </Autocomplete.Popup>
        </Autocomplete.Positioner>
      </Autocomplete.Portal>
    </Autocomplete.Root>
  );
}

/**
 * Grouped autocomplete
 */
export function GroupedAutocomplete() {
  return (
    <Autocomplete.Root items={groupedItems}>
      <Autocomplete.Input placeholder="Search produce..." />
      <Autocomplete.Portal>
        <Autocomplete.Positioner>
          <Autocomplete.Popup>
            <Autocomplete.Empty>No results found.</Autocomplete.Empty>
            <Autocomplete.List>
              {(group: (typeof groupedItems)[0]) => (
                <Autocomplete.Group key={group.label} items={group.items}>
                  <Autocomplete.GroupLabel>
                    {group.label}
                  </Autocomplete.GroupLabel>
                  <Autocomplete.Collection>
                    {(item: Fruit) => (
                      <Autocomplete.Item key={item.value} value={item}>
                        {item.label}
                      </Autocomplete.Item>
                    )}
                  </Autocomplete.Collection>
                </Autocomplete.Group>
              )}
            </Autocomplete.List>
          </Autocomplete.Popup>
        </Autocomplete.Positioner>
      </Autocomplete.Portal>
    </Autocomplete.Root>
  );
}

/**
 * Autocomplete with loading state (async)
 */
export function AsyncAutocomplete() {
  const [items, setItems] = React.useState<Fruit[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [value, setValue] = React.useState("");

  React.useEffect(() => {
    if (!value) {
      setItems([]);
      return;
    }

    setLoading(true);
    const timer = setTimeout(() => {
      setItems(
        fruits.filter((f) =>
          f.label.toLowerCase().includes(value.toLowerCase()),
        ),
      );
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [value]);

  return (
    <Autocomplete.Root
      items={items}
      value={value}
      onValueChange={setValue}
      filter={null}
    >
      <Autocomplete.Input placeholder="Search fruits..." />
      <Autocomplete.Portal>
        <Autocomplete.Positioner>
          <Autocomplete.Popup>
            <Autocomplete.Status>
              {loading ? "Loading..." : null}
            </Autocomplete.Status>
            <Autocomplete.Empty>
              {!loading && value ? "No results found." : null}
            </Autocomplete.Empty>
            <Autocomplete.List>
              {(item: Fruit) => (
                <Autocomplete.Item key={item.value} value={item}>
                  {item.label}
                </Autocomplete.Item>
              )}
            </Autocomplete.List>
          </Autocomplete.Popup>
        </Autocomplete.Positioner>
      </Autocomplete.Portal>
    </Autocomplete.Root>
  );
}

/**
 * Controlled autocomplete
 */
export function ControlledAutocomplete() {
  const [value, setValue] = React.useState("");

  return (
    <div>
      <Autocomplete.Root items={fruits} value={value} onValueChange={setValue}>
        <Autocomplete.Input placeholder="Search fruits..." />
        <Autocomplete.Portal>
          <Autocomplete.Positioner>
            <Autocomplete.Popup>
              <Autocomplete.Empty>No results found.</Autocomplete.Empty>
              <Autocomplete.List>
                {(item: Fruit) => (
                  <Autocomplete.Item key={item.value} value={item}>
                    {item.label}
                  </Autocomplete.Item>
                )}
              </Autocomplete.List>
            </Autocomplete.Popup>
          </Autocomplete.Positioner>
        </Autocomplete.Portal>
      </Autocomplete.Root>
      <p data-testid="value-display">Value: {value}</p>
    </div>
  );
}
