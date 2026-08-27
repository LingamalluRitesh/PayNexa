import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

export type PortalType = 'consumer' | 'merchant' | 'admin' | 'checkout' | 'docs';

export interface NotificationItem {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: string;
}

interface AppContextType {
  activePortal: PortalType;
  setActivePortal: (portal: PortalType) => void;
  currentUser: any;
  setCurrentUser: (user: any) => void;
  accounts: any[];
  cards: any[];
  paymentIntents: any[];
  disputes: any[];
  fraudAssessments: any[];
  webhookLogs: any[];
  isConnected: boolean;
  notifications: NotificationItem[];
  dismissNotification: (id: string) => void;
  addNotification: (notification: Omit<NotificationItem, 'id' | 'timestamp'>) => void;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activePortal, setActivePortal] = useState<PortalType>('merchant');
  const [currentUser, setCurrentUser] = useState<any>({
    id: 'usr_alex_chen',
    name: 'Alex Chen',
    email: 'alex.chen@acmecommerce.io',
    role: 'MERCHANT_OWNER',
    merchantId: 'merch_demo_1',
    kycStatus: 'VERIFIED',
  });

  const [accounts, setAccounts] = useState<any[]>([]);
  const [cards, setCards] = useState<any[]>([]);
  const [paymentIntents, setPaymentIntents] = useState<any[]>([]);
  const [disputes, setDisputes] = useState<any[]>([]);
  const [fraudAssessments, setFraudAssessments] = useState<any[]>([]);
  const [webhookLogs, setWebhookLogs] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const addNotification = useCallback((n: Omit<NotificationItem, 'id' | 'timestamp'>) => {
    const item: NotificationItem = {
      ...n,
      id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
    };
    setNotifications((prev) => [item, ...prev.slice(0, 5)]);

    // Auto dismiss after 6 seconds
    setTimeout(() => {
      setNotifications((prev) => prev.filter((x) => x.id !== item.id));
    }, 6000);
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const refreshData = useCallback(async () => {
    try {
      const [accs, crds, intents, disps, assessments, logs] = await Promise.all([
        api.getAccounts().catch(() => []),
        api.getCards().catch(() => []),
        api.getIntents().catch(() => []),
        api.getDisputes().catch(() => []),
        api.getFraudAssessments().catch(() => []),
        api.getWebhookLogs().catch(() => []),
      ]);

      setAccounts(accs);
      setCards(crds);
      setPaymentIntents(intents);
      setDisputes(disps);
      setFraudAssessments(assessments);
      setWebhookLogs(logs);
    } catch (err) {
      console.error('Error refreshing app state:', err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Real-time WebSocket connection
  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimer: NodeJS.Timeout | null = null;

    const connectWs = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;

      try {
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          setIsConnected(true);
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.event === 'PAYMENT_CAPTURED') {
              addNotification({
                type: 'success',
                title: 'Payment Succeeded',
                message: `Payment of $${((data.data?.amountCents || 0) / 100).toFixed(2)} was processed cleanly.`,
              });
              refreshData();
            } else if (data.event === 'FRAUD_ALERT') {
              addNotification({
                type: 'warning',
                title: 'High Risk Alert',
                message: `Transaction flagged with risk score ${data.data?.totalRiskScore}/100.`,
              });
              refreshData();
            }
          } catch {
            // ignore non-json
          }
        };

        ws.onclose = () => {
          setIsConnected(false);
          reconnectTimer = setTimeout(connectWs, 3000);
        };

        ws.onerror = () => {
          setIsConnected(false);
        };
      } catch {
        setIsConnected(false);
      }
    };

    connectWs();

    return () => {
      if (ws) ws.close();
      if (reconnectTimer) clearTimeout(reconnectTimer);
    };
  }, [addNotification, refreshData]);

  return (
    <AppContext.Provider
      value={{
        activePortal,
        setActivePortal,
        currentUser,
        setCurrentUser,
        accounts,
        cards,
        paymentIntents,
        disputes,
        fraudAssessments,
        webhookLogs,
        isConnected,
        notifications,
        dismissNotification,
        addNotification,
        refreshData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
