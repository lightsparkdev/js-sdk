import { InputGroup } from "../src";

declare const dynamicIconOnly: boolean;

<InputGroup.Button iconOnly aria-label="Search" />;
<InputGroup.Button iconOnly aria-labelledby="search-label" />;
<InputGroup.Button iconOnly={dynamicIconOnly} aria-label="Search" />;
<InputGroup.Button>Search</InputGroup.Button>;
<InputGroup.Button aria-label={undefined}>Search</InputGroup.Button>;
<InputGroup.Button aria-labelledby={undefined}>Search</InputGroup.Button>;

// @ts-expect-error Icon-only buttons require an accessible name.
<InputGroup.Button iconOnly />;

// @ts-expect-error Icon-only aria-labels must be defined.
<InputGroup.Button iconOnly aria-label={undefined} />;

// @ts-expect-error Icon-only aria-labelledby values must be defined.
<InputGroup.Button iconOnly aria-labelledby={undefined} />;
