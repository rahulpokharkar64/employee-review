import type { ReactNode } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { BrandMark, Icon, PageHeading } from "./shared";

export function AppShell({
  apiConnected,
  dataError,
  dataLoading,
  notice,
  onDismissNotice,
  onRetry,
  children,
}: {
  apiConnected: boolean;
  dataError: string;
  dataLoading: boolean;
  notice: string;
  onDismissNotice: () => void;
  onRetry: () => void;
  children: ReactNode;
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const detailRoute =
    location.pathname.startsWith("/reviews/");
  const title = detailRoute
    ? "Review Details"
    : location.pathname === "/reviews"
      ? "Review List"
      : location.pathname === "/employees"
        ? "Employees"
        : location.pathname === "/submit-review"
          ? "Submit Review"
          : "Overview";

  return (
    <>
      <aside className="sidebar">
        <NavLink className="brand" to="/overview" aria-label="PeoplePulse home">
          <BrandMark />
          <span className="brand-copy">
            <strong>PeoplePulse</strong>
            <small>EMPLOYEE REVIEWS</small>
          </span>
        </NavLink>

        <div className="workspace-label">WORKSPACE</div>
        <nav className="side-nav" aria-label="Main navigation">
          <SidebarLink
            icon={<Icon name="grid" />}
            label="Overview"
            to="/overview"
          />
          <SidebarLink
            icon={<Icon name="document" />}
            label="Reviews"
            to="/reviews"
          />
          <SidebarLink
            icon={<Icon name="people" />}
            label="Employees"
            to="/employees"
          />
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-note">
            <Icon name="shield" />
            <p>Thoughtful feedback helps everyone grow.</p>
          </div>
          <div className="user-profile">
            <div className="avatar avatar-admin">AD</div>
            <div className="user-details">
              <strong>Administrator</strong>
              <span>People team</span>
            </div>
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumbs">
            <span>People Operations</span>
            <span className="breadcrumb-chevron">/</span>
            <strong>{title}</strong>
          </div>
          <div className="topbar-actions">
            <span className="connection-indicator">
              <span
                className={`connection-dot${apiConnected ? "" : " connection-dot-offline"}`}
              />
              {dataLoading
                ? "Connecting to API…"
                : apiConnected
                  ? "API connected"
                  : "API unavailable"}
            </span>
            <div className="topbar-avatar" aria-label="Administrator">
              AD
            </div>
          </div>
        </header>

        <div className="page-content">
          {dataError && (
            <div className="alert alert-error" role="alert">
              <Icon name="alert" />
              <span>{dataError}</span>
              <button className="alert-action" onClick={onRetry}>
                Retry
              </button>
            </div>
          )}
          {notice && (
            <div className="alert alert-success" role="status">
              <Icon name="check" />
              <span>{notice}</span>
              <button
                className="alert-dismiss"
                aria-label="Dismiss success message"
                onClick={onDismissNotice}
              >
                ×
              </button>
            </div>
          )}
          {location.pathname !== "/submit-review" &&
            location.pathname !== "/reviews" &&
            location.pathname !== "/employees" &&
            !detailRoute && (
              <PageHeading
                eyebrow="EMPLOYEE PERFORMANCE"
                title="Performance overview"
                description="A clear view of your people and their progress."
                action={
                  <button
                    className="button button-primary"
                    onClick={() => navigate("/submit-review")}
                  >
                    <Icon name="plus" /> New review
                  </button>
                }
              />
            )}
          {children}
        </div>
      </main>
    </>
  );
}

function SidebarLink({
  icon,
  label,
  to,
}: {
  icon: ReactNode;
  label: string;
  to: string;
}) {
  return (
    <NavLink
      className={({ isActive }) =>
        `nav-button${isActive ? " nav-button-active" : ""}`
      }
      to={to}
      end={to !== "/reviews"}
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
}
