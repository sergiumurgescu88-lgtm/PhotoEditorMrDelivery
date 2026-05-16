import { useState, useEffect } from 'react';
import { pb } from '../lib/pocketbase';

export function useAdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    pb.collection('users').getList(1, 100).then(r => { setUsers(r.items); setLoading(false); });
  }, []);

  const updateUser = async (id: string, updates: any) => {
    await pb.collection('users').update(id, updates);
    setUsers(users.map(u => u.id === id ? { ...u, ...updates } : u));
  };

  return { users, loading, updateUser };
}
