import { useState, useEffect } from 'react';
import { pb } from '../lib/pocketbase';

export function useAdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profiles, transactions, logs] = await Promise.all([
          pb.collection('profiles').getList(1, 100),
          pb.collection('credit_transactions').getList(1, 500),
          pb.collection('activity_logs').getList(1, 500)
        ]);
        setData({ profiles: profiles.items, transactions: transactions.items, logs: logs.items });
      } catch (e) { console.error('Dashboard error:', e); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  return { loading, data };
}
