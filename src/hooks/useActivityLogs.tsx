import { useState, useEffect } from 'react';
import { pb } from '../lib/pocketbase';

export function useActivityLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    pb.collection('activity_logs').getList(1, 100, { sort: '-created' }).then(r => { setLogs(r.items); setLoading(false); });
  }, []);

  return { logs, loading };
}
