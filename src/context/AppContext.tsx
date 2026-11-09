import { createContext, useContext, useCallback, useEffect, useState, useRef, type ReactNode } from 'react';
import type {
  User, Partner, Customer, Lead, Employee, Category,
  Announcement, Notification, Plan, AppSettings, Product, SiteContent,
  CommissionTransaction, Role, AdminSectionKey, Popup,
  ChatThread, ChatMessage, LeadPaymentStatus, PlanType, CustomerPayment,
} from '@/types';
import { appSettings as defaultAppSettings, defaultSiteContent, defaultRoles } from '@/data/mockData';
import { usePersistentState } from '@/utils/usePersistentState';
import { useSupabaseCollection, useSupabaseSingleton } from '@/utils/useSupabaseState';
import { useNotificationSound } from '@/utils/useNotificationSound';
import { supabase } from '@/lib/supabase';

interface ProfileUpdate {
  name: string;
  email: string;
  phone: string;
  whatsapp?: string;
  company?: string;
}

interface PasswordUpdate {
  currentPassword: string;
  newPassword: string;
}

interface AppContextValue {
  currentUser: User | null;
  partnerUsers: User[];
  partnerPasswords: Record<string, string>;
  login: (email: string, password: string) => Promise<boolean>;
  loginOtp: (email: string) => boolean;
  logout: () => void;
  dataLoaded: boolean;

  partners: Partner[];
  customers: Customer[];
  leads: Lead[];
  employees: Employee[];
  categories: Category[];
  announcements: Announcement[];
  notifications: Notification[];
  plans: Plan[];
  products: Product[];
  settings: AppSettings;
  siteContent: SiteContent;
  transactions: CommissionTransaction[];
  customerPayments: CustomerPayment[];
  roles: Role[];
  popups: Popup[];

  hasPermission: (section: AdminSectionKey) => boolean;
  getEmployeePermissions: (roleId: string) => AdminSectionKey[];
  addRole: (r: Omit<Role, 'id'>) => void;
  updateRole: (id: string, updates: Partial<Omit<Role, 'id'>>) => void;
  deleteRole: (id: string) => void;
  assignEmployeeRole: (employeeId: string, roleId: string) => void;

  addPartner: (p: Omit<Partner, 'id' | 'totalCommission' | 'monthlyCommission' | 'pendingCommission' | 'monthlySales'> & { password: string }) => Promise<void>;
  updatePartner: (id: string, updates: Partial<Omit<Partner, 'id'>>) => void;
  deletePartner: (id: string) => void;
  addEmployee: (e: Omit<Employee, 'id'> & { password: string }) => Promise<void>;
  updateEmployee: (id: string, updates: Partial<Omit<Employee, 'id'>>) => void;
  deleteEmployee: (id: string) => void;
  addCategory: (c: Omit<Category, 'id'>) => Promise<void>;
  deleteCategory: (id: string) => void;
  addPlan: (p: Omit<Plan, 'id'>) => Promise<void>;
  updatePlan: (id: string, updates: Partial<Omit<Plan, 'id'>>) => Promise<void>;
  deletePlan: (id: string) => void;
  addPopup: (p: Omit<Popup, 'id' | 'createdAt'>) => void;
  updatePopup: (id: string, updates: Partial<Omit<Popup, 'id'>>) => void;
  deletePopup: (id: string) => void;
  addProduct: (p: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, updates: Partial<Omit<Product, 'id'>>) => void;
  deleteProduct: (id: string) => void;
  addAnnouncement: (a: Omit<Announcement, 'id' | 'date' | 'author' | 'authorRole' | 'isPinned'>) => Promise<{ success: boolean; error?: string }>;
  deleteAnnouncement: (id: string) => void;
  deleteLead: (id: string) => void;
  updateLeadStatus: (id: string, status: Lead['status']) => void;
  approveLead: (id: string, details: { productId?: string; productName?: string; planType: Lead['planType']; planPrice: number; commissionRate: number }) => void;
  updateLeadPayment: (id: string, details: { paymentStatus: LeadPaymentStatus; planPrice: number; commissionRate: number; renewalDate: string }) => void;
  convertLead: (id: string) => void;
  addLead: (l: Omit<Lead, 'id' | 'submittedDate' | 'lockEndDate' | 'status' | 'partnerName'>) => boolean;
  adminAddLead: (l: { partnerId: string; companyName: string; contactName: string; email: string; phone: string; whatsapp: string; productId?: string; productName?: string; planType: PlanType; notes: string }) => void;
  addCustomer: (c: Omit<Customer, 'id' | 'commissionEarned' | 'commissionEndDate' | 'monthsElapsed' | 'remainingMonths'>) => void;
  deleteCustomer: (id: string) => void;
  addCustomerPayment: (p: Omit<CustomerPayment, 'id'>) => Promise<void>;
  deleteCustomerPayment: (id: string) => void;
  markNotificationRead: (id: string) => void;
  markAllRead: () => void;

  // Per-browser dismissed/read tracking for merged notification feed
  readAnnouncementIds: string[];
  dismissedAnnouncementIds: string[];
  dismissedNotificationIds: string[];
  setReadAnnouncementIds: (updater: (prev: string[]) => string[]) => void;
  setDismissedAnnouncementIds: (updater: (prev: string[]) => string[]) => void;
  setDismissedNotificationIds: (updater: (prev: string[]) => string[]) => void;

  updateSettings: (s: Partial<AppSettings>) => void;
  updateSiteContent: (s: Partial<SiteContent>) => void;
  resetSiteContent: () => void;
  clearDemoData: () => void;
  resetAllData: () => void;
  updateUserProfile: (updates: ProfileUpdate) => void;
  updateUserPassword: (updates: PasswordUpdate) => { success: boolean; error?: string };

