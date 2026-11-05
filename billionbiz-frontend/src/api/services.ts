import { apiClient } from './client';

export interface DashboardMetricsResponse {
  metrics: {
    totalOrders: number;
    totalRevenueMinor: number;
    avgOrderValueMinor: number;
    totalCustomers: number;
    totalProducts: number;
    totalBookings: number;
    totalAppointmentValueMinor: number;
    pendingOrders?: number;
    completedOrders?: number;
    cancelledOrders?: number;
    revenueGrowth?: number;
  };
  salesTrends?: {
    date: string;
    orders_count: number | string;
    revenue_minor: number;
  }[];
  orderStatusDistribution: { status: string; count: string | number }[];
  recentOrders: {
    id: string;
    order_number: string;
    created_at: string;
    status: string;
    payment_status?: string;
    fulfillment_status?: string;
    total_minor: number;
    customer_name: string;
    customer_email?: string;
  }[];
  recentBookings?: {
    id: string;
    booking_number: string;
    start_time: string;
    end_time: string;
    status: string;
    total_minor: number;
    service_name: string;
    staff_name: string;
    customer_name: string;
  }[];
  recentCustomers?: {
    id: string;
    first_name: string;
    last_name?: string;
    email?: string;
    phone?: string;
    total_orders?: number;
    total_spent_minor?: number;
    created_at: string;
  }[];
  topProducts: {
    id?: string;
    name: string;
    orders_count: string | number;
    revenue_minor: number;
  }[];
  bestServices?: {
    id?: string;
    name: string;
    bookings_count: string | number;
    revenue_minor: number;
  }[];
  recentActivities?: {
    id: string;
    action: string;
    target_type: string;
    target_id: string;
    changes?: any;
    created_at: string;
    actor_id?: string;
  }[];
  importantNotifications?: {
    id: string;
    title: string;
    message: string;
    type: string;
    is_read: boolean;
    created_at: string;
  }[];
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  isPlatformAdmin?: boolean;
  emailVerified?: boolean;
  mfaEnabled?: boolean;
}

export interface CreateOrderPayload {
  customerId?: string;
  customerDetails?: {
    email?: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
  };
  items: Array<{ variantId: string; quantity: number }>;
  channel?: 'STOREFRONT' | 'POS' | 'MANUAL';
  shippingAddress?: Record<string, unknown>;
  billingAddress?: Record<string, unknown>;
}

export interface AuthResponse {
  token: string;
  user: UserProfile;
  organization?: { id: string; name: string };
  store?: { id: string; name: string; slug: string; status: string };
  organizations?: any[];
  portalDestination?: { portal: string; url: string; path: string };
  onboardingChecklist?: any[];
}

