import { Combobox } from "../src";

<Combobox.Clear className={(state) => (state.open ? "open" : "closed")} />;

// Origin clear visibility depends on Base UI owning mount/hidden state.
// @ts-expect-error keepMounted is intentionally not part of the Origin API.
<Combobox.Clear keepMounted />;
