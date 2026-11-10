import React, { useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  ClipboardList,
  CheckSquare,
  GraduationCap,
  Microscope,
  Bell,
  Users,
  UserCheck,
  BarChart2,
  Database,
  User,
  ShieldCheck,
  Award,
  LogOut,
  ChevronDown,
  Menu,
  X,
} from 'lucide-react';

/**
 * Format system role codes into sentence-case human-friendly titles
 */
const formatRoleName = (role) => {
  if (!role) return '';
  switch (role.toUpperCase()) {
    case 'SCHOLAR':
      return 'Scholar';
    case 'GUIDE':
      return 'Research guide';
    case 'CENTRE_HEAD':
      return 'Centre head';
    case 'DRC_CONVENOR':
      return 'DRC convenor';
    case 'STAFF':
      return 'Section staff';
    case 'ADMIN':
      return 'Administrator';
    default:
      return role.replace(/_/g, ' ').toLowerCase();
  }
};

/**
 * Role-Based Navigation Configuration with sentence-case section groupings
 */
const ROLE_NAV_SECTIONS = {
  SCHOLAR: [
    {
      section: 'Research',
      items: [
        { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { label: 'Applications', path: '/applications', icon: FileText },
        { label: 'Apply for services', path: '/services', icon: ClipboardList },
        { label: 'Research timeline', path: '/timeline', icon: GraduationCap },
        { label: 'Equipment booking', path: '/equipment', icon: Microscope },
      ],
    },
    {
      section: 'Account',
      items: [
        { label: 'Notifications', path: '/notifications', icon: Bell },
        { label: 'Profile', path: '/profile', icon: User },
      ],
    },
  ],
  GUIDE: [
    {
      section: 'Research',
      items: [
        { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { label: 'Approvals queue', path: '/approvals', icon: CheckSquare, badge: 1 },
        { label: 'My scholars', path: '/scholars', icon: Users },
      ],
    },
    {
      section: 'Account',
      items: [
        { label: 'Notifications', path: '/notifications', icon: Bell },
        { label: 'Profile', path: '/profile', icon: User },
      ],
    },
  ],
  CENTRE_HEAD: [
    {
      section: 'Research',
      items: [
        { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { label: 'Approvals queue', path: '/approvals', icon: CheckSquare, badge: 1 },
        { label: 'Guide directory', path: '/guides', icon: UserCheck },
        { label: 'Scholar records', path: '/scholars', icon: Users },
      ],
    },
    {
      section: 'Account',
      items: [
        { label: 'Notifications', path: '/notifications', icon: Bell },
        { label: 'Profile', path: '/profile', icon: User },
      ],
    },
  ],
  DRC_CONVENOR: [
    {
      section: 'Department',
      items: [
        { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { label: 'Approvals queue', path: '/approvals', icon: CheckSquare, badge: 2 },
        { label: 'Guide directory', path: '/guides', icon: UserCheck },
        { label: 'Scholar directory', path: '/scholars', icon: Users },
        { label: 'Applications', path: '/applications', icon: FileText },
        { label: 'Department reports', path: '/reports', icon: BarChart2 },
      ],
    },
    {
      section: 'Account',
      items: [
        { label: 'Notifications', path: '/notifications', icon: Bell },
        { label: 'Profile', path: '/profile', icon: User },
      ],
    },
  ],
  STAFF: [
    {
      section: 'Registry',
      items: [
        { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { label: 'Applications', path: '/applications', icon: FileText },
        { label: 'Scholar directory', path: '/scholars', icon: Users },
        { label: 'Guide directory', path: '/guides', icon: UserCheck },
        { label: 'Certificates', path: '/certificates', icon: Award },
        { label: 'Reports', path: '/reports', icon: BarChart2 },
      ],
    },
    {
      section: 'Account',
      items: [
        { label: 'Profile', path: '/profile', icon: User },
      ],
    },
  ],
  ADMIN: [
    {
      section: 'System',
      items: [
        { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { label: 'System admin', path: '/admin', icon: ShieldCheck },
        { label: 'Scholar directory', path: '/scholars', icon: Users },
        { label: 'Guide directory', path: '/guides', icon: UserCheck },
        { label: 'Master data', path: '/master', icon: Database },
        { label: 'Reports', path: '/reports', icon: BarChart2 },
      ],
    },
    {
      section: 'Account',
      items: [
        { label: 'Profile', path: '/profile', icon: User },
      ],
    },
  ],
};

/**
 * Breadcrumb Title Mapping
 */
const ROUTE_LABELS = {
  '/dashboard': 'Dashboard',
  '/applications': 'Applications',
  '/services': 'Apply for services',
  '/timeline': 'Research timeline',
  '/approvals': 'Approvals queue',
  '/equipment': 'Equipment booking',
  '/scholars': 'Scholars',
  '/guides': 'Guides',
  '/certificates': 'Certificates',
  '/reports': 'Reports',
  '/admin': 'Administration',
  '/profile': 'Profile',
  '/master': 'Master data',
  '/notifications': 'Notifications',
};

export const AppShell = ({
  children,
  currentRole = 'SCHOLAR',
  availableRoles = ['SCHOLAR', 'GUIDE', 'DRC_CONVENOR', 'STAFF', 'ADMIN'],
  userName = 'Deepa V. K.',
  userEmail = 'scholar@kannur.ac.in',
  onRoleSwitch,
  onSignOut,
}) => {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const location = useLocation();

  const navSections = ROLE_NAV_SECTIONS[currentRole] || ROLE_NAV_SECTIONS.SCHOLAR;

  // Derive breadcrumb from current path
  const currentPathLabel = ROUTE_LABELS[location.pathname] || 'Overview';

  // Get User Initials (e.g., "DV")
  const initials = userName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('') || 'U';

  const renderNavSection = (sec) => (
    <div key={sec.section} className="mb-4">
      <div className="px-3 pt-2 pb-1 text-[13px] leading-[20px] text-text-muted font-normal select-none">
        {sec.section}
      </div>
      <div className="space-y-[2px]">
        {sec.items.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileDrawerOpen(false)}
              className={`flex items-center justify-between h-[40px] px-3 mx-2 rounded-md text-[14px] leading-[20px] transition-colors duration-fast ${
                isActive
                  ? 'bg-accent-50 text-accent-700 font-medium'
                  : 'text-text-muted hover:text-text hover:bg-surface-sub'
              }`}
            >
              <div className="flex items-center gap-[10px]">
                <Icon
                  size={18}
                  strokeWidth={1.75}
                  className={`flex-shrink-0 ${isActive ? 'text-accent-700' : 'text-text-muted'}`}
                />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="h-5 px-1.5 rounded-sm text-[12px] font-medium bg-accent-100 text-accent-700 flex items-center justify-center tabular-nums">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-bg flex flex-col font-sans text-text antialiased">
      <div className="flex flex-1">
        {/* Desktop Sidebar (248px wide, surface bg, 1px right border) */}
        <aside className="hidden lg:flex flex-col justify-between w-[248px] bg-surface border-r border-border sticky top-0 h-screen z-30 flex-shrink-0">
          <div>
            {/* Wordmark (Public Sans 600 16px) + small muted "R&D Cell", 20px padding */}
            <div className="p-5 border-b border-border">
              <Link to="/dashboard" className="block">
                <div className="text-[16px] leading-[22px] font-semibold text-text">
                  Kannur University
                </div>
                <div className="text-[13px] leading-[18px] text-text-muted mt-0.5">
                  Research & Development Cell
                </div>
              </Link>
            </div>

            {/* Navigation Sections */}
            <nav className="py-3 overflow-y-auto" aria-label="Main Navigation">
              {navSections.map(renderNavSection)}
            </nav>
          </div>

          {/* Sidebar Footer: Avatar + Name + Role */}
          <div className="p-4 border-t border-border flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-accent-100 text-accent-700 flex items-center justify-center text-[13px] font-semibold flex-shrink-0">
                {initials}
              </div>
              <div className="min-w-0">
                <div className="text-[14px] leading-[18px] font-medium text-text truncate">
                  {userName}
                </div>
                <div className="text-[13px] leading-[18px] text-text-muted truncate">
                  {formatRoleName(currentRole)}
                </div>
              </div>
            </div>

            <Link
              to="/login"
              onClick={onSignOut}
              title="Sign out"
              aria-label="Sign out"
              className="p-1.5 text-text-muted hover:text-text rounded-md hover:bg-surface-sub transition-colors"
            >
              <LogOut size={16} strokeWidth={1.75} />
              <span className="sr-only">Sign out</span>
            </Link>
          </div>
        </aside>

        {/* Mobile Slide-In Drawer (< 1024px) */}
        <div
          className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-normal ${
            mobileDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/35"
            onClick={() => setMobileDrawerOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer content */}
          <aside
            className={`fixed top-0 bottom-0 left-0 w-[260px] bg-surface border-r border-border shadow-dialog flex flex-col justify-between transition-transform duration-normal ease-in-out ${
              mobileDrawerOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <div>
              <div className="h-[56px] px-4 border-b border-border flex items-center justify-between">
                <div>
                  <div className="text-[15px] font-semibold text-text">Kannur University</div>
                  <div className="text-[12px] text-text-muted">R&D Cell</div>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-1 rounded-md text-text-muted hover:text-text"
                  aria-label="Close navigation"
                >
                  <X size={18} strokeWidth={1.75} />
                </button>
              </div>

              <nav className="py-2" aria-label="Mobile Navigation">
                {navSections.map(renderNavSection)}
              </nav>
            </div>

            <div className="p-4 border-t border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-accent-100 text-accent-700 flex items-center justify-center text-[13px] font-semibold">
                  {initials}
                </div>
                <div>
                  <div className="text-[14px] font-medium text-text">{userName}</div>
                  <div className="text-[12px] text-text-muted">{formatRoleName(currentRole)}</div>
                </div>
              </div>
              <Link to="/login" onClick={onSignOut} title="Sign out" aria-label="Sign out" className="p-1.5 text-text-muted hover:text-text">
                <LogOut size={16} strokeWidth={1.75} />
                <span className="sr-only">Sign out</span>
              </Link>
            </div>
          </aside>
        </div>

        {/* Content Column (Desktop Top Bar + Main Workspace) */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Bar (Height: 56px, surface bg, bottom border) */}
          <header className="h-[56px] bg-surface border-b border-border sticky top-0 z-20 px-4 sm:px-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Mobile hamburger menu toggle */}
              <button
                type="button"
                className="lg:hidden p-1.5 text-text-muted hover:text-text rounded-md hover:bg-surface-sub"
                onClick={() => setMobileDrawerOpen(true)}
                aria-label="Open navigation menu"
              >
                <Menu size={20} strokeWidth={1.75} />
              </button>

              {/* Breadcrumb: small muted, last item text */}
              <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[13px] leading-[20px]">
                <span className="text-text-muted">Home</span>
                <span className="text-text-subtle">/</span>
                <span className="text-text font-medium">{currentPathLabel}</span>
              </nav>
            </div>

            {/* Top Bar Right: Role Switcher & Notifications */}
            <div className="flex items-center gap-3">
              {availableRoles.length > 1 && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                    className="h-[32px] px-2.5 bg-surface border border-border hover:bg-surface-sub rounded-md text-[13px] font-medium text-text flex items-center gap-1.5"
                  >
                    <span className="text-text-muted hidden sm:inline">Role:</span>
                    <span className="text-accent-600 font-medium">{formatRoleName(currentRole)}</span>
                    <ChevronDown size={14} strokeWidth={1.75} className="text-text-muted" />
                  </button>

                  {roleMenuOpen && (
                    <div
                      className="absolute right-0 mt-1 w-48 bg-surface border border-border shadow-menu rounded-md py-1 z-50 text-[13px]"
                      role="menu"
                    >
                      <div className="px-3 py-1.5 text-[12px] text-text-muted border-b border-border">
                        Switch role
                      </div>
                      {availableRoles.map((role) => (
                        <button
                          key={role}
                          type="button"
                          onClick={() => {
                            onRoleSwitch?.(role);
                            setRoleMenuOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 hover:bg-surface-sub flex items-center justify-between ${
                            role === currentRole ? 'text-accent-700 font-medium bg-accent-50' : 'text-text'
                          }`}
                          role="menuitem"
                        >
                          <span>{formatRoleName(role)}</span>
                          {role === currentRole && <span className="w-1.5 h-1.5 rounded-full bg-accent-600" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Notifications Link */}
              <Link
                to="/notifications"
                title="Notifications"
                className="p-2 text-text-muted hover:text-text hover:bg-surface-sub rounded-md transition-colors"
              >
                <Bell size={18} strokeWidth={1.75} />
              </Link>
            </div>
          </header>

          {/* Main Content Workspace: Page padding 32 desktop, 16 mobile. Content max-width 1160, centered */}
          <main id="main-content" className="flex-1 p-4 sm:p-8">
            <div className="max-w-[1160px] mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AppShell;
