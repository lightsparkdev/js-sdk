import { Shell } from "./components/Shell";
import { AppStateProvider, useAppState } from "./state/store";
import { CustomerView } from "./views/customer/CustomerView";
import { PlatformView } from "./views/platform/PlatformView";

export function App() {
  return (
    <AppStateProvider>
      <Shell>
        <Router />
      </Shell>
    </AppStateProvider>
  );
}

function Router() {
  const { persona } = useAppState();
  return persona === "platform" ? <PlatformView /> : <CustomerView />;
}