  chatThreads: ChatThread[];
  chatMessages: ChatMessage[];
  startChatThread: (subject: string) => string;
  sendChatMessage: (threadId: string, text: string, fromSupport?: boolean) => void;
  markThreadReadByPartner: (threadId: string) => void;
  markThreadReadBySupport: (threadId: string) => void;
  closeChatThread: (threadId: string) => void;
  reopenChatThread: (threadId: string) => void;
  totalUnreadChatBySupport: number;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = usePersistentState<User | null>('zubkas_currentUser', null);

  // Core data — live Supabase collections with realtime sync
  const partnersHook = useSupabaseCollection<Partner>('partners', []);
  const customersHook = useSupabaseCollection<Customer>('customers', []);
  const leadsHook = useSupabaseCollection<Lead>('leads', []);
  const employeesHook = useSupabaseCollection<Employee>('employees', []);
  const categoriesHook = useSupabaseCollection<Category>('categories', []);
  const announcementsHook = useSupabaseCollection<Announcement>('announcements', []);
  const notificationsHook = useSupabaseCollection<Notification>('notifications', []);
  const plansHook = useSupabaseCollection<Plan>('plans', []);
  const productsHook = useSupabaseCollection<Product>('products', []);
  const transactionsHook = useSupabaseCollection<CommissionTransaction>('commission_transactions', []);
  const rolesHook = useSupabaseCollection<Role>('roles', defaultRoles);
  const chatThreadsHook = useSupabaseCollection<ChatThread>('chat_threads', []);
  const chatMessagesHook = useSupabaseCollection<ChatMessage>('chat_messages', [], 'timestamp');
  const popupsHook = useSupabaseCollection<Popup>('popups', []);
  const customerPaymentsHook = useSupabaseCollection<CustomerPayment>('customer_payments', []);

  // Site content — singleton JSON blob
  const [siteContent, setSiteContent] = useSupabaseSingleton<SiteContent>('site_content', defaultSiteContent, 'content');

  // Settings — multi-column singleton
  const [settingsState, setSettingsState] = useState<AppSettings>(defaultAppSettings);
  const settingsLoadedRef = useRef(false);

  // Per-browser dismissed/read tracking — single source of truth shared by
  // Header dropdown, Notifications page, and Announcements page so they
  // never drift apart on refresh.
  const [readAnnouncementIds, setReadAnnouncementIds] = usePersistentState<string[]>('zubkas_read_announcements', []);
  const [dismissedAnnouncementIds, setDismissedAnnouncementIds] = usePersistentState<string[]>('zubkas_dismissed_announcements', []);
  const [dismissedNotificationIds, setDismissedNotificationIds] = usePersistentState<string[]>('zubkas_dismissed_notifications', []);

  // App users (login system)
  const [appUsers, setAppUsers] = useState<User[]>([]);
  const [userPasswords, setUserPasswords] = useState<Record<string, string>>({});
  const [partnerUsers, setPartnerUsers] = useState<User[]>([]);
  const [usersLoaded, setUsersLoaded] = useState(false);

  const [dataLoaded, setDataLoaded] = useState(false);

