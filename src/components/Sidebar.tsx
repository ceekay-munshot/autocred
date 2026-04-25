import { TABS, type TabId } from "../tabs";

interface SidebarProps {
  active: TabId;
  onSelect: (id: TabId) => void;
}

export default function Sidebar({ active, onSelect }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <div className="sidebar__brand-name">AutoCred</div>
        <div className="sidebar__brand-sub">India PV Dashboard</div>
      </div>

      <nav className="sidebar__nav" aria-label="Primary">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={
              "sidebar__item" +
              (tab.id === active ? " sidebar__item--active" : "")
            }
            onClick={() => onSelect(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="sidebar__footer">
        Buy-side research • Internal use only
      </div>
    </aside>
  );
}