export const api = {
  // Authentication & Identity (Streamlined & Multi-Factor)
  sendOtp: (data: { identifier: string; type?: 'REGISTER' | 'LOGIN' }) =>
    apiClient<{
      success: boolean;
      message: string;
      channel: 'EMAIL' | 'SMS';
      identifier: string;
      expiresInSeconds: number;
      devOtpPreview?: string;
    }>('/auth/otp/send', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  verifyOtp: (data: { identifier: string; code: string; type?: 'REGISTER' | 'LOGIN' }) =>
    apiClient<{
      success: boolean;
      verified?: boolean;
      token?: string;
      user?: UserProfile;
      organizations?: any[];
      portalDestination?: { portal: string; url: string; path: string };
      message: string;
    }>('/auth/otp/verify', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  loginUnified: (data: { identifier: string; password?: string; otp?: string }) =>
    apiClient<AuthResponse>('/auth/login-unified', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  checkDomain: (slug: string) =>
    apiClient<{
      available: boolean;
      slug: string;
      fullDomain: string;
      message: string;
    }>(`/auth/check-domain?slug=${encodeURIComponent(slug)}`),

  registerStreamlined: (data: {
    identifier: string;
    storeName: string;
    slug?: string;
    capabilityMode?: string;
    password?: string;
    fullName?: string;
    plan?: string;
  }) =>
    apiClient<AuthResponse>('/auth/register-streamlined', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  login: (credentials: { email: string; password: string }) =>
    apiClient<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    }),

  loginGoogle: (payload: {
    credential?: string;
    idToken?: string;
    code?: string;
    redirectUri?: string;
    googleId?: string;
    email?: string;
    fullName?: string;
  }) =>
    apiClient<AuthResponse>('/auth/google', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  register: (payload: {
    email: string;
    password: string;
    fullName: string;
    storeName: string;
    capabilityMode?: string;
  }) =>
    apiClient<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  getMe: () =>
    apiClient<{
      user: UserProfile;
      role: string;
      storeId?: string;
      storeName?: string;
      storeSlug?: string;
      organizationId?: string;
      organizationName?: string;
      onboardingChecklist?: any[];
      portalDestination?: { portal: string; url: string; path: string };
      permissions?: string[];
    }>('/auth/me'),

  verifyEmail: (token: string) =>
    apiClient<{ message: string; emailVerified: boolean }>('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token })
    }),

  forgotPassword: (email: string) =>
    apiClient<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    }),

  resetPassword: (payload: { token: string; password: string }) =>
    apiClient<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  enrollMfa: () =>
    apiClient<{ secret: string; otpauthUrl: string; recoveryCodes: string[]; message: string }>('/auth/mfa/enroll', {
      method: 'POST'
    }),

  verifyMfa: (code: string) =>
    apiClient<{ message: string; mfaEnabled: boolean; recoveryCodeConsumed?: boolean }>('/auth/mfa/verify', {
      method: 'POST',
      body: JSON.stringify({ code })
    }),

  verifyMfaRecoveryCode: (recoveryCode: string) =>
    apiClient<{ message: string; mfaEnabled: boolean; recoveryCodeConsumed: boolean }>('/auth/mfa/verify', {
      method: 'POST',
      body: JSON.stringify({ recoveryCode })
    }),

  getOnboardingChecklist: () =>
    apiClient<{ checklist: any[] }>('/auth/onboarding-checklist'),

  // Notifications
  getNotifications: () =>
    apiClient<{ notifications: any[]; unreadCount: number }>('/notifications'),

  markNotificationRead: (id: string) =>
    apiClient<{ message: string }>(`/notifications/${id}/read`, {
      method: 'PATCH'
    }),

  // Dashboard
  getDashboardMetrics: (period: string = '30d') =>
    apiClient<DashboardMetricsResponse>('/dashboard/metrics', { params: { period } }),

  // Catalog
  getProducts: (params?: { search?: string; status?: string; categoryId?: string; limit?: number; offset?: number }) =>
    apiClient<{ products: any[]; total: number }>('/catalog/products', { params }),
  createProduct: (product: any) =>
    apiClient<{ message: string; productId: string; variants?: any[] }>('/catalog/products', {
      method: 'POST',
      body: JSON.stringify(product)
    }),
  getCategories: () => apiClient<{ categories: any[] }>('/catalog/categories'),
  createCategory: (payload: { name: string; slug?: string; description?: string; parentId?: string }) =>
    apiClient<{ message: string; category: any }>('/catalog/categories', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  updateCategory: (id: string, payload: { name: string; slug: string; description?: string }) =>
    apiClient<{ message: string; category: any }>(`/catalog/categories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    }),
  deleteCategory: (id: string) =>
    apiClient<{ message: string; id: string }>(`/catalog/categories/${id}`, {
      method: 'DELETE'
    }),
  adjustInventory: (payload: { variantId: string; locationId: string; adjustmentQty: number; movementType?: string; note?: string }) =>
    apiClient('/catalog/inventory/adjust', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  // Orders & Customers (People)
  getCustomers: (params?: { search?: string }) =>
    apiClient<{ customers: any[]; total: number }>('/orders/customers', { params }),
  getCustomerById: (id: string) => apiClient<any>(`/orders/customers/${id}`),
  getOrders: (params?: { status?: string; search?: string }) =>
    apiClient<{ orders: any[]; total: number }>('/orders', { params }),
  getOrderById: (id: string) => apiClient<any>(`/orders/${id}`),
  createOrder: (order: CreateOrderPayload, idempotencyKey?: string) =>
    apiClient<{ message: string; orderId: string; orderNumber: string }>('/orders', {
      method: 'POST',
      headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : undefined,
      body: JSON.stringify(order)
    }),
  updateOrderStatus: (id: string, status: string, notes?: string) =>
    apiClient<any>(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes })
    }),
  fulfillOrder: (id: string, fulfillment: { carrier: string; trackingNumber: string }, idempotencyKey?: string) =>
    apiClient<{ message: string; fulfillmentId: string; orderId: string; trackingNumber: string; carrier: string; status: string }>(`/orders/${id}/fulfill`, {
      method: 'POST',
      headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : undefined,
      body: JSON.stringify(fulfillment)
    }),

  // Invoices
  getInvoices: () => apiClient<{ invoices: any[] }>('/orders/invoices'),
  createInvoice: (invoice: any) =>
    apiClient<{ message: string; invoiceId: string; invoiceNumber: string }>('/orders/invoices', {
      method: 'POST',
      body: JSON.stringify(invoice)
    }),

  // Abandoned Carts
  getAbandonedCarts: () => apiClient<{ abandonedCarts: any[] }>('/orders/abandoned-carts'),

  // Returns & Refunds
  getReturns: () => apiClient<{ returns: any[] }>('/orders/returns'),
  createReturn: (data: { orderId: string; reason: string; refundAmountMinor: number; items?: unknown[]; restockDisposition?: 'RESTOCK' | 'NOT_RESTOCK' }, idempotencyKey?: string) =>
    apiClient<{ message: string; returnId: string; returnNumber: string }>('/orders/returns', {
      method: 'POST',
      headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : undefined,
      body: JSON.stringify(data)
    }),
  approveReturn: (id: string, idempotencyKey?: string) =>
    apiClient<any>(`/orders/returns/${id}/approve`, {
      method: 'POST',
      headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : undefined,
      body: JSON.stringify({})
    }),
  rejectReturn: (id: string, reason: string, idempotencyKey?: string) =>
    apiClient<any>(`/orders/returns/${id}/reject`, {
      method: 'POST',
      headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : undefined,
      body: JSON.stringify({ reason })
    }),
  refundReturn: (id: string, payload: any = {}) =>
    apiClient<any>(`/orders/returns/${id}/process-refund`, {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  // Shipments & Warehouses
  getShipments: () => apiClient<{ shipments: any[] }>('/orders/shipments'),
  getWarehouses: () => apiClient<{ warehouses: any[] }>('/orders/warehouses'),
  createWarehouse: (warehouse: any) =>
    apiClient<{ message: string; warehouseId: string }>('/orders/warehouses', {
      method: 'POST',
      body: JSON.stringify(warehouse)
    }),
  updateWarehouse: (id: string, warehouse: any) =>
    apiClient<any>(`/orders/warehouses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(warehouse)
    }),
  deleteWarehouse: (id: string) =>
    apiClient<any>(`/orders/warehouses/${id}`, {
      method: 'DELETE'
    }),

  // Appointments
  getOfferings: () => apiClient<{ offerings: any[] }>('/appointments/offerings'),
  createOffering: (offering: any) =>
    apiClient<{ message: string; offeringId: string }>('/appointments/offerings', {
      method: 'POST',
      body: JSON.stringify(offering)
    }),
  updateOffering: (id: string, offering: any) =>
    apiClient<any>(`/appointments/offerings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(offering)
    }),
  deleteOffering: (id: string) =>
    apiClient<any>(`/appointments/offerings/${id}`, {
      method: 'DELETE'
    }),
  getStaff: () => apiClient<{ staff: any[] }>('/appointments/staff'),
  createStaff: (staff: any) =>
    apiClient<{ message: string; staffId: string }>('/appointments/staff', {
      method: 'POST',
      body: JSON.stringify(staff)
    }),
  updateStaff: (id: string, staff: any) =>
    apiClient<any>(`/appointments/staff/${id}`, {
      method: 'PUT',
      body: JSON.stringify(staff)
    }),
  getWorkingHours: () => apiClient<{ shifts: any[]; timezone: string }>('/appointments/working-hours'),
  updateWorkingHours: (shifts: any[]) =>
    apiClient<any>('/appointments/working-hours', {
      method: 'PUT',
      body: JSON.stringify({ shifts })
    }),
  getBookingSettings: () => apiClient<{ settings: any }>('/appointments/settings'),
  updateBookingSettings: (settings: any) =>
    apiClient<any>('/appointments/settings', {
      method: 'PUT',
      body: JSON.stringify(settings)
    }),
  getAvailability: (offeringId: string, date: string) =>
    apiClient<any>('/appointments/availability', { params: { offeringId, date } }),
  holdSlot: (payload: { offeringId: string; resourceId: string; startTime: string; endTime: string }) =>
    apiClient<{ holdToken: string; expiresAt: string }>('/appointments/holds', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  releaseBookingHold: (holdToken: string) =>
    apiClient<any>(`/appointments/holds/${encodeURIComponent(holdToken)}`, {
      method: 'DELETE'
    }),
  createBooking: (payload: any) =>
    apiClient<{ message: string; bookingId: string; bookingNumber: string }>('/appointments/bookings', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  getBookings: (params?: { from?: string; to?: string; status?: string }) =>
    apiClient<{ bookings: any[] }>('/appointments/bookings', { params }),
  updateBookingStatus: (id: string, status: string) =>
    apiClient<any>(`/appointments/bookings/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    }),

  // POS
  getCounters: () => apiClient<{ counters: any[] }>('/pos/counters'),
  openRegister: (counterId: string, openingFloatMinor: number) =>
    apiClient('/pos/register/open', {
      method: 'POST',
      body: JSON.stringify({ counterId, openingFloatMinor })
    }),
  getCurrentRegister: (counterId: string) =>
    apiClient<any>('/pos/register/current', { params: { counterId } }),
  closeRegister: (sessionId: string, closingCashMinor: number) =>
    apiClient<any>('/pos/register/close', {
      method: 'POST',
      body: JSON.stringify({ sessionId, closingCashMinor })
    }),
  posCheckout: (payload: any) =>
    apiClient<any>('/pos/checkout', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  // Tenancy & Capabilities
  getStoreDetails: (storeId: string) => apiClient<any>(`/tenancy/stores/${storeId}`),
  updateStoreIdentity: (storeId: string, payload: { name?: string; slug?: string; currency?: string; timezone?: string }) =>
    apiClient.patch(`/tenancy/stores/${storeId}`, payload),
  updateCapabilities: (storeId: string, capabilities: { productCommerceEnabled: boolean; appointmentsEnabled: boolean; restaurantPosEnabled: boolean }) =>
    apiClient(`/tenancy/stores/${storeId}/capabilities`, {
      method: 'PATCH',
      body: JSON.stringify(capabilities)
    }),
  updateStorefrontMode: (storeId: string, payload: { mode: string; homePage?: string; navigationConfig?: any[] }) =>
    apiClient(`/tenancy/stores/${storeId}/storefront-mode`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    }),

  // Team
  getTeamMembers: () => apiClient<{ members: any[] }>('/team/members'),
  createTeamMember: (member: any) =>
    apiClient<{ message: string; staffId?: string; staff?: { id: string; displayName: string } }>('/team/members', {
      method: 'POST',
      body: JSON.stringify(member)
    }),
  updateTeamMember: (id: string, member: any) =>
    apiClient<any>(`/team/members/${id}`, {
      method: 'PUT',
      body: JSON.stringify(member)
    }),
  deleteTeamMember: (id: string) =>
    apiClient<any>(`/team/members/${id}`, {
      method: 'DELETE'
    }),
  getRoles: () => apiClient<{ roles: any[] }>('/team/roles'),
  createCustomRole: (payload: { name: string; code?: string; description?: string; permissionCodes: string[] }) =>
    apiClient<{ message: string; id: string; name: string; code: string }>('/team/roles', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  updateCustomRole: (id: string, payload: { name?: string; description?: string; permissionCodes?: string[] }) =>
    apiClient<any>(`/team/roles/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    }),
  deleteCustomRole: (id: string) =>
    apiClient<any>(`/team/roles/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  getResponsibilities: () => apiClient<{ responsibilities: any[] }>('/team/responsibilities'),
  getPermissions: () => apiClient<{ permissions: any[] }>('/team/permissions'),

  // Storefront & Publishing
  getPages: () => apiClient<{ pages: any[] }>('/storefront/pages'),
  savePageDraft: (pageId: string, sections: any[], pageProps?: any, expectedVersion?: number) =>
    apiClient<{ message: string; pageId: string; version: number }>(`/storefront/pages/${encodeURIComponent(pageId)}/draft`, {
      method: 'PATCH',
      body: JSON.stringify({
        sections,
        pageProps,
        ...(expectedVersion !== undefined ? { expectedVersion } : {})
      })
    }),
  publishStore: (notes?: string) =>
    apiClient<{ message: string; releaseId: string; releaseNumber: number }>('/storefront/publish', {
      method: 'POST',
      body: JSON.stringify({ notes })
    }),
  getReleases: () => apiClient<{ releases: any[] }>('/storefront/releases'),
  restoreRelease: (releaseId: string) =>
    apiClient(`/storefront/releases/${releaseId}/restore`, {
      method: 'POST'
    }),

  // Extensions & Provider Connections (Tenant-Scoped Encrypted Records, REQ-INT-001)
  getIntegrationConnections: () => apiClient<{ connections: any[] }>('/extensions/connections'),
  saveIntegrationConnection: (payload: { providerKey: string; environment: 'TEST' | 'LIVE'; credentials: any; settings?: any }) =>
    apiClient<any>('/extensions/connections', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  testIntegrationConnection: (providerKey: string, payload: { environment?: 'TEST' | 'LIVE' } = {}) =>
    apiClient<any>(`/extensions/connections/${providerKey}/test`, {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  disconnectIntegrationConnection: (providerKey: string, payload: { environment?: 'TEST' | 'LIVE' } = {}) =>
    apiClient<any>(`/extensions/connections/${providerKey}/disconnect`, {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  toggleIntegrationConnection: (providerKey: string, enabled: boolean) =>
    apiClient<any>(`/extensions/connections/${providerKey}/toggle`, {
      method: 'PATCH',
      body: JSON.stringify({ enabled })
    }),
  installExtension: (providerKey: string) =>
    apiClient<any>(`/extensions/connections/${providerKey}/install`, {
      method: 'POST'
    }),
  uninstallExtension: (providerKey: string) =>
    apiClient<any>(`/extensions/connections/${providerKey}/uninstall`, {
      method: 'POST'
    }),
  getExtensionsConfig: () => apiClient<{ extensions: any[] }>('/extensions/config'),
  createRazorpayOrder: (payload: { amountMinor: number; currency?: string; referenceId?: string; purpose?: string }) =>
    apiClient<any>('/extensions/razorpay/create-order', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  createShiprocketShipment: (payload: { orderId: string; weightGrams?: number }) =>
    apiClient<any>('/extensions/shiprocket/create-shipment', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  // Price Lists
  getPriceLists: () => apiClient<{ priceLists: any[] }>('/catalog/pricelists'),
  createPriceList: (payload: { name: string; description?: string; currency?: string; tierType?: string; discountPct?: number }) =>
    apiClient<any>('/catalog/pricelists', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  deletePriceList: (id: string) =>
    apiClient<any>(`/catalog/pricelists/${id}`, {
      method: 'DELETE'
    }),

  processRefund: (payload: { orderId: string; amountMinor: number; reason?: string }) =>
    apiClient<any>('/orders/refunds', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  // People & Tickets
  createCustomer: (payload: { firstName: string; lastName?: string; email?: string; phone?: string; addressLine1?: string; city?: string; state?: string; postalCode?: string; country?: string }) =>
    apiClient<any>('/orders/customers', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  getCustomerTickets: (params?: { status?: string; priority?: string; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.status) q.append('status', params.status);
    if (params?.priority) q.append('priority', params.priority);
    if (params?.search) q.append('search', params.search);
    const qs = q.toString() ? `?${q.toString()}` : '';
    return apiClient<{ tickets: any[] }>(`/orders/tickets${qs}`);
  },
  createCustomerTicket: (payload: { customerName: string; customerEmail?: string; subject: string; description?: string; priority?: string; customerId?: string }) =>
    apiClient<any>('/orders/tickets', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  updateCustomerTicket: (id: string, payload: { status?: string; priority?: string; assignedTo?: string }) =>
    apiClient<any>(`/orders/tickets/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    }),

  // POS Shifts & Counters
  getPOSShifts: () => apiClient<{ shifts: any[] }>('/pos/shifts'),
  createPOSCounter: (payload: { name: string; code?: string }) =>
    apiClient<any>('/pos/counters', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  // Storefront Navigation
  getStoreNavigation: () => apiClient<{ navigation: any[] }>('/storefront/navigation'),
  updateStoreNavigation: (navigation: any[]) =>
    apiClient<any>('/storefront/navigation', {
      method: 'PATCH',
      body: JSON.stringify({ navigation })
    })
};