  // Load app users + settings from Supabase on mount
  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase.from('app_users').select('*');
        if (!error && data) {
          const users = data.map((row: Record<string, unknown>) => ({
            id: row.id as string,
            email: row.email as string,
            name: row.name as string,
            role: row.role as User['role'],
            phone: (row.phone as string) ?? undefined,
            whatsapp: (row.whatsapp as string) ?? undefined,
            company: (row.company as string) ?? undefined,
            partnerId: (row.partner_id as string) ?? undefined,
            employeeRole: (row.employee_role as string) ?? undefined,
            joinedDate: row.joined_date as string,
          }));
          setAppUsers(users);
          const pwdMap: Record<string, string> = {};
          for (const row of data as Record<string, unknown>[]) {
            if (row.password) pwdMap[row.id as string] = row.password as string;
          }
          setUserPasswords(pwdMap);
          setPartnerUsers(users.filter(u => u.role === 'partner'));
        }
      } catch {
        // ignore
      }

      try {
        const { data: sData, error: sError } = await supabase
          .from('app_settings')
          .select('*')
          .eq('id', 'singleton')
          .maybeSingle();
        if (!sError && sData) {
          const s = sData as Record<string, unknown>;
          settingsLoadedRef.current = true;
          setSettingsState({
            leadLockDays: (s.lead_lock_days as number) ?? 3,
            commissionCapMonths: (s.commission_cap_months as number) ?? 12,
            defaultCurrency: (s.default_currency as string) ?? '₹',
          });
        }
      } catch {
        // ignore
      }

      setUsersLoaded(true);
      setDataLoaded(true);
    })();
  }, []);

  // Persist settings to Supabase when they change (skip initial load)
  useEffect(() => {
    if (!settingsLoadedRef.current) return;
    settingsLoadedRef.current = true;
    (async () => {
      try {
        await supabase.from('app_settings').upsert({
          id: 'singleton',
          lead_lock_days: settingsState.leadLockDays,
          commission_cap_months: settingsState.commissionCapMonths,
          default_currency: settingsState.defaultCurrency,
          updated_at: new Date().toISOString(),
        });
      } catch {
        // ignore
      }
    })();
  }, [settingsState]);

  // Subscribe to app_users realtime for live user sync
  useEffect(() => {
    const channel = supabase
      .channel('realtime-app_users')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'app_users' }, async () => {
        try {
          const { data } = await supabase.from('app_users').select('*');
          if (data) {
            const users = data.map((row: Record<string, unknown>) => ({
              id: row.id as string,
              email: row.email as string,
              name: row.name as string,
              role: row.role as User['role'],
              phone: (row.phone as string) ?? undefined,
              whatsapp: (row.whatsapp as string) ?? undefined,
              company: (row.company as string) ?? undefined,
              partnerId: (row.partner_id as string) ?? undefined,
              employeeRole: (row.employee_role as string) ?? undefined,
              joinedDate: row.joined_date as string,
            }));
            setAppUsers(users);
            const pwdMap: Record<string, string> = {};
            for (const row of data as Record<string, unknown>[]) {
              if (row.password) pwdMap[row.id as string] = row.password as string;
            }
            setUserPasswords(pwdMap);
            setPartnerUsers(users.filter(u => u.role === 'partner'));
          }
        } catch {
          // ignore
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const insertAppUser = useCallback(async (user: User & { password?: string }) => {
    const { error } = await supabase.from('app_users').insert({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone ?? null,
      whatsapp: user.whatsapp ?? null,
      company: user.company ?? null,
      partner_id: user.partnerId ?? null,
      employee_role: user.employeeRole ?? null,
      joined_date: user.joinedDate,
      password: user.password ?? '',
    });
    if (error) throw new Error(error.message);
  }, []);

  const deleteAppUser = useCallback(async (id: string) => {
    try {
      await supabase.from('app_users').delete().eq('id', id);
    } catch {
      // ignore
    }
  }, []);

  const updateAppUserInDb = useCallback(async (id: string, updates: Record<string, unknown>) => {
    try {
      await supabase.from('app_users').update(updates).eq('id', id);
    } catch {
      // ignore
    }
  }, []);

  // Destructure for convenient access
  const { state: partners } = partnersHook;
  const { state: customers } = customersHook;
  const { state: leads } = leadsHook;
  const { state: employees } = employeesHook;
  const { state: categories } = categoriesHook;
  const { state: announcements } = announcementsHook;
  const { state: notifications } = notificationsHook;
  const { state: plans } = plansHook;
  const { state: products } = productsHook;
  const { state: transactions } = transactionsHook;
  const { state: roles } = rolesHook;
  const { state: chatThreads } = chatThreadsHook;
  const { state: chatMessages } = chatMessagesHook;
  const { state: popups } = popupsHook;
  const { state: customerPayments } = customerPaymentsHook;

  const allCollectionsLoaded = [
    partnersHook.loaded, customersHook.loaded, leadsHook.loaded, employeesHook.loaded,
    categoriesHook.loaded, announcementsHook.loaded, notificationsHook.loaded,
    plansHook.loaded, productsHook.loaded, transactionsHook.loaded, rolesHook.loaded,
    chatThreadsHook.loaded, chatMessagesHook.loaded, popupsHook.loaded, customerPaymentsHook.loaded,
  ].every(Boolean);

  useNotificationSound(announcements, notifications, dataLoaded && allCollectionsLoaded);

  const login = useCallback(async (email: string, password: string) => {
    const lowerEmail = email.toLowerCase();

    if (lowerEmail === 'zubkastechnology@gmail.com' && password === 'MARJAN@53542') {
      setCurrentUser({
        id: 'admin-zubkas',
        email: 'zubkastechnology@gmail.com',
        name: 'Zubkas Technology',
        role: 'admin',
        joinedDate: '2024-01-01',
      });
      return true;
    }

    const dbUser = appUsers.find(u => u.email.toLowerCase() === lowerEmail);
    if (dbUser) {
      const storedPassword = userPasswords[dbUser.id];
      if (storedPassword === undefined || storedPassword === '' || storedPassword !== password) return false;
      setCurrentUser(dbUser);
      return true;
    }

    const partnerUser = partnerUsers.find(u => u.email.toLowerCase() === lowerEmail);
    if (partnerUser) {
      const storedPassword = userPasswords[partnerUser.id];
      if (storedPassword === undefined || storedPassword === '' || storedPassword !== password) return false;
      setCurrentUser(partnerUser);
      return true;
    }

    const employee = employees.find(e => e.email.toLowerCase() === lowerEmail && e.status === 'Active');
    if (employee) {
      const empPwd = userPasswords[employee.id];
      if (empPwd === undefined || empPwd === '' || empPwd !== password) return false;
      setCurrentUser({
        id: employee.id,
        email: employee.email,
        name: employee.name,
        role: 'employee',
        employeeRole: employee.role,
        phone: employee.phone,
        whatsapp: employee.whatsapp,
        joinedDate: employee.joinedDate,
      });
      return true;
    }

    try {
      const { data: empData, error: empError } = await supabase
        .from('employees')
        .select('id, name, email, phone, whatsapp, role, role_id, status, joined_date, password')
        .ilike('email', lowerEmail)
        .eq('status', 'Active')
        .limit(1)
        .maybeSingle();
      if (!empError && empData) {
        const emp = empData as Record<string, unknown>;
        const empPwd = emp.password as string | undefined;
        if (empPwd !== undefined && empPwd !== '' && empPwd === password) {
          setCurrentUser({
            id: emp.id as string,
            email: emp.email as string,
            name: emp.name as string,
            role: 'employee',
            employeeRole: emp.role as string,
            phone: (emp.phone as string) ?? undefined,
            whatsapp: (emp.whatsapp as string) ?? undefined,
            joinedDate: emp.joined_date as string,
          });
          return true;
        }
      }
    } catch {
      // ignore, fall through to app_users fallback
    }

    try {
      const { data, error } = await supabase
        .from('app_users')
        .select('id, email, name, role, phone, whatsapp, company, partner_id, employee_role, joined_date, password')
        .ilike('email', lowerEmail)
        .limit(1)
        .maybeSingle();
      if (error || !data) return false;
      const storedPassword = (data as Record<string, unknown>).password as string | undefined;
      if (storedPassword === undefined || storedPassword === '' || storedPassword !== password) return false;
      const user: User = {
        id: data.id as string,
        email: data.email as string,
        name: data.name as string,
        role: data.role as User['role'],
        phone: (data.phone as string) ?? undefined,
        whatsapp: (data.whatsapp as string) ?? undefined,
        company: (data.company as string) ?? undefined,
        partnerId: (data.partner_id as string) ?? undefined,
        employeeRole: (data.employee_role as string) ?? undefined,
        joinedDate: data.joined_date as string,
      };
      setCurrentUser(user);
      return true;
    } catch {
      return false;
    }
  }, [setCurrentUser, appUsers, userPasswords, partnerUsers, employees]);

  const loginOtp = useCallback((email: string) => {
    const lowerEmail = email.toLowerCase();
    const dbUser = appUsers.find(u => u.email.toLowerCase() === lowerEmail);
    if (dbUser) {
      setCurrentUser(dbUser);
      return true;
    }
    const partnerUser = partnerUsers.find(u => u.email.toLowerCase() === lowerEmail);
    if (partnerUser) {
      setCurrentUser(partnerUser);
      return true;
    }
    const employee = employees.find(e => e.email.toLowerCase() === lowerEmail && e.status === 'Active');
    if (employee) {
      setCurrentUser({
        id: employee.id,
        email: employee.email,
        name: employee.name,
        role: 'employee',
        employeeRole: employee.role,
        phone: employee.phone,
        whatsapp: employee.whatsapp,
        joinedDate: employee.joinedDate,
      });
      return true;
    }
    return false;
  }, [setCurrentUser, appUsers, partnerUsers, employees]);

  const logout = useCallback(() => setCurrentUser(null), [setCurrentUser]);

  // ===== PARTNERS =====
  const addPartner: AppContextValue['addPartner'] = useCallback(async (p) => {
    const newPartner: Partner = {
      id: '',
      name: p.name, email: p.email, phone: p.phone, company: p.company,
      category: p.category, status: p.status, joinedDate: p.joinedDate,
      totalCommission: 0, monthlyCommission: 0, pendingCommission: 0,
      monthlySales: 0,
    };
    const insertedPartner = await partnersHook.insertRow(newPartner);
    if (!insertedPartner.id) {
      throw new Error('Partner was created but the database did not return a valid ID. Cannot create login account.');
    }

    const newUser: User = {
      id: crypto.randomUUID(),
      email: p.email, name: p.name, role: 'partner',
      partnerId: insertedPartner.id, phone: p.phone, company: p.company, joinedDate: p.joinedDate,
    };
    try {
      await insertAppUser({ ...newUser, password: p.password });
    } catch (appUserErr) {
      partnersHook.deleteRow(insertedPartner.id);
      throw new Error(
        `Partner login account could not be created: ${appUserErr instanceof Error ? appUserErr.message : 'Unknown error'}. The partner record was rolled back. Please try again.`
      );
    }
    setPartnerUsers(prev => [...prev, newUser]);
    setAppUsers(prev => [...prev, newUser]);
    setUserPasswords(prev => ({ ...prev, [newUser.id]: p.password }));
  }, [partnersHook, setPartnerUsers, setAppUsers, setUserPasswords, insertAppUser]);

  const updatePartner: AppContextValue['updatePartner'] = useCallback((id, updates) => {
    partnersHook.updateRow(id, updates);
    setPartnerUsers(prev => prev.map(u => u.partnerId === id ? { ...u, name: updates.name ?? u.name, email: updates.email ?? u.email, phone: updates.phone ?? u.phone, company: updates.company ?? u.company } : u));
    const partnerUser = partnerUsers.find(u => u.partnerId === id);
    if (partnerUser) {
      updateAppUserInDb(partnerUser.id, {
        name: updates.name, email: updates.email, phone: updates.phone, company: updates.company,
      });
    }
  }, [partnersHook, setPartnerUsers, partnerUsers, updateAppUserInDb]);

  const deletePartner: AppContextValue['deletePartner'] = useCallback((id) => {
    partnersHook.deleteRow(id);
    // Cascade delete related rows in Supabase
    customers.filter(c => c.partnerId === id).forEach(c => customersHook.deleteRow(c.id));
    leads.filter(l => l.partnerId === id).forEach(l => leadsHook.deleteRow(l.id));
    transactions.filter(t => t.partnerId === id).forEach(t => transactionsHook.deleteRow(t.id));
    notifications.filter(n => n.userId === id).forEach(n => notificationsHook.deleteRow(n.id));
    const removedPartnerUsers = partnerUsers.filter(u => u.partnerId === id);
    setPartnerUsers(prev => prev.filter(u => u.partnerId !== id));
    setAppUsers(prev => prev.filter(u => u.partnerId !== id));
    setUserPasswords(prev => {
      const next = { ...prev };
      for (const u of removedPartnerUsers) delete next[u.id];
      return next;
    });
    for (const u of removedPartnerUsers) deleteAppUser(u.id);
  }, [partnersHook, customersHook, leadsHook, transactionsHook, notificationsHook, customers, leads, transactions, notifications, partnerUsers, setPartnerUsers, setAppUsers, setUserPasswords, deleteAppUser]);

  // ===== EMPLOYEES =====
  const addEmployee: AppContextValue['addEmployee'] = useCallback(async (e) => {
    const { password, ...employee } = e;
    const insertedEmployee = await employeesHook.insertRow({ ...employee, id: '', password } as Employee & { password: string });
    const employeeId = insertedEmployee.id;
    setUserPasswords(prev => ({ ...prev, [employeeId]: password }));
    const newUser: User = {
      id: employeeId, email: employee.email, name: employee.name,
      role: 'employee', employeeRole: employee.role,
      phone: employee.phone, whatsapp: employee.whatsapp, joinedDate: employee.joinedDate,
    };
    setAppUsers(prev => [...prev, newUser]);
    await insertAppUser({ ...newUser, password });
  }, [employeesHook, setUserPasswords, setAppUsers, insertAppUser]);

  const assignEmployeeRole = useCallback((employeeId: string, roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    employeesHook.updateRow(employeeId, { roleId, role: role?.name ?? '' });
  }, [roles, employeesHook]);

  // ===== ROLES =====
  const addRole = useCallback((r: Omit<Role, 'id'>) => {
    rolesHook.insertRow({ ...r, id: '' });
  }, [rolesHook]);

  const updateRole = useCallback((id: string, updates: Partial<Omit<Role, 'id'>>) => {
    rolesHook.updateRow(id, updates);
  }, [rolesHook]);

  const deleteRole = useCallback((id: string) => {
    rolesHook.deleteRow(id);
  }, [rolesHook]);

  const getEmployeePermissions = useCallback((roleId: string): AdminSectionKey[] => {
    return roles.find(r => r.id === roleId)?.permissions ?? [];
  }, [roles]);

  const hasPermission = useCallback((section: AdminSectionKey): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true;
    if (currentUser.role !== 'employee') return false;
    const employee = employees.find(e => e.email === currentUser.email);
    if (!employee) return false;
    return getEmployeePermissions(employee.roleId).includes(section);
  }, [currentUser, employees, getEmployeePermissions]);

  const updateEmployee: AppContextValue['updateEmployee'] = useCallback((id, updates) => {
    employeesHook.updateRow(id, updates);
    updateAppUserInDb(id, {
      name: updates.name, email: updates.email, phone: updates.phone, whatsapp: updates.whatsapp,
    });
  }, [employeesHook, updateAppUserInDb]);

  const deleteEmployee: AppContextValue['deleteEmployee'] = useCallback((id) => {
    employeesHook.deleteRow(id);
    setAppUsers(prev => prev.filter(u => u.id !== id));
    setUserPasswords(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    deleteAppUser(id);
  }, [employeesHook, setAppUsers, setUserPasswords, deleteAppUser]);

  // ===== CATEGORIES =====
  const addCategory: AppContextValue['addCategory'] = useCallback(async (c) => {
    await categoriesHook.insertRow({ ...c, id: '' });
  }, [categoriesHook]);

  const deleteCategory: AppContextValue['deleteCategory'] = useCallback((id) => {
    categoriesHook.deleteRow(id);
  }, [categoriesHook]);

  // ===== PLANS =====
  const addPlan: AppContextValue['addPlan'] = useCallback(async (p) => {
    await plansHook.insertRow({ ...p, id: '', isCustom: false });
  }, [plansHook]);

  const updatePlan: AppContextValue['updatePlan'] = useCallback(async (id, updates) => {
    await plansHook.updateRow(id, updates);
  }, [plansHook]);

  const deletePlan: AppContextValue['deletePlan'] = useCallback((id) => {
    plansHook.deleteRow(id);
  }, [plansHook]);

  // ===== POPUPS =====
  const addPopup: AppContextValue['addPopup'] = useCallback((p) => {
    popupsHook.insertRow({ ...p, id: '' });
  }, [popupsHook]);

  const updatePopup: AppContextValue['updatePopup'] = useCallback((id, updates) => {
    popupsHook.updateRow(id, updates);
  }, [popupsHook]);

  const deletePopup: AppContextValue['deletePopup'] = useCallback((id) => {
    popupsHook.deleteRow(id);
  }, [popupsHook]);

  // ===== PRODUCTS =====
  const addProduct: AppContextValue['addProduct'] = useCallback((p) => {
    productsHook.insertRow({ ...p, id: '' });
  }, [productsHook]);

  const updateProduct: AppContextValue['updateProduct'] = useCallback((id, updates) => {
    productsHook.updateRow(id, updates);
  }, [productsHook]);

  const deleteProduct: AppContextValue['deleteProduct'] = useCallback((id) => {
    productsHook.deleteRow(id);
  }, [productsHook]);

  // ===== LEADS =====
  const deleteLead: AppContextValue['deleteLead'] = useCallback((id) => {
    leadsHook.deleteRow(id);
  }, [leadsHook]);

  const updateLeadStatus: AppContextValue['updateLeadStatus'] = useCallback((id, status) => {
    leadsHook.updateRow(id, { status });
  }, [leadsHook]);

  const approveLead: AppContextValue['approveLead'] = useCallback(async (id, details) => {
    const today = new Date().toISOString().split('T')[0];
    const lockEnd = new Date();
    lockEnd.setDate(lockEnd.getDate() + settingsState.leadLockDays);
    const lockEndDate = lockEnd.toISOString().split('T')[0];
    const lead = leads.find(l => l.id === id);
    try {
      await leadsHook.updateRow(id, {
        status: 'Approved', lockEndDate,
        productId: details.productId, productName: details.productName,
        planType: details.planType, planPrice: details.planPrice,
        commissionRate: details.commissionRate,
      });
    } catch (e) {
      console.error('Failed to approve lead:', e);
      return;
    }
    if (lead) {
      try {
        await notificationsHook.insertRow({
          id: '', userId: lead.partnerId,
          title: 'Lead Approved',
          message: `Your lead "${lead.companyName}" has been approved and locked for ${settingsState.leadLockDays} days. Convert it before the lock expires.`,
          type: 'lead', date: today, read: false,
        });
      } catch (e) {
        console.error('Failed to send approval notification:', e);
      }
    }
  }, [leads, settingsState.leadLockDays, leadsHook, notificationsHook]);

  const updateLeadPayment: AppContextValue['updateLeadPayment'] = useCallback(async (id, details) => {
    const lead = leads.find(l => l.id === id);
    const today = new Date().toISOString().split('T')[0];
    const isPaid = details.paymentStatus === 'Paid';

    try {
      await leadsHook.updateRow(id, {
        status: isPaid ? 'Converted' : 'Locked',
        paymentStatus: details.paymentStatus,
        planPrice: details.planPrice, commissionRate: details.commissionRate,
        renewalDate: details.renewalDate,
      });
    } catch (e) {
      console.error('Failed to update lead payment:', e);
      return;
    }

    const linkedCustomer = lead ? customers.find(c => c.email === lead.email || (c.companyName === lead.companyName && c.partnerId === lead.partnerId)) : undefined;
    if (linkedCustomer) {
      try {
        await customersHook.updateRow(linkedCustomer.id, {
          status: isPaid ? 'Active' : 'Unpaid',
          commissionRate: details.commissionRate,
          subscriptionAmount: details.planPrice,
          renewalDate: details.renewalDate,
        });
      } catch (e) {
        console.error('Failed to update linked customer:', e);
      }
    } else if (isPaid && lead) {
      const renewalDate = details.renewalDate ?? (lead.planType === 'Yearly'
        ? new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
        : new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0]);
      const commissionEndDate = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0];
      const newCustomer: Customer = {
        id: '', partnerId: lead.partnerId,
        name: lead.contactName, companyName: lead.companyName,
        phone: lead.phone, email: lead.email, whatsapp: lead.whatsapp ?? lead.phone,
        planType: lead.planType ?? 'Monthly', planTier: 'Premium',
        commissionRate: details.commissionRate,
        subscriptionAmount: details.planPrice,
        startDate: today, renewalDate,
        status: 'Active',
        commissionEarned: 0, commissionEndDate,
        monthsElapsed: 0, remainingMonths: 12,
      };
      try {
        await customersHook.upsertRow(newCustomer);
      } catch (e) {
        console.error('Failed to create customer from lead:', e);
      }
    }

    if (lead) {
      try {
        await notificationsHook.insertRow({
          id: '', userId: lead.partnerId,
          title: isPaid ? 'Payment Confirmed — Lead Converted' : 'Payment Marked Unpaid',
          message: isPaid
            ? `Payment for lead "${lead.companyName}" has been confirmed and the lead has been converted to a customer.`
            : `Payment for lead "${lead.companyName}" has been marked as Unpaid. Commissions are paused until payment is confirmed.`,
          type: 'payment', date: today, read: false,
        });
      } catch (e) {
        console.error('Failed to send payment notification:', e);
      }
    }
  }, [leads, customers, leadsHook, customersHook, notificationsHook]);

  const convertLead: AppContextValue['convertLead'] = useCallback(async (id) => {
    const lead = leads.find(l => l.id === id);
    if (!lead) return;
    // Guard: don't create a duplicate customer if one already exists for this lead
    const existing = customers.find(c => c.email === lead.email || (c.companyName === lead.companyName && c.partnerId === lead.partnerId));
    if (existing) {
      try {
        await customersHook.updateRow(existing.id, {
          status: lead.paymentStatus === 'Paid' ? 'Active' : 'Unpaid',
          commissionRate: lead.commissionRate ?? existing.commissionRate,
          subscriptionAmount: lead.planPrice ?? existing.subscriptionAmount,
        });
      } catch (e) {
        console.error('Failed to update existing customer:', e);
      }
      try {
        await leadsHook.updateRow(id, { status: 'Converted' });
      } catch (e) {
        console.error('Failed to mark lead as Converted:', e);
      }
      return;
    }
    const today = new Date().toISOString().split('T')[0];
    const renewalDate = lead.renewalDate ?? (lead.planType === 'Yearly'
      ? new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
      : new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0]);
    const commissionEndDate = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0];
    const newCustomer: Customer = {
      id: '', partnerId: lead.partnerId,
      name: lead.contactName, companyName: lead.companyName,
      phone: lead.phone, email: lead.email, whatsapp: lead.whatsapp ?? lead.phone,
      planType: lead.planType ?? 'Monthly', planTier: 'Premium',
      commissionRate: lead.commissionRate ?? 15,
      subscriptionAmount: lead.planPrice ?? 0,
      startDate: today, renewalDate,
      status: lead.paymentStatus === 'Paid' ? 'Active' : 'Unpaid',
      commissionEarned: 0, commissionEndDate,
      monthsElapsed: 0, remainingMonths: 12,
    };
    try {
      await customersHook.upsertRow(newCustomer);
    } catch (e) {
      console.error('Failed to create customer from converted lead:', e);
      return;
    }
    try {
      await leadsHook.updateRow(id, { status: 'Converted' });
    } catch (e) {
      console.error('Failed to mark lead as Converted:', e);
    }
    try {
      await notificationsHook.insertRow({
        id: '', userId: lead.partnerId,
        title: 'Lead Converted',
        message: `Your lead "${lead.companyName}" has been converted to a customer.`,
        type: 'lead', date: today, read: false,
      });
    } catch (e) {
      console.error('Failed to send conversion notification:', e);
    }
  }, [leads, customers, customersHook, leadsHook, notificationsHook]);

  const adminAddLead: AppContextValue['adminAddLead'] = useCallback((l) => {
    const partner = l.partnerId === 'none' ? null : partners.find(p => p.id === l.partnerId);
    const today = new Date().toISOString().split('T')[0];
    const lockEnd = new Date();
    lockEnd.setDate(lockEnd.getDate() + settingsState.leadLockDays);
    const lockEndDate = lockEnd.toISOString().split('T')[0];
    const newLead: Lead = {
      id: '', partnerId: l.partnerId,
      partnerName: partner?.name ?? 'Admin (Direct)',
      companyName: l.companyName, contactName: l.contactName,
      email: l.email, phone: l.phone, whatsapp: l.whatsapp,
      status: 'Locked', submittedDate: today, lockEndDate,
      notes: l.notes, productId: l.productId, productName: l.productName,
      planType: l.planType,
    };
    leadsHook.insertRow(newLead);
    if (partner) {
      notificationsHook.insertRow({
        id: '', userId: partner.id,
        title: 'New Lead Assigned',
        message: `A new lead for "${l.companyName}" has been created by admin and assigned to you.`,
        type: 'lead', date: today, read: false,
      });
    }
  }, [partners, settingsState.leadLockDays, leadsHook, notificationsHook]);

  const addLead: AppContextValue['addLead'] = useCallback((l) => {
    const now = new Date();
    const existing = leads.find(
      ld => ld.companyName.toLowerCase() === l.companyName.toLowerCase() &&
        ld.partnerId !== l.partnerId &&
        new Date(ld.lockEndDate) > now
    );
    if (existing) return false;
    const partner = partners.find(p => p.id === l.partnerId);
    const today = new Date().toISOString().split('T')[0];
    const lockEnd = new Date();
    lockEnd.setDate(lockEnd.getDate() + settingsState.leadLockDays);
    const lockEndDate = lockEnd.toISOString().split('T')[0];
    const newLead: Lead = {
      ...l, id: '',
      status: 'Pending Approval', submittedDate: today, lockEndDate,
      partnerName: partner?.name ?? 'Unknown',
    };
    leadsHook.insertRow(newLead);
    return true;
  }, [leads, partners, settingsState.leadLockDays, leadsHook]);

  // ===== CUSTOMERS =====
  const addCustomer: AppContextValue['addCustomer'] = useCallback((c) => {
    const start = new Date(c.startDate);
    const now = new Date();
    const monthsElapsed = c.planType === 'Yearly'
      ? 1
      : Math.max(0, (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth()));
    const remainingMonths = c.planType === 'Yearly' ? 0 : Math.max(0, 12 - monthsElapsed);
    const commissionEndDate = new Date(start.getFullYear() + 1, start.getMonth(), start.getDate()).toISOString().split('T')[0];
    const newCustomer: Customer = {
      ...c, id: '',
      commissionEarned: 0, commissionEndDate, monthsElapsed, remainingMonths,
    };
    const existing = customers.find(cu => cu.email === c.email);
    if (existing) {
      customersHook.updateRow(existing.id, { ...c, commissionEndDate, monthsElapsed, remainingMonths });
    } else {
      customersHook.insertRow(newCustomer);
    }
  }, [customers, customersHook]);

  const deleteCustomer: AppContextValue['deleteCustomer'] = useCallback((id) => {
    customersHook.deleteRow(id);
    customerPayments.filter(p => p.customerId === id).forEach(p => customerPaymentsHook.deleteRow(p.id));
  }, [customersHook, customerPaymentsHook, customerPayments]);

  const addCustomerPayment: AppContextValue['addCustomerPayment'] = useCallback(async (p) => {
    await customerPaymentsHook.insertRow({ ...p, id: '' });
  }, [customerPaymentsHook]);

  const deleteCustomerPayment: AppContextValue['deleteCustomerPayment'] = useCallback((id) => {
    customerPaymentsHook.deleteRow(id);
  }, [customerPaymentsHook]);

  // ===== ANNOUNCEMENTS =====
  const addAnnouncement: AppContextValue['addAnnouncement'] = useCallback(async (a) => {
    const author = currentUser?.name ?? 'Admin';
    const authorRole = currentUser?.role === 'admin' ? 'Admin' : (currentUser?.employeeRole ?? 'Employee');
    const newAnn = {
      title: a.title,
      content: a.content,
      type: a.type,
      date: new Date().toISOString().split('T')[0],
      author,
      authorRole,
      isPinned: false,
    };
    try {
      await announcementsHook.insertRow(newAnn as Announcement);
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to create announcement' };
    }
    return { success: true };
  }, [currentUser, announcementsHook]);

  const deleteAnnouncement: AppContextValue['deleteAnnouncement'] = useCallback((id) => {
    announcementsHook.deleteRow(id);
  }, [announcementsHook]);

  // ===== NOTIFICATIONS =====
  const markNotificationRead = useCallback((id: string) => {
    notificationsHook.updateRow(id, { read: true });
  }, [notificationsHook]);

  const markAllRead = useCallback(() => {
    notifications.filter(n => !n.read).forEach(n => notificationsHook.updateRow(n.id, { read: true }));
  }, [notifications, notificationsHook]);

  // ===== SETTINGS =====
  const updateSettings = useCallback((s: Partial<AppSettings>) => {
    setSettingsState(prev => ({ ...prev, ...s }));
  }, []);

  const updateSiteContent = useCallback((s: Partial<SiteContent>) => {
    setSiteContent(prev => ({ ...prev, ...s }));
  }, [setSiteContent]);

  const resetSiteContent = useCallback(() => {
    setSiteContent(defaultSiteContent);
  }, [setSiteContent]);

  // ===== BULK OPERATIONS =====
  const clearDemoData = useCallback(() => {
    customersHook.replaceAll([]);
    leadsHook.replaceAll([]);
    transactionsHook.replaceAll([]);
    notificationsHook.replaceAll([]);
    announcementsHook.replaceAll([]);
  }, [customersHook, leadsHook, transactionsHook, notificationsHook, announcementsHook]);

  const resetAllData = useCallback(() => {
    partnersHook.replaceAll([]);
    customersHook.replaceAll([]);
    leadsHook.replaceAll([]);
    employeesHook.replaceAll([]);
    categoriesHook.replaceAll([]);
    announcementsHook.replaceAll([]);
    notificationsHook.replaceAll([]);
    plansHook.replaceAll([]);
    productsHook.replaceAll([]);
    transactionsHook.replaceAll([]);
    chatThreadsHook.replaceAll([]);
    chatMessagesHook.replaceAll([]);
    setSettingsState(defaultAppSettings);
    setSiteContent(defaultSiteContent);
  }, [partnersHook, customersHook, leadsHook, employeesHook, categoriesHook, announcementsHook, notificationsHook, plansHook, productsHook, transactionsHook, chatThreadsHook, chatMessagesHook, setSiteContent]);

  // ===== PROFILE =====
  const updateUserProfile = useCallback((updates: ProfileUpdate) => {
    setCurrentUser(prev => {
      if (!prev) return prev;
      return { ...prev, name: updates.name, email: updates.email, phone: updates.phone, whatsapp: updates.whatsapp, company: updates.company };
    });
    if (currentUser?.partnerId) {
      partnersHook.updateRow(currentUser.partnerId, {
        name: updates.name, email: updates.email, phone: updates.phone, company: updates.company ?? '',
      });
    }
    const emp = employees.find(e => e.email === currentUser?.email);
    if (emp) {
      employeesHook.updateRow(emp.id, { name: updates.name, email: updates.email });
    }
    if (currentUser) {
      updateAppUserInDb(currentUser.id, {
        name: updates.name, email: updates.email, phone: updates.phone, whatsapp: updates.whatsapp, company: updates.company,
      });
    }
  }, [currentUser, setCurrentUser, partnersHook, employeesHook, employees, updateAppUserInDb]);

  const updateUserPassword = useCallback((updates: PasswordUpdate): { success: boolean; error?: string } => {
    if (!currentUser) return { success: false, error: 'Not logged in' };
    const storedPassword = userPasswords[currentUser.id];
    if (storedPassword !== undefined && storedPassword !== '' && storedPassword !== updates.currentPassword) {
      return { success: false, error: 'Current password is incorrect' };
    }
    if (updates.newPassword.length < 6) {
      return { success: false, error: 'New password must be at least 6 characters' };
    }
    if (updates.newPassword === updates.currentPassword) {
      return { success: false, error: 'New password must be different from current password' };
    }
    setUserPasswords(prev => ({ ...prev, [currentUser.id]: updates.newPassword }));
    updateAppUserInDb(currentUser.id, { password: updates.newPassword });
    return { success: true };
  }, [currentUser, userPasswords, setUserPasswords, updateAppUserInDb]);

  // ===== CHAT =====
  const startChatThread = useCallback((subject: string): string => {
    if (!currentUser || !currentUser.partnerId) return '';
    const threadId = crypto.randomUUID();
    const now = new Date().toISOString();
    const partner = partners.find(p => p.id === currentUser.partnerId);
    const newThread: ChatThread = {
      id: threadId, partnerId: currentUser.partnerId,
      partnerName: currentUser.name, partnerCompany: partner?.company ?? '',
      subject, status: 'open', createdAt: now, lastMessageAt: now,
      unreadByPartner: 0, unreadBySupport: 0,
    };
    chatThreadsHook.insertRow(newThread);
    return threadId;
  }, [currentUser, partners, chatThreadsHook]);

  const sendChatMessage = useCallback((threadId: string, text: string, fromSupport = false) => {
    if (!currentUser) return;
    const now = new Date().toISOString();
    const msg: ChatMessage = {
      id: '', threadId,
      senderType: fromSupport ? 'support' : 'partner',
      senderName: currentUser.name, text, timestamp: now, read: false,
    };
    chatMessagesHook.insertRow(msg);
    const thread = chatThreads.find(t => t.id === threadId);
    if (thread) {
      chatThreadsHook.updateRow(threadId, {
        lastMessageAt: now,
        unreadByPartner: fromSupport ? thread.unreadByPartner + 1 : thread.unreadByPartner,
        unreadBySupport: !fromSupport ? thread.unreadBySupport + 1 : thread.unreadBySupport,
      });
    }
  }, [currentUser, chatThreads, chatMessagesHook, chatThreadsHook]);

  const markThreadReadByPartner = useCallback((threadId: string) => {
    chatThreadsHook.updateRow(threadId, { unreadByPartner: 0 });
    chatMessages.filter(m => m.threadId === threadId && m.senderType === 'support')
      .forEach(m => chatMessagesHook.updateRow(m.id, { read: true }));
  }, [chatThreads, chatMessages, chatThreadsHook, chatMessagesHook]);

  const markThreadReadBySupport = useCallback((threadId: string) => {
    chatThreadsHook.updateRow(threadId, { unreadBySupport: 0 });
    chatMessages.filter(m => m.threadId === threadId && m.senderType === 'partner')
      .forEach(m => chatMessagesHook.updateRow(m.id, { read: true }));
  }, [chatThreads, chatMessages, chatThreadsHook, chatMessagesHook]);

  const closeChatThread = useCallback((threadId: string) => {
    chatThreadsHook.updateRow(threadId, { status: 'closed' });
  }, [chatThreadsHook]);

  const reopenChatThread = useCallback((threadId: string) => {
    chatThreadsHook.updateRow(threadId, { status: 'open' });
  }, [chatThreadsHook]);

  const totalUnreadChatBySupport = chatThreads.reduce((s, t) => s + t.unreadBySupport, 0);

  return (
    <AppContext.Provider value={{
      currentUser, login, loginOtp, logout, dataLoaded: dataLoaded && usersLoaded && allCollectionsLoaded,
      partners, customers, leads, employees, categories, announcements, notifications, plans, products,
      settings: settingsState, siteContent, transactions, customerPayments, roles, popups,
      hasPermission, getEmployeePermissions, addRole, updateRole, deleteRole, assignEmployeeRole,
      addPartner, updatePartner, deletePartner, addEmployee, updateEmployee, deleteEmployee, addCategory, deleteCategory, addPlan, updatePlan, deletePlan, addPopup, updatePopup, deletePopup, addProduct, updateProduct, deleteProduct, addAnnouncement, deleteAnnouncement, addLead, adminAddLead, deleteLead, updateLeadStatus, approveLead, updateLeadPayment, convertLead, addCustomer, deleteCustomer, addCustomerPayment, deleteCustomerPayment,
      markNotificationRead, markAllRead,
      readAnnouncementIds, dismissedAnnouncementIds, dismissedNotificationIds,
      setReadAnnouncementIds, setDismissedAnnouncementIds, setDismissedNotificationIds,
      updateSettings, updateSiteContent, resetSiteContent,
      clearDemoData, resetAllData, updateUserProfile, updateUserPassword, partnerUsers,
      partnerPasswords: Object.fromEntries(partnerUsers.map(u => [u.partnerId ?? '', userPasswords[u.id] ?? ''])),
      chatThreads, chatMessages, startChatThread, sendChatMessage, markThreadReadByPartner, markThreadReadBySupport, closeChatThread, reopenChatThread, totalUnreadChatBySupport,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
