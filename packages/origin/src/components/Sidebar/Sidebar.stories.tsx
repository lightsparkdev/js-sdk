import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { Sidebar, useSidebar } from "./index";
import { CentralIcon } from "../Icon";
import { Shortcut } from "../Shortcut";

const meta: Meta<typeof Sidebar.Root> = {
  title: "Components/Sidebar",
  component: Sidebar.Root,
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {
    collapsed: { control: "boolean" },
    width: { control: "number", description: "Width when expanded (px)" },
    collapsedWidth: {
      control: "number",
      description: "Width when collapsed (px)",
    },
    itemSize: {
      control: "number",
      description: "Item size when collapsed (px)",
    },
  },
  decorators: [
    (Story) => (
      <div style={{ height: "600px", display: "flex" }}>
        <Story />
        <div
          style={{
            flex: 1,
            padding: "1rem",
            backgroundColor: "var(--surface-primary)",
          }}
        >
          <p>Main content area</p>
        </div>
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Sidebar.Root>;

/**
 * Default expanded sidebar with groups and items.
 */
export const Default: Story = {
  args: { collapsed: false },
  render: (args) => (
    <Sidebar.Root collapsed={args.collapsed}>
      <Sidebar.Header>
        <div
          style={{
            padding: "var(--spacing-xs)",
            backgroundColor: "var(--surface-secondary)",
            textAlign: "center",
          }}
        >
          Header Slot
        </div>
      </Sidebar.Header>
      <Sidebar.Content>
        <Sidebar.Group>
          <Sidebar.GroupLabel>Navigation</Sidebar.GroupLabel>
          <Sidebar.Menu>
            <Sidebar.Item
              icon={<CentralIcon name="IconHome" size={20} />}
              active
            >
              Dashboard
            </Sidebar.Item>
            <Sidebar.Item
              icon={<CentralIcon name="IconPeopleCircle" size={20} />}
            >
              Profile
            </Sidebar.Item>
            <Sidebar.Item
              icon={<CentralIcon name="IconSettingsGear1" size={20} />}
            >
              Settings
            </Sidebar.Item>
          </Sidebar.Menu>
        </Sidebar.Group>
        <Sidebar.Group>
          <Sidebar.GroupLabel>Projects</Sidebar.GroupLabel>
          <Sidebar.Menu>
            <Sidebar.Item
              icon={<CentralIcon name="IconSquareBehindSquare1" size={20} />}
            >
              All Projects
            </Sidebar.Item>
            <Sidebar.Item icon={<CentralIcon name="IconHeart2" size={20} />}>
              Favorites
            </Sidebar.Item>
          </Sidebar.Menu>
        </Sidebar.Group>
      </Sidebar.Content>
      <Sidebar.Footer>
        <div
          style={{
            padding: "var(--spacing-xs)",
            backgroundColor: "var(--surface-secondary)",
            textAlign: "center",
          }}
        >
          Footer Slot
        </div>
      </Sidebar.Footer>
    </Sidebar.Root>
  ),
};

/**
 * Uses Provider for external state management with the built-in Trigger component.
 * The Trigger can be placed anywhere within the Provider.
 */
export const WithProviderAndTrigger: Story = {
  render: () => (
    <Sidebar.Provider defaultCollapsed={false}>
      <Sidebar.Root>
        <Sidebar.Header>
          <div
            style={{
              padding: "var(--spacing-xs)",
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <Sidebar.Trigger />
          </div>
        </Sidebar.Header>
        <Sidebar.Content>
          <Sidebar.Group>
            <Sidebar.GroupLabel>Navigation</Sidebar.GroupLabel>
            <Sidebar.Menu>
              <Sidebar.Item
                icon={<CentralIcon name="IconHome" size={20} />}
                active
              >
                Dashboard
              </Sidebar.Item>
              <Sidebar.Item
                icon={<CentralIcon name="IconPeopleCircle" size={20} />}
              >
                Profile
              </Sidebar.Item>
              <Sidebar.Item
                icon={<CentralIcon name="IconSettingsGear1" size={20} />}
              >
                Settings
              </Sidebar.Item>
            </Sidebar.Menu>
          </Sidebar.Group>
        </Sidebar.Content>
      </Sidebar.Root>
    </Sidebar.Provider>
  ),
};

/**
 * Controlled collapsed state with custom toggle button using useSidebar hook.
 */
function ControlledSidebarContent() {
  const { collapsed, toggle } = useSidebar();

  return (
    <>
      <Sidebar.Root>
        <Sidebar.Header>
          <div style={{ padding: "var(--spacing-xs)" }}>
            <button
              onClick={toggle}
              style={{
                width: collapsed ? 36 : "100%",
                height: 36,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "var(--surface-secondary)",
                border: "none",
                borderRadius: "var(--corner-radius-md)",
                cursor: "pointer",
              }}
            >
              <CentralIcon
                name={collapsed ? "IconChevronRight" : "IconChevronLeft"}
                size={20}
              />
            </button>
          </div>
        </Sidebar.Header>
        <Sidebar.Content>
          <Sidebar.Group>
            <Sidebar.GroupLabel>Navigation</Sidebar.GroupLabel>
            <Sidebar.Menu>
              <Sidebar.Item
                icon={<CentralIcon name="IconHome" size={20} />}
                active
              >
                Dashboard
              </Sidebar.Item>
              <Sidebar.Item
                icon={<CentralIcon name="IconPeopleCircle" size={20} />}
              >
                Profile
              </Sidebar.Item>
              <Sidebar.Item
                icon={<CentralIcon name="IconSettingsGear1" size={20} />}
              >
                Settings
              </Sidebar.Item>
            </Sidebar.Menu>
          </Sidebar.Group>
        </Sidebar.Content>
      </Sidebar.Root>
      <div style={{ flex: 1, padding: "1rem" }}>
        <p>Click the chevron to toggle collapsed state</p>
        <p>Current state: {collapsed ? "Collapsed" : "Expanded"}</p>
        <p>
          <strong>Note:</strong> This uses the useSidebar() hook to access
          toggle function.
        </p>
      </div>
    </>
  );
}

export const Controlled: Story = {
  decorators: [
    (Story) => (
      <div style={{ height: "600px", display: "flex" }}>
        <Story />
      </div>
    ),
  ],
  render: () => (
    <Sidebar.Provider>
      <ControlledSidebarContent />
    </Sidebar.Provider>
  ),
};

/**
 * Sidebar with expandable/collapsible submenus using the border variant (default).
 */
export const WithExpandableItems: Story = {
  render: () => (
    <Sidebar.Root>
      <Sidebar.Content>
        <Sidebar.Group>
          <Sidebar.GroupLabel>Navigation</Sidebar.GroupLabel>
          <Sidebar.Menu>
            <Sidebar.Item
              icon={<CentralIcon name="IconHome" size={20} />}
              active
            >
              Dashboard
            </Sidebar.Item>
            <Sidebar.ExpandableItem
              icon={<CentralIcon name="IconSquareBehindSquare1" size={20} />}
              label="Projects"
              defaultOpen
            >
              <Sidebar.SubmenuItem
                icon={<CentralIcon name="IconFileBend" size={20} />}
              >
                Project Alpha
              </Sidebar.SubmenuItem>
              <Sidebar.SubmenuItem
                icon={<CentralIcon name="IconFileBend" size={20} />}
              >
                Project Beta
              </Sidebar.SubmenuItem>
              <Sidebar.SubmenuItem
                icon={<CentralIcon name="IconFileBend" size={20} />}
              >
                Project Gamma
              </Sidebar.SubmenuItem>
            </Sidebar.ExpandableItem>
            <Sidebar.ExpandableItem
              icon={<CentralIcon name="IconSettingsGear1" size={20} />}
              label="Settings"
            >
              <Sidebar.SubmenuItem
                icon={<CentralIcon name="IconPeopleCircle" size={20} />}
              >
                Account
              </Sidebar.SubmenuItem>
              <Sidebar.SubmenuItem
                icon={<CentralIcon name="IconLock" size={20} />}
              >
                Security
              </Sidebar.SubmenuItem>
            </Sidebar.ExpandableItem>
          </Sidebar.Menu>
        </Sidebar.Group>
      </Sidebar.Content>
    </Sidebar.Root>
  ),
};

/**
 * Expandable items with the indent submenu variant (no border, equal 8px padding).
 */
export const SubmenuIndentVariant: Story = {
  render: () => (
    <Sidebar.Root>
      <Sidebar.Content>
        <Sidebar.Group>
          <Sidebar.GroupLabel>Navigation</Sidebar.GroupLabel>
          <Sidebar.Menu>
            <Sidebar.Item
              icon={<CentralIcon name="IconHome" size={20} />}
              active
            >
              Dashboard
            </Sidebar.Item>
            <Sidebar.ExpandableItem
              icon={<CentralIcon name="IconSquareBehindSquare1" size={20} />}
              label="Projects"
              submenuVariant="indent"
              defaultOpen
            >
              <Sidebar.SubmenuItem
                icon={<CentralIcon name="IconFileBend" size={20} />}
              >
                Project Alpha
              </Sidebar.SubmenuItem>
              <Sidebar.SubmenuItem
                icon={<CentralIcon name="IconFileBend" size={20} />}
              >
                Project Beta
              </Sidebar.SubmenuItem>
              <Sidebar.SubmenuItem
                icon={<CentralIcon name="IconFileBend" size={20} />}
              >
                Project Gamma
              </Sidebar.SubmenuItem>
            </Sidebar.ExpandableItem>
            <Sidebar.ExpandableItem
              icon={<CentralIcon name="IconSettingsGear1" size={20} />}
              label="Settings"
              submenuVariant="indent"
            >
              <Sidebar.SubmenuItem
                icon={<CentralIcon name="IconPeopleCircle" size={20} />}
              >
                Account
              </Sidebar.SubmenuItem>
              <Sidebar.SubmenuItem
                icon={<CentralIcon name="IconLock" size={20} />}
              >
                Security
              </Sidebar.SubmenuItem>
            </Sidebar.ExpandableItem>
          </Sidebar.Menu>
        </Sidebar.Group>
      </Sidebar.Content>
    </Sidebar.Root>
  ),
};

/**
 * Sidebar with disabled items.
 */
export const WithDisabledItems: Story = {
  render: () => (
    <Sidebar.Root>
      <Sidebar.Content>
        <Sidebar.Group>
          <Sidebar.GroupLabel>Navigation</Sidebar.GroupLabel>
          <Sidebar.Menu>
            <Sidebar.Item
              icon={<CentralIcon name="IconHome" size={20} />}
              active
            >
              Dashboard
            </Sidebar.Item>
            <Sidebar.Item
              icon={<CentralIcon name="IconPeopleCircle" size={20} />}
            >
              Profile
            </Sidebar.Item>
            <Sidebar.Item
              icon={<CentralIcon name="IconSettingsGear1" size={20} />}
              disabled
            >
              Settings (disabled)
            </Sidebar.Item>
            <Sidebar.Item
              icon={<CentralIcon name="IconLock" size={20} />}
              disabled
            >
              Admin (disabled)
            </Sidebar.Item>
          </Sidebar.Menu>
        </Sidebar.Group>
      </Sidebar.Content>
    </Sidebar.Root>
  ),
};

/**
 * Sidebar with separator between groups.
 */
export const WithSeparator: Story = {
  render: () => (
    <Sidebar.Root>
      <Sidebar.Content>
        <Sidebar.Group>
          <Sidebar.GroupLabel>Navigation</Sidebar.GroupLabel>
          <Sidebar.Menu>
            <Sidebar.Item
              icon={<CentralIcon name="IconHome" size={20} />}
              active
            >
              Dashboard
            </Sidebar.Item>
            <Sidebar.Item
              icon={<CentralIcon name="IconPeopleCircle" size={20} />}
            >
              Profile
            </Sidebar.Item>
          </Sidebar.Menu>
        </Sidebar.Group>
        <Sidebar.Separator />
        <Sidebar.Group>
          <Sidebar.GroupLabel>Settings</Sidebar.GroupLabel>
          <Sidebar.Menu>
            <Sidebar.Item
              icon={<CentralIcon name="IconSettingsGear1" size={20} />}
            >
              Preferences
            </Sidebar.Item>
            <Sidebar.Item icon={<CentralIcon name="IconLock" size={20} />}>
              Security
            </Sidebar.Item>
          </Sidebar.Menu>
        </Sidebar.Group>
      </Sidebar.Content>
    </Sidebar.Root>
  ),
};

/**
 * Item as a link using the render prop for polymorphism.
 */
export const ItemAsLink: Story = {
  render: () => (
    <Sidebar.Root>
      <Sidebar.Content>
        <Sidebar.Group>
          <Sidebar.GroupLabel>Navigation</Sidebar.GroupLabel>
          <Sidebar.Menu>
            <Sidebar.Item
              icon={<CentralIcon name="IconHome" size={20} />}
              active
              render={<a href="/dashboard" />}
            >
              Dashboard
            </Sidebar.Item>
            <Sidebar.Item
              icon={<CentralIcon name="IconPeopleCircle" size={20} />}
              render={<a href="/profile" />}
            >
              Profile
            </Sidebar.Item>
            <Sidebar.Item
              icon={<CentralIcon name="IconSettingsGear1" size={20} />}
              render={<a href="/settings" />}
            >
              Settings
            </Sidebar.Item>
          </Sidebar.Menu>
        </Sidebar.Group>
      </Sidebar.Content>
    </Sidebar.Root>
  ),
};

/**
 * Full featured sidebar matching Figma design.
 */
export const FigmaDesign: Story = {
  render: () => (
    <Sidebar.Root>
      <Sidebar.Header>
        <div
          style={{
            padding: "var(--spacing-xs)",
            backgroundColor: "var(--surface-secondary)",
            textAlign: "center",
          }}
        >
          Slot
        </div>
      </Sidebar.Header>
      <Sidebar.Content>
        <Sidebar.Group>
          <Sidebar.GroupLabel>Group header</Sidebar.GroupLabel>
          <Sidebar.Menu>
            <Sidebar.ExpandableItem
              icon={<CentralIcon name="IconGlobe2" size={20} />}
              label="Label"
              defaultOpen
            >
              <Sidebar.SubmenuItem
                icon={<CentralIcon name="IconGlobe2" size={20} />}
              >
                Label
              </Sidebar.SubmenuItem>
              <Sidebar.SubmenuItem
                icon={<CentralIcon name="IconGlobe2" size={20} />}
              >
                Label
              </Sidebar.SubmenuItem>
              <Sidebar.SubmenuItem
                icon={<CentralIcon name="IconGlobe2" size={20} />}
              >
                Label
              </Sidebar.SubmenuItem>
              <Sidebar.SubmenuItem
                icon={<CentralIcon name="IconGlobe2" size={20} />}
              >
                Label
              </Sidebar.SubmenuItem>
            </Sidebar.ExpandableItem>
          </Sidebar.Menu>
        </Sidebar.Group>
        <Sidebar.Group>
          <Sidebar.GroupLabel>Group header</Sidebar.GroupLabel>
          <Sidebar.Menu>
            <Sidebar.ExpandableItem
              icon={<CentralIcon name="IconGlobe2" size={20} />}
              label="Label"
              defaultOpen
            >
              <Sidebar.SubmenuItem
                icon={<CentralIcon name="IconGlobe2" size={20} />}
              >
                Label
              </Sidebar.SubmenuItem>
              <Sidebar.SubmenuItem
                icon={<CentralIcon name="IconGlobe2" size={20} />}
              >
                Label
              </Sidebar.SubmenuItem>
              <Sidebar.SubmenuItem
                icon={<CentralIcon name="IconGlobe2" size={20} />}
              >
                Label
              </Sidebar.SubmenuItem>
              <Sidebar.SubmenuItem
                icon={<CentralIcon name="IconGlobe2" size={20} />}
              >
                Label
              </Sidebar.SubmenuItem>
            </Sidebar.ExpandableItem>
          </Sidebar.Menu>
        </Sidebar.Group>
      </Sidebar.Content>
      <Sidebar.Footer>
        <div
          style={{
            padding: "var(--spacing-xs)",
            backgroundColor: "var(--surface-secondary)",
            textAlign: "center",
          }}
        >
          Slot
        </div>
      </Sidebar.Footer>
    </Sidebar.Root>
  ),
};

/**
 * Custom sizing via props. Width, collapsedWidth, and itemSize can be customized.
 */
export const CustomSizing: Story = {
  render: () => (
    <Sidebar.Provider>
      <Sidebar.Root width={280} collapsedWidth={64} itemSize={40}>
        <Sidebar.Header>
          <div
            style={{
              padding: "var(--spacing-xs)",
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <Sidebar.Trigger />
          </div>
        </Sidebar.Header>
        <Sidebar.Content>
          <Sidebar.Group>
            <Sidebar.GroupLabel>Custom Width: 280px</Sidebar.GroupLabel>
            <Sidebar.Menu>
              <Sidebar.Item
                icon={<CentralIcon name="IconHome" size={20} />}
                active
              >
                Dashboard
              </Sidebar.Item>
              <Sidebar.Item
                icon={<CentralIcon name="IconPeopleCircle" size={20} />}
              >
                Profile
              </Sidebar.Item>
              <Sidebar.Item
                icon={<CentralIcon name="IconSettingsGear1" size={20} />}
              >
                Settings
              </Sidebar.Item>
            </Sidebar.Menu>
          </Sidebar.Group>
        </Sidebar.Content>
      </Sidebar.Root>
    </Sidebar.Provider>
  ),
};

/**
 * DrilldownItem variant - items with a navigation button on the right.
 * Clicking the main area and the button can trigger different actions.
 */
export const WithDrilldownItems: Story = {
  render: () => (
    <Sidebar.Root>
      <Sidebar.Content>
        <Sidebar.Group>
          <Sidebar.GroupLabel>Drilldown Navigation</Sidebar.GroupLabel>
          <Sidebar.Menu>
            <Sidebar.Item
              icon={<CentralIcon name="IconHome" size={20} />}
              active
            >
              Dashboard
            </Sidebar.Item>
            <Sidebar.DrilldownItem
              icon={<CentralIcon name="IconSquareBehindSquare1" size={20} />}
              onClick={() => console.log("Selected Projects")}
              onDrilldown={() => console.log("Navigate to Projects")}
            >
              Projects
            </Sidebar.DrilldownItem>
            <Sidebar.DrilldownItem
              icon={<CentralIcon name="IconPeopleCircle" size={20} />}
              onClick={() => console.log("Selected Team")}
              onDrilldown={() => console.log("Navigate to Team")}
            >
              Team
            </Sidebar.DrilldownItem>
            <Sidebar.DrilldownItem
              icon={<CentralIcon name="IconSettingsGear1" size={20} />}
              disabled
            >
              Settings (disabled)
            </Sidebar.DrilldownItem>
          </Sidebar.Menu>
        </Sidebar.Group>
      </Sidebar.Content>
    </Sidebar.Root>
  ),
};

/**
 * TreeItem variant - expandable items with horizontal chevron that rotates 90° when expanded.
 */
export const WithTreeItems: Story = {
  render: () => (
    <Sidebar.Root>
      <Sidebar.Content>
        <Sidebar.Group>
          <Sidebar.GroupLabel>Tree Navigation</Sidebar.GroupLabel>
          <Sidebar.Menu>
            <Sidebar.Item
              icon={<CentralIcon name="IconHome" size={20} />}
              active
            >
              Dashboard
            </Sidebar.Item>
            <Sidebar.TreeItem
              icon={<CentralIcon name="IconSquareBehindSquare1" size={20} />}
              label="Projects"
              defaultOpen
            >
              <Sidebar.SubmenuItem
                icon={<CentralIcon name="IconFileBend" size={20} />}
              >
                Project Alpha
              </Sidebar.SubmenuItem>
              <Sidebar.SubmenuItem
                icon={<CentralIcon name="IconFileBend" size={20} />}
              >
                Project Beta
              </Sidebar.SubmenuItem>
              <Sidebar.TreeItem
                icon={<CentralIcon name="IconSquareBehindSquare1" size={20} />}
                label="Nested Folder"
              >
                <Sidebar.SubmenuItem
                  icon={<CentralIcon name="IconFileBend" size={20} />}
                >
                  Nested Item 1
                </Sidebar.SubmenuItem>
                <Sidebar.SubmenuItem
                  icon={<CentralIcon name="IconFileBend" size={20} />}
                >
                  Nested Item 2
                </Sidebar.SubmenuItem>
              </Sidebar.TreeItem>
            </Sidebar.TreeItem>
            <Sidebar.TreeItem
              icon={<CentralIcon name="IconSettingsGear1" size={20} />}
              label="Settings"
            >
              <Sidebar.SubmenuItem
                icon={<CentralIcon name="IconPeopleCircle" size={20} />}
              >
                Account
              </Sidebar.SubmenuItem>
              <Sidebar.SubmenuItem
                icon={<CentralIcon name="IconLock" size={20} />}
              >
                Security
              </Sidebar.SubmenuItem>
            </Sidebar.TreeItem>
          </Sidebar.Menu>
        </Sidebar.Group>
      </Sidebar.Content>
    </Sidebar.Root>
  ),
};

/**
 * Items with keyboard shortcuts using the Shortcut component.
 */
export const WithShortcuts: Story = {
  render: () => (
    <Sidebar.Root>
      <Sidebar.Content>
        <Sidebar.Group>
          <Sidebar.GroupLabel>Quick Actions</Sidebar.GroupLabel>
          <Sidebar.Menu>
            <Sidebar.Item
              icon={<CentralIcon name="IconHome" size={20} />}
              trailing={<Shortcut keys={["⌘", "H"]} />}
              active
            >
              Dashboard
            </Sidebar.Item>
            <Sidebar.Item
              icon={<CentralIcon name="IconPeopleCircle" size={20} />}
              trailing={<Shortcut keys={["⌘", "P"]} />}
            >
              Profile
            </Sidebar.Item>
            <Sidebar.Item
              icon={<CentralIcon name="IconSettingsGear1" size={20} />}
              trailing={<Shortcut keys={["⌘", ","]} />}
            >
              Settings
            </Sidebar.Item>
            <Sidebar.Item
              icon={<CentralIcon name="IconSquareBehindSquare1" size={20} />}
              trailing={<Shortcut keys={["⌘", "⇧", "N"]} />}
            >
              New Project
            </Sidebar.Item>
          </Sidebar.Menu>
        </Sidebar.Group>
      </Sidebar.Content>
    </Sidebar.Root>
  ),
};

/**
 * All item variants side by side for comparison.
 */
export const AllItemVariants: Story = {
  decorators: [
    (Story) => (
      <div style={{ height: "700px", display: "flex" }}>
        <Story />
        <div
          style={{
            flex: 1,
            padding: "1rem",
            backgroundColor: "var(--surface-primary)",
          }}
        >
          <p>Main content area</p>
        </div>
      </div>
    ),
  ],
  render: () => (
    <Sidebar.Root>
      <Sidebar.Content>
        <Sidebar.Group>
          <Sidebar.GroupLabel>Default Items</Sidebar.GroupLabel>
          <Sidebar.Menu>
            <Sidebar.Item
              icon={<CentralIcon name="IconHome" size={20} />}
              active
            >
              Active Item
            </Sidebar.Item>
            <Sidebar.Item
              icon={<CentralIcon name="IconPeopleCircle" size={20} />}
            >
              Default Item
            </Sidebar.Item>
            <Sidebar.Item
              icon={<CentralIcon name="IconSettingsGear1" size={20} />}
              trailing={<Shortcut keys={["⌘", "K"]} />}
            >
              With Shortcut
            </Sidebar.Item>
          </Sidebar.Menu>
        </Sidebar.Group>

        <Sidebar.Separator />

        <Sidebar.Group>
          <Sidebar.GroupLabel>Submenu (Vertical Chevron)</Sidebar.GroupLabel>
          <Sidebar.Menu>
            <Sidebar.ExpandableItem
              icon={<CentralIcon name="IconSquareBehindSquare1" size={20} />}
              label="Expandable"
              defaultOpen
            >
              <Sidebar.SubmenuItem
                icon={<CentralIcon name="IconFileBend" size={20} />}
              >
                Submenu Item
              </Sidebar.SubmenuItem>
            </Sidebar.ExpandableItem>
          </Sidebar.Menu>
        </Sidebar.Group>

        <Sidebar.Separator />

        <Sidebar.Group>
          <Sidebar.GroupLabel>Tree (Horizontal Chevron)</Sidebar.GroupLabel>
          <Sidebar.Menu>
            <Sidebar.TreeItem
              icon={<CentralIcon name="IconSquareBehindSquare1" size={20} />}
              label="Tree Item"
              defaultOpen
            >
              <Sidebar.SubmenuItem
                icon={<CentralIcon name="IconFileBend" size={20} />}
              >
                Child Item
              </Sidebar.SubmenuItem>
            </Sidebar.TreeItem>
          </Sidebar.Menu>
        </Sidebar.Group>

        <Sidebar.Separator />

        <Sidebar.Group>
          <Sidebar.GroupLabel>Drilldown (Navigate Button)</Sidebar.GroupLabel>
          <Sidebar.Menu>
            <Sidebar.DrilldownItem
              icon={<CentralIcon name="IconSquareBehindSquare1" size={20} />}
            >
              Drilldown Item
            </Sidebar.DrilldownItem>
          </Sidebar.Menu>
        </Sidebar.Group>
      </Sidebar.Content>
    </Sidebar.Root>
  ),
};
