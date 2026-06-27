// Sidebar structure for the admin panel. Paths are relative to /admin.
export interface AdminNavItem {
  to: string
  label: string
  icon: string
}

export interface AdminNavGroup {
  title: string
  items: AdminNavItem[]
}

export const adminNav: AdminNavGroup[] = [
  {
    title: 'Overview',
    items: [{ to: '/admin', label: 'Dashboard', icon: '📊' }],
  },
  {
    title: 'Catalog',
    items: [
      { to: '/admin/products', label: 'Products', icon: '🐟' },
      { to: '/admin/categories', label: 'Categories', icon: '🗂️' },
      { to: '/admin/inventory', label: 'Stock & Inventory', icon: '📦' },
      { to: '/admin/reviews', label: 'Comments & Reviews', icon: '💬' },
    ],
  },
  {
    title: 'Sales',
    items: [
      { to: '/admin/orders', label: 'Manage Orders', icon: '🧾' },
      { to: '/admin/payments', label: 'Order Payments', icon: '💳' },
      { to: '/admin/tracking', label: 'Track Orders', icon: '🚚' },
      { to: '/admin/invoices', label: 'Invoices', icon: '📄' },
      { to: '/admin/returns', label: 'Returns', icon: '↩️' },
    ],
  },
  {
    title: 'Marketing',
    items: [
      { to: '/admin/coupons', label: 'Coupons', icon: '🏷️' },
      { to: '/admin/offers', label: 'Offers', icon: '✨' },
      { to: '/admin/gift-cards', label: 'Gift Cards', icon: '🎁' },
    ],
  },
  {
    title: 'Settings',
    items: [
      { to: '/admin/shipping', label: 'Shipping & Free Shipping', icon: '🌍' },
    ],
  },
]
