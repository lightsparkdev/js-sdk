/**
 * Rules Module
 * 
 * Loads and manages Base UI component lint rules.
 */

// Import all rule definitions - Complete Base UI library coverage
import accordionRules from '../rules/accordion.json';
import alertDialogRules from '../rules/alert-dialog.json';
import autocompleteRules from '../rules/autocomplete.json';
import avatarRules from '../rules/avatar.json';
import buttonRules from '../rules/button.json';
import checkboxRules from '../rules/checkbox.json';
import checkboxGroupRules from '../rules/checkbox-group.json';
import collapsibleRules from '../rules/collapsible.json';
import comboboxRules from '../rules/combobox.json';
import contextMenuRules from '../rules/context-menu.json';
import dialogRules from '../rules/dialog.json';
import fieldRules from '../rules/field.json';
import fieldsetRules from '../rules/fieldset.json';
import formRules from '../rules/form.json';
import inputRules from '../rules/input.json';
import menuRules from '../rules/menu.json';
import menubarRules from '../rules/menubar.json';
import meterRules from '../rules/meter.json';
import navigationMenuRules from '../rules/navigation-menu.json';
import numberFieldRules from '../rules/number-field.json';
import popoverRules from '../rules/popover.json';
import previewCardRules from '../rules/preview-card.json';
import progressRules from '../rules/progress.json';
import radioRules from '../rules/radio.json';
import radioGroupRules from '../rules/radio-group.json';
import scrollAreaRules from '../rules/scroll-area.json';
import selectRules from '../rules/select.json';
import separatorRules from '../rules/separator.json';
import sliderRules from '../rules/slider.json';
import switchRules from '../rules/switch.json';
import tabsRules from '../rules/tabs.json';
import textareaRules from '../rules/textarea.json';
import toastRules from '../rules/toast.json';
import toggleRules from '../rules/toggle.json';
import toggleGroupRules from '../rules/toggle-group.json';
import toolbarRules from '../rules/toolbar.json';
import tooltipRules from '../rules/tooltip.json';

export interface PartRule {
  required: boolean;
  parent: string | null;
  aliases?: string[];
}

export interface ComponentRules {
  component: string;
  matches: string[];
  parts: Record<string, PartRule>;
  ignored?: string[];
}

// All available rules - complete Base UI library (37 components)
// Note: More specific rules (like AlertDialog, CheckboxGroup) come before general ones
const allRules: ComponentRules[] = [
  accordionRules as ComponentRules,
  alertDialogRules as ComponentRules,
  autocompleteRules as ComponentRules,
  avatarRules as ComponentRules,
  buttonRules as ComponentRules,
  checkboxGroupRules as ComponentRules, // Before checkbox (more specific)
  checkboxRules as ComponentRules,
  collapsibleRules as ComponentRules,
  comboboxRules as ComponentRules,
  contextMenuRules as ComponentRules,
  dialogRules as ComponentRules,
  fieldRules as ComponentRules,
  fieldsetRules as ComponentRules,
  formRules as ComponentRules,
  inputRules as ComponentRules,
  menubarRules as ComponentRules,
  menuRules as ComponentRules,
  meterRules as ComponentRules,
  navigationMenuRules as ComponentRules,
  numberFieldRules as ComponentRules,
  popoverRules as ComponentRules,
  previewCardRules as ComponentRules,
  progressRules as ComponentRules,
  radioGroupRules as ComponentRules, // Before radio (more specific)
  radioRules as ComponentRules,
  scrollAreaRules as ComponentRules,
  selectRules as ComponentRules,
  separatorRules as ComponentRules,
  sliderRules as ComponentRules,
  switchRules as ComponentRules,
  tabsRules as ComponentRules,
  textareaRules as ComponentRules,
  toastRules as ComponentRules,
  toggleGroupRules as ComponentRules, // Before toggle (more specific)
  toggleRules as ComponentRules,
  toolbarRules as ComponentRules,
  tooltipRules as ComponentRules,
];

/**
 * Normalize a component name for matching
 */
function normalizeForMatch(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '').replace(/\//g, '');
}

/**
 * Find rules that apply to a given component name
 */
export function getComponentRules(componentName: string): ComponentRules | null {
  const normalized = normalizeForMatch(componentName);
  
  for (const rules of allRules) {
    for (const match of rules.matches) {
      if (normalizeForMatch(match) === normalized) {
        return rules;
      }
      
      // Also check if component name starts with match (for "Accordion / Item" matching "Accordion")
      if (normalized.startsWith(normalizeForMatch(match))) {
        return rules;
      }
    }
  }
  
  return null;
}

/**
 * Get all available component rules
 */
export function getAllRules(): ComponentRules[] {
  return allRules;
}

/**
 * Get list of supported component names
 */
export function getSupportedComponents(): string[] {
  return allRules.map(r => r.component);
}
