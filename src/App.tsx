import { useMemo, useState } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import { TABS, type TabId } from "./tabs";

export default function App() {
  const [active, setActive] = useState<TabId>("overview");

  const current = useMemo(
    () => TABS.find((t) => t.id === active) ?? TABS[0],
    [active]
  );

  const Current = current.Component;

  return (
    <div className="app-shell">
      <Sidebar active={active} onSelect={setActive} />
      <div className="main">
        <Header crumb="Indian Passenger Vehicle" title={current.label} />
        <main className="content">
          <p
            style={{
              marginTop: 0,
              marginBottom: 16,
              color: "var(--text-secondary)",
              fontSize: 13,
            }}
          >
            {current.description}
          </p>
          <Current />
        </main>
      </div>
    </div>
  );
}
