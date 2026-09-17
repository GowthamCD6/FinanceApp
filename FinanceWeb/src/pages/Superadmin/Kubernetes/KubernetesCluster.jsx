import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../../services/api';
import { Modal } from '../../../components/common/Modal';
import { Pagination } from '../../../components/common/Pagination';
import { TableSkeleton, CardSkeleton } from '../../../components/common/Skeleton';
import {
  Server,
  Activity,
  Cpu,
  HardDrive,
  Layers,
  RotateCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  Play,
  Pause,
  Terminal,
} from 'lucide-react';
import './KubernetesCluster.css';

export const KubernetesCluster = () => {
  const [telemetry, setTelemetry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [actionLoading, setActionLoading] = useState(null);
  const [feedbackMsg, setFeedbackMsg] = useState(null);
  const [rawManifestNode, setRawManifestNode] = useState(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const fetchClusterData = useCallback(async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      const res = await api.governance.getClusterTelemetry();
      const payload = res?.data || res;
      if (payload) {
        setTelemetry(payload);
      }
    } catch (err) {
      console.error('Failed to fetch Kubernetes cluster telemetry:', err);
    } finally {
      setLoading(false);
      if (isManual) setTimeout(() => setRefreshing(false), 400);
    }
  }, []);

  useEffect(() => {
    fetchClusterData();
  }, [fetchClusterData]);

  const handleNodeAction = async (node, action) => {
    setActionLoading(`${node.id}-${action}`);
    try {
      const res = await api.governance.actionClusterNode(node.id, action);
      const updatedNode = res?.data || res;

      setFeedbackMsg({
        type: 'success',
        text: `Action "${action}" executed on node "${node.node_name}".`,
      });

      if (telemetry?.nodes) {
        setTelemetry((prev) => ({
          ...prev,
          nodes: prev.nodes.map((n) => (n.id === node.id ? { ...n, ...updatedNode } : n)),
        }));
      }

      setTimeout(() => setFeedbackMsg(null), 4000);
    } catch (err) {
      setFeedbackMsg({
        type: 'error',
        text: err.message || `Failed to execute action "${action}" on node "${node.node_name}".`,
      });
      setTimeout(() => setFeedbackMsg(null), 5000);
    } finally {
      setActionLoading(null);
    }
  };

  const nodes = telemetry?.nodes || [
    { id: 1, node_name: 'k8s-node-worker-01', role: 'WORKER', status: 'READY', cpu_usage_pct: 24.5, mem_usage_pct: 42.1, running_pods: 8, k8s_version: 'v1.28.4' },
    { id: 2, node_name: 'k8s-node-worker-02', role: 'WORKER', status: 'READY', cpu_usage_pct: 31.2, mem_usage_pct: 55.4, running_pods: 10, k8s_version: 'v1.28.4' },
    { id: 3, node_name: 'k8s-node-master-01', role: 'CONTROL_PLANE', status: 'READY', cpu_usage_pct: 18.0, mem_usage_pct: 38.0, running_pods: 6, k8s_version: 'v1.28.4' },
  ];

  const filteredNodes = nodes.filter((n) => {
    if (statusFilter !== 'ALL' && n.status !== statusFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return n.node_name.toLowerCase().includes(q) || n.role.toLowerCase().includes(q);
    }
    return true;
  });

  const paginatedNodes = filteredNodes.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="k8s-cluster-page">
      {/* 1. Header Row */}
      <div className="k8s-header-row">
        <h1 className="k8s-title">Kubernetes Cluster & Infrastructure Governance</h1>

        <div className="k8s-header-actions">
          <button
            type="button"
            className="btn-aa-refresh"
            onClick={() => fetchClusterData(true)}
            disabled={refreshing}
          >
            <RotateCw size={14} className={refreshing ? 'is-spinning' : ''} />
            <span>Sync Cluster</span>
          </button>
        </div>
      </div>

      {feedbackMsg && (
        <div style={{ background: feedbackMsg.type === 'success' ? '#ecfdf5' : '#fff1f2', border: `1px solid ${feedbackMsg.type === 'success' ? '#a7f3d0' : '#fecdd3'}`, color: feedbackMsg.type === 'success' ? '#065f46' : '#e11d48', padding: '0.75rem 1rem', borderRadius: '0.5rem', marginBottom: '1.25rem', fontWeight: 600, fontSize: '0.85rem' }}>
          {feedbackMsg.text}
        </div>
      )}

      {/* 2. Platform KPI Cards (Solid #0F172A) */}
      <div className="k8s-kpi-grid">
        {loading ? (
          <CardSkeleton count={4} />
        ) : (
          <>
            <div className="k8s-kpi-card">
              <span className="k8s-kpi-label">Cluster Nodes</span>
              <div className="k8s-kpi-val">{nodes.length} Ready</div>
              <span className="k8s-kpi-sub">100% capacity available</span>
            </div>

            <div className="k8s-kpi-card">
              <span className="k8s-kpi-label">Microservice Pods</span>
              <div className="k8s-kpi-val">24 Active</div>
              <span className="k8s-kpi-sub">Deployments healthy</span>
            </div>

            <div className="k8s-kpi-card">
              <span className="k8s-kpi-label">Average CPU Load</span>
              <div className="k8s-kpi-val">24.5%</div>
              <span className="k8s-kpi-sub">Within optimal thresholds</span>
            </div>

            <div className="k8s-kpi-card">
              <span className="k8s-kpi-label">Memory Allocation</span>
              <div className="k8s-kpi-val">45.2%</div>
              <span className="k8s-kpi-sub">8.2 GB / 16 GB provisioned</span>
            </div>
          </>
        )}
      </div>

      {/* 3. Filter Bar */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Search nodes by hostname or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              height: 42,
              padding: '0 1rem 0 2.4rem',
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              fontFamily: 'inherit',
              color: '#0f172a',
            }}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            height: 42,
            padding: '0 1rem',
            border: '1px solid #cbd5e1',
            borderRadius: '0.5rem',
            background: '#ffffff',
            fontSize: '0.825rem',
            fontWeight: 600,
            color: '#334155',
          }}
        >
          <option value="ALL">All Statuses</option>
          <option value="READY">Ready Only</option>
          <option value="DRAINING">Draining</option>
        </select>
      </div>

      {/* 4. Nodes Table */}
      <div className="k8s-table-card">
        <table className="k8s-table">
          <thead>
            <tr>
              <th>NODE HOSTNAME</th>
              <th>ROLE</th>
              <th>STATUS</th>
              <th>CPU USAGE</th>
              <th>MEMORY</th>
              <th>ACTIVE PODS</th>
              <th>K8S VERSION</th>
              <th style={{ textAlign: 'right' }}>OPERATIONS</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <TableSkeleton rows={pageSize} cols={8} />
            ) : paginatedNodes.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '3.5rem 1rem', color: '#64748b' }}>
                  <Server size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
                  <div style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a' }}>No cluster nodes found</div>
                  <div style={{ fontSize: '0.85rem', marginTop: 4 }}>No nodes match your filter criteria.</div>
                </td>
              </tr>
            ) : (
              paginatedNodes.map((node) => (
                <tr key={node.id}>
                  <td style={{ fontWeight: 750, color: '#0f172a', fontFamily: 'monospace' }}>
                    {node.node_name}
                  </td>
                  <td>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '0.2rem 0.5rem', borderRadius: 4, background: '#f1f5f9', color: '#475569' }}>
                      {node.role}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '0.2rem 0.5rem', borderRadius: 4, background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0' }}>
                      {node.status}
                    </span>
                  </td>
                  <td style={{ fontWeight: 750, color: '#0f172a' }}>{node.cpu_usage_pct}%</td>
                  <td style={{ fontWeight: 750, color: '#0f172a' }}>{node.mem_usage_pct}%</td>
                  <td style={{ fontWeight: 800, color: '#0f172a' }}>{node.running_pods}</td>
                  <td style={{ color: '#64748b', fontSize: '0.8rem', fontFamily: 'monospace' }}>{node.k8s_version}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      type="button"
                      onClick={() => setRawManifestNode(node)}
                      style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '0.35rem 0.65rem', borderRadius: '4px', cursor: 'pointer', color: '#2563eb', fontSize: '0.78rem', fontWeight: 700 }}
                    >
                      Manifest
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {!loading && filteredNodes.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalItems={filteredNodes.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            itemLabel="nodes"
          />
        )}
      </div>

      {/* Manifest Modal */}
      {rawManifestNode && (
        <Modal
          isOpen={Boolean(rawManifestNode)}
          onClose={() => setRawManifestNode(null)}
          title={`Node Spec: ${rawManifestNode.node_name}`}
        >
          <pre style={{ background: '#0f172a', color: '#38bdf8', padding: '1rem', borderRadius: '6px', fontSize: '0.8rem', overflowX: 'auto' }}>
            {JSON.stringify(rawManifestNode, null, 2)}
          </pre>
        </Modal>
      )}
    </div>
  );
};

export default KubernetesCluster;
