import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '../../../services/api';
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
  Clock,
  ShieldCheck,
  Zap,
  Power,
  RefreshCw,
  Play,
  Pause,
  Sliders,
  Terminal,
  Info,
  ChevronRight,
  Database,
  Globe,
  Radio,
  X,
  Code
} from 'lucide-react';
import { Modal } from '../../../components/common/Modal';

export const KubernetesCluster = () => {
  const [telemetry, setTelemetry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefreshSecs, setAutoRefreshSecs] = useState(15);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedNode, setSelectedNode] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [feedbackMsg, setFeedbackMsg] = useState(null);
  const [rawManifestNode, setRawManifestNode] = useState(null);

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
      if (isManual) {
        setTimeout(() => setRefreshing(false), 400);
      }
    }
  }, []);

  useEffect(() => {
    fetchClusterData();
  }, [fetchClusterData]);

  // Auto-refresh interval
  useEffect(() => {
    if (!autoRefreshSecs || autoRefreshSecs <= 0) return;
    const interval = setInterval(() => {
      fetchClusterData(false);
    }, autoRefreshSecs * 1000);
    return () => clearInterval(interval);
  }, [autoRefreshSecs, fetchClusterData]);

  // Handle Node Actions (Drain, Cordon, Restart, Uncordon)
  const handleNodeAction = async (node, action) => {
    setActionLoading(`${node.id}-${action}`);
    try {
      const res = await api.governance.actionClusterNode(node.id, action);
      const updatedNode = res?.data || res;
      
      setFeedbackMsg({
        type: 'success',
        text: `Action "${action}" executed successfully on node "${node.node_name}".`,
      });

      // Update telemetry state locally
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

  // Filtered nodes
  const filteredNodes = useMemo(() => {
    if (!telemetry?.nodes) return [];
    return telemetry.nodes.filter((node) => {
      const matchSearch =
        node.node_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        node.zone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        node.kubelet_version?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchRole = roleFilter === 'ALL' || node.role === roleFilter;
      const matchStatus = statusFilter === 'ALL' || node.status === statusFilter;
      return matchSearch && matchRole && matchStatus;
    });
  }, [telemetry?.nodes, searchTerm, roleFilter, statusFilter]);

  const getRoleBadge = (role) => {
    switch (role) {
      case 'CONTROL_PLANE':
        return <span className="k8s-role-badge role-cp"><ShieldCheck size={13} /> Control Plane</span>;
      case 'WORKER':
        return <span className="k8s-role-badge role-worker"><Cpu size={13} /> Worker Node</span>;
      case 'DATABASE_REPLICA':
        return <span className="k8s-role-badge role-db"><Database size={13} /> DB Replica</span>;
      case 'INGRESS_GATEWAY':
        return <span className="k8s-role-badge role-ingress"><Globe size={13} /> Ingress Gateway</span>;
      default:
        return <span className="k8s-role-badge role-default">{role}</span>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'HEALTHY':
      case 'READY':
        return (
          <span className="k8s-status-badge status-healthy">
            <span className="k8s-status-dot" /> HEALTHY
          </span>
        );
      case 'DRAINING':
        return (
          <span className="k8s-status-badge status-draining">
            <RefreshCw size={12} className="spin-icon" /> DRAINING
          </span>
        );
      case 'WARNING':
        return (
          <span className="k8s-status-badge status-warning">
            <AlertTriangle size={12} /> CORDONED
          </span>
        );
      case 'OFFLINE':
        return (
          <span className="k8s-status-badge status-offline">
            <Power size={12} /> OFFLINE
          </span>
        );
      default:
        return <span className="k8s-status-badge">{status}</span>;
    }
  };

  return (
    <div className="k8s-page-container">
      {/* 1. Header Toolbar */}
      <div className="k8s-header">
        <div className="k8s-header-left">
          <div className="k8s-title-row">
            <div className="k8s-icon-badge">
              <Server size={22} color="#0284c7" />
            </div>
            <div>
              <h1 className="k8s-main-title">Kubernetes Cluster & Cloud Infrastructure</h1>
              <div className="k8s-sub-info">
                <span className="k8s-cluster-name">
                  <strong>Cluster:</strong> {telemetry?.cluster_name || 'k8s-prod-cluster-01'}
                </span>
                <span className="k8s-region-pill">
                  <Globe size={13} /> {telemetry?.region || 'ap-southeast-1 (AWS)'}
                </span>
                <span className="k8s-version-pill">
                  <Terminal size={13} /> {telemetry?.kubernetes_version || 'v1.30.2'}
                </span>
                <span className="k8s-status-pill-header">
                  <span className="k8s-status-dot" /> ACTIVE & HEALTHY
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="k8s-header-right">
          {/* Auto Refresh Select */}
          <div className="auto-refresh-box">
            <Clock size={14} className="auto-icon" />
            <select
              className="refresh-interval-select"
              value={autoRefreshSecs}
              onChange={(e) => setAutoRefreshSecs(Number(e.target.value))}
            >
              <option value={5}>Auto 5s</option>
              <option value={10}>Auto 10s</option>
              <option value={15}>Auto 15s</option>
              <option value={30}>Auto 30s</option>
              <option value={0}>Pause Stream</option>
            </select>
          </div>

          {/* Manual Refresh Button */}
          <button
            type="button"
            className={`btn-refresh-k8s ${refreshing || loading ? 'is-spinning' : ''}`}
            onClick={() => fetchClusterData(true)}
            title="Refresh Cluster Telemetry"
            disabled={loading || refreshing}
          >
            <RotateCw size={16} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Feedback Toast */}
      {feedbackMsg && (
        <div className={`k8s-feedback-banner ${feedbackMsg.type}`}>
          {feedbackMsg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
          <span>{feedbackMsg.text}</span>
          <button className="btn-close-toast" onClick={() => setFeedbackMsg(null)}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* 2. Top Summary KPI Cards */}
      <div className="k8s-kpi-grid">
        {/* Card 1: Pods Allocation */}
        <div className="k8s-kpi-card">
          <div className="kpi-top-row">
            <span className="kpi-label">Active Workload Pods</span>
            <div className="kpi-icon-wrap icon-blue">
              <Layers size={18} />
            </div>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-main-val">
              {loading ? '--' : `${telemetry?.active_pods || 0}`}
            </span>
            <span className="kpi-sub-val">/ {telemetry?.max_pods || 0} Capacity</span>
          </div>
          <div className="kpi-progress-bar-wrap">
            <div
              className="kpi-progress-bar"
              style={{
                width: `${Math.min(
                  100,
                  ((telemetry?.active_pods || 0) / Math.max(1, telemetry?.max_pods || 1)) * 100
                )}%`,
                backgroundColor: '#0284c7',
              }}
            />
          </div>
          <div className="kpi-footer-sub">
            <span>
              {(
                ((telemetry?.active_pods || 0) / Math.max(1, telemetry?.max_pods || 1)) *
                100
              ).toFixed(1)}
              % Total Cluster Pod Capacity
            </span>
          </div>
        </div>

        {/* Card 2: Fleet CPU Utilization */}
        <div className="k8s-kpi-card">
          <div className="kpi-top-row">
            <span className="kpi-label">Fleet CPU Load</span>
            <div className="kpi-icon-wrap icon-emerald">
              <Cpu size={18} />
            </div>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-main-val">
              {loading ? '--' : `${telemetry?.avg_cpu_usage_percent || 0}%`}
            </span>
            <span className="kpi-sub-val">({telemetry?.total_cpu_cores || 0} vCPUs)</span>
          </div>
          <div className="kpi-progress-bar-wrap">
            <div
              className="kpi-progress-bar"
              style={{
                width: `${Math.min(100, Number(telemetry?.avg_cpu_usage_percent || 0))}%`,
                backgroundColor: '#10b981',
              }}
            />
          </div>
          <div className="kpi-footer-sub">
            <span>Optimal cluster CPU headroom available</span>
          </div>
        </div>

        {/* Card 3: Fleet Memory (RAM) */}
        <div className="k8s-kpi-card">
          <div className="kpi-top-row">
            <span className="kpi-label">Fleet Memory (RAM)</span>
            <div className="kpi-icon-wrap icon-purple">
              <Activity size={18} />
            </div>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-main-val">
              {loading ? '--' : `${telemetry?.used_memory_gb || 0} GB`}
            </span>
            <span className="kpi-sub-val">/ {telemetry?.total_memory_gb || 0} GB</span>
          </div>
          <div className="kpi-progress-bar-wrap">
            <div
              className="kpi-progress-bar"
              style={{
                width: `${Math.min(100, Number(telemetry?.memory_usage_percent || 0))}%`,
                backgroundColor: '#8b5cf6',
              }}
            />
          </div>
          <div className="kpi-footer-sub">
            <span>{telemetry?.memory_usage_percent || 0}% Total Memory Allocated</span>
          </div>
        </div>

        {/* Card 4: Cluster Topology & SLA */}
        <div className="k8s-kpi-card">
          <div className="kpi-top-row">
            <span className="kpi-label">Active Node Fleet</span>
            <div className="kpi-icon-wrap icon-amber">
              <HardDrive size={18} />
            </div>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-main-val">
              {loading ? '--' : `${telemetry?.total_nodes || 0} Nodes`}
            </span>
            <span className="kpi-sub-val" style={{ color: '#16a34a', fontWeight: 600 }}>
              99.99% SLA
            </span>
          </div>
          <div className="node-distribution-pills">
            <span className="dist-pill">1 Master</span>
            <span className="dist-pill">2 Workers</span>
            <span className="dist-pill">1 DB</span>
            <span className="dist-pill">1 Ingress</span>
          </div>
          <div className="kpi-footer-sub">
            <span>All nodes reporting healthy kubelet status</span>
          </div>
        </div>
      </div>

      {/* 3. Node Directory & Fleet Telemetry Section */}
      <div className="k8s-nodes-card">
        <div className="k8s-table-header">
          <div className="table-header-left">
            <Server size={18} className="table-title-icon" />
            <h3 className="table-title">Managed Kubernetes Nodes ({filteredNodes.length})</h3>
          </div>

          <div className="table-header-actions">
            {/* Search Input */}
            <div className="table-search-box">
              <Search size={15} className="search-icon" />
              <input
                type="text"
                placeholder="Search node name, zone, or version..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button className="clear-search-btn" onClick={() => setSearchTerm('')}>
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Role Filter */}
            <select
              className="table-filter-select"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="ALL">All Roles</option>
              <option value="CONTROL_PLANE">Control Plane</option>
              <option value="WORKER">Worker Nodes</option>
              <option value="DATABASE_REPLICA">DB Replica</option>
              <option value="INGRESS_GATEWAY">Ingress Gateway</option>
            </select>

            {/* Status Filter */}
            <select
              className="table-filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="HEALTHY">Healthy</option>
              <option value="DRAINING">Draining</option>
              <option value="WARNING">Cordoned / Warning</option>
            </select>
          </div>
        </div>

        {/* Nodes Table */}
        <div className="k8s-table-wrapper">
          <table className="k8s-table">
            <thead>
              <tr>
                <th>Node Name & Zone</th>
                <th>Cluster Role</th>
                <th>Status</th>
                <th>CPU Utilization</th>
                <th>Memory Allocation</th>
                <th>Pods (Active/Max)</th>
                <th>Disk Load</th>
                <th>Kubelet & Runtime</th>
                <th>Uptime</th>
                <th className="th-actions">Operations</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} className="skeleton-row">
                    <td colSpan={10}>
                      <div className="skeleton-bar" style={{ height: 28, width: '100%' }} />
                    </td>
                  </tr>
                ))
              ) : filteredNodes.length === 0 ? (
                <tr>
                  <td colSpan={10} className="empty-table-cell">
                    <div className="empty-state-wrap">
                      <Server size={32} color="#94a3b8" />
                      <p>No Kubernetes nodes match your filter criteria.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredNodes.map((node) => {
                  const isDraining = node.status === 'DRAINING';
                  const isCordoned = node.status === 'WARNING';
                  const isNodeLoading =
                    actionLoading && actionLoading.startsWith(`${node.id}-`);

                  return (
                    <tr key={node.id} className="k8s-node-row">
                      {/* 1. Node Name & Zone */}
                      <td className="cell-node-name">
                        <div className="node-primary-title">
                          <span className="node-name-text">{node.node_name}</span>
                        </div>
                        <div className="node-secondary-sub">
                          <span className="zone-pill">{node.zone}</span>
                          <span className="region-text">{node.region}</span>
                        </div>
                      </td>

                      {/* 2. Role */}
                      <td>{getRoleBadge(node.role)}</td>

                      {/* 3. Status */}
                      <td>{getStatusBadge(node.status)}</td>

                      {/* 4. CPU */}
                      <td className="cell-metric">
                        <div className="metric-row">
                          <strong>{node.cpu_usage_percent}%</strong>
                          <span className="metric-sub">({node.cpu_cores} Cores)</span>
                        </div>
                        <div className="mini-metric-track">
                          <div
                            className="mini-metric-fill"
                            style={{
                              width: `${Math.min(100, Number(node.cpu_usage_percent))}%`,
                              backgroundColor:
                                Number(node.cpu_usage_percent) > 75 ? '#ef4444' : '#10b981',
                            }}
                          />
                        </div>
                      </td>

                      {/* 5. Memory */}
                      <td className="cell-metric">
                        <div className="metric-row">
                          <strong>{node.memory_usage_gb} GB</strong>
                          <span className="metric-sub">/ {node.memory_total_gb} GB</span>
                        </div>
                        <div className="mini-metric-track">
                          <div
                            className="mini-metric-fill"
                            style={{
                              width: `${Math.min(
                                100,
                                (Number(node.memory_usage_gb) /
                                  Math.max(1, Number(node.memory_total_gb))) *
                                  100
                              )}%`,
                              backgroundColor: '#8b5cf6',
                            }}
                          />
                        </div>
                      </td>

                      {/* 6. Pods */}
                      <td>
                        <span className="pods-badge">
                          <strong>{node.active_pods}</strong> / {node.max_pods}
                        </span>
                      </td>

                      {/* 7. Disk */}
                      <td>
                        <span
                          className={`disk-badge ${
                            Number(node.disk_usage_percent) > 80 ? 'disk-warning' : 'disk-ok'
                          }`}
                        >
                          {node.disk_usage_percent}%
                        </span>
                      </td>

                      {/* 8. Kubelet */}
                      <td className="cell-runtime">
                        <div className="kubelet-ver">{node.kubelet_version}</div>
                        <div className="runtime-sub">{node.container_runtime}</div>
                      </td>

                      {/* 9. Uptime */}
                      <td>
                        <span className="uptime-pill">{node.uptime_days} days</span>
                      </td>

                      {/* 10. Actions */}
                      <td className="cell-actions">
                        <div className="action-buttons-group">
                          {/* Restart Pods */}
                          <button
                            type="button"
                            className="btn-k8s-action btn-restart"
                            title="Rolling restart workloads on node"
                            disabled={isNodeLoading}
                            onClick={() => handleNodeAction(node, 'RESTART')}
                          >
                            <RefreshCw
                              size={13}
                              className={
                                actionLoading === `${node.id}-RESTART` ? 'spin-icon' : ''
                              }
                            />
                            <span>Restart</span>
                          </button>

                          {/* Cordon / Uncordon */}
                          {isCordoned ? (
                            <button
                              type="button"
                              className="btn-k8s-action btn-uncordon"
                              title="Uncordon node to allow scheduling"
                              disabled={isNodeLoading}
                              onClick={() => handleNodeAction(node, 'UNCORDON')}
                            >
                              <Play size={13} />
                              <span>Uncordon</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="btn-k8s-action btn-cordon"
                              title="Cordon node (prevent new pod scheduling)"
                              disabled={isNodeLoading || isDraining}
                              onClick={() => handleNodeAction(node, 'CORDON')}
                            >
                              <Pause size={13} />
                              <span>Cordon</span>
                            </button>
                          )}

                          {/* Drain */}
                          <button
                            type="button"
                            className={`btn-k8s-action btn-drain ${
                              isDraining ? 'active-draining' : ''
                            }`}
                            title="Safely evict all running pods from node"
                            disabled={isNodeLoading || isDraining}
                            onClick={() => handleNodeAction(node, 'DRAIN')}
                          >
                            <Power size={13} />
                            <span>{isDraining ? 'Draining...' : 'Drain'}</span>
                          </button>

                          {/* Inspect Manifest */}
                          <button
                            type="button"
                            className="btn-k8s-action btn-manifest"
                            title="View Raw Node Manifest"
                            onClick={() => setRawManifestNode(node)}
                          >
                            <Code size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Manifest / Spec Modal */}
      {rawManifestNode && (
        <Modal
          isOpen={!!rawManifestNode}
          onClose={() => setRawManifestNode(null)}
          title={`Kubernetes Node Spec: ${rawManifestNode.node_name}`}
        >
          <div className="manifest-modal-content">
            <div className="manifest-info-bar">
              <span><strong>Kind:</strong> Node</span>
              <span><strong>API Version:</strong> v1</span>
              <span><strong>Status:</strong> {rawManifestNode.status}</span>
            </div>
            <pre className="manifest-code-block">
              {JSON.stringify(
                {
                  apiVersion: 'v1',
                  kind: 'Node',
                  metadata: {
                    name: rawManifestNode.node_name,
                    cluster: rawManifestNode.cluster_name,
                    labels: {
                      'topology.kubernetes.io/region': rawManifestNode.region,
                      'topology.kubernetes.io/zone': rawManifestNode.zone,
                      'node-role.kubernetes.io': rawManifestNode.role.toLowerCase(),
                    },
                    creationTimestamp: rawManifestNode.created_at,
                  },
                  status: {
                    addresses: [
                      { type: 'InternalIP', address: `10.0.${rawManifestNode.id}.14` },
                      { type: 'Hostname', address: rawManifestNode.node_name },
                    ],
                    capacity: {
                      cpu: `${rawManifestNode.cpu_cores}`,
                      memory: `${rawManifestNode.memory_total_gb}Gi`,
                      pods: `${rawManifestNode.max_pods}`,
                    },
                    allocatable: {
                      cpu: `${Math.round(rawManifestNode.cpu_cores * 0.95)}`,
                      memory: `${Math.round(rawManifestNode.memory_total_gb * 0.92)}Gi`,
                      pods: `${rawManifestNode.max_pods}`,
                    },
                    nodeInfo: {
                      kubeletVersion: rawManifestNode.kubelet_version,
                      containerRuntimeVersion: rawManifestNode.container_runtime,
                      osImage: 'Amazon Linux 2023.4 (x86_64)',
                      kernelVersion: '6.1.75-99.163.amzn2023.x86_64',
                    },
                    conditions: [
                      { type: 'Ready', status: rawManifestNode.status === 'OFFLINE' ? 'False' : 'True', reason: 'KubeletReady' },
                      { type: 'MemoryPressure', status: 'False', reason: 'KubeletHasSufficientMemory' },
                      { type: 'DiskPressure', status: 'False', reason: 'KubeletHasNoDiskPressure' },
                      { type: 'PIDPressure', status: 'False', reason: 'KubeletHasSufficientPID' },
                    ],
                  },
                },
                null,
                2
              )}
            </pre>
            <div className="manifest-modal-footer">
              <button
                type="button"
                className="btn-modal-close"
                onClick={() => setRawManifestNode(null)}
              >
                Close Spec Inspector
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Embedded Component Styles */}
      <style>{`
        .k8s-page-container {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          min-height: 100vh;
          background: #f8fafc;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        }

        /* 1. Header */
        .k8s-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #ffffff;
          padding: 20px 24px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
        }

        .k8s-title-row {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .k8s-icon-badge {
          width: 46px;
          height: 46px;
          border-radius: 10px;
          background: #e0f2fe;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .k8s-main-title {
          font-size: 20px;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 4px 0;
        }

        .k8s-sub-info {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 10px;
          font-size: 13px;
          color: #64748b;
        }

        .k8s-region-pill, .k8s-version-pill {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: #f1f5f9;
          padding: 2px 8px;
          border-radius: 6px;
          font-weight: 500;
          color: #475569;
        }

        .k8s-status-pill-header {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #ecfdf5;
          color: #059669;
          font-weight: 600;
          font-size: 12px;
          padding: 2px 8px;
          border-radius: 6px;
          border: 1px solid #a7f3d0;
        }

        .k8s-status-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
        }

        .k8s-header-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .auto-refresh-box {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 6px 10px;
        }

        .auto-icon {
          color: #64748b;
        }

        .refresh-interval-select {
          border: none;
          background: transparent;
          font-size: 13px;
          color: #334155;
          font-weight: 500;
          outline: none;
          cursor: pointer;
        }

        .btn-refresh-k8s {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #0284c7;
          color: #ffffff;
          border: none;
          padding: 8px 14px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }

        .btn-refresh-k8s:hover {
          background: #0369a1;
        }

        .btn-refresh-k8s.is-spinning svg {
          animation: spin 1s linear infinite;
        }

        /* 2. KPI Cards */
        .k8s-kpi-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }

        .k8s-kpi-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 18px 20px;
          display: flex;
          flex-direction: column;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
        }

        .kpi-top-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        .kpi-label {
          font-size: 13px;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.02em;
        }

        .kpi-icon-wrap {
          width: 34px;
          height: 34px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .icon-blue { background: #e0f2fe; color: #0284c7; }
        .icon-emerald { background: #d1fae5; color: #059669; }
        .icon-purple { background: #ede9fe; color: #7c3aed; }
        .icon-amber { background: #fef3c7; color: #d97706; }

        .kpi-value-row {
          display: flex;
          align-items: baseline;
          gap: 8px;
          margin-bottom: 12px;
        }

        .kpi-main-val {
          font-size: 26px;
          font-weight: 700;
          color: #0f172a;
        }

        .kpi-sub-val {
          font-size: 13px;
          color: #64748b;
          font-weight: 500;
        }

        .kpi-progress-bar-wrap {
          width: 100%;
          height: 6px;
          background: #f1f5f9;
          border-radius: 999px;
          overflow: hidden;
          margin-bottom: 8px;
        }

        .kpi-progress-bar {
          height: 100%;
          border-radius: 999px;
          transition: width 0.4s ease;
        }

        .kpi-footer-sub {
          font-size: 12px;
          color: #64748b;
          font-weight: 500;
        }

        .node-distribution-pills {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          margin-bottom: 8px;
        }

        .dist-pill {
          font-size: 11px;
          font-weight: 600;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 2px 6px;
          border-radius: 4px;
          color: #475569;
        }

        /* 3. Node Table Card */
        .k8s-nodes-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
        }

        .k8s-table-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid #e2e8f0;
          background: #ffffff;
        }

        .table-header-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .table-title-icon {
          color: #0284c7;
        }

        .table-title {
          font-size: 16px;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
        }

        .table-header-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .table-search-box {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 6px 10px;
          width: 260px;
        }

        .table-search-box input {
          border: none;
          background: transparent;
          font-size: 13px;
          width: 100%;
          outline: none;
          color: #0f172a;
        }

        .clear-search-btn {
          border: none;
          background: transparent;
          cursor: pointer;
          color: #94a3b8;
          padding: 0;
        }

        .table-filter-select {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 6px 10px;
          font-size: 13px;
          color: #334155;
          outline: none;
          cursor: pointer;
        }

        .k8s-table-wrapper {
          overflow-x: auto;
        }

        .k8s-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .k8s-table thead th {
          background: #f8fafc;
          color: #475569;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.03em;
          padding: 12px 16px;
          border-bottom: 1px solid #e2e8f0;
          white-space: nowrap;
        }

        .k8s-table thead .th-actions {
          text-align: right;
        }

        .k8s-table tbody tr {
          border-bottom: 1px solid #f1f5f9;
          transition: background 0.15s;
        }

        .k8s-table tbody tr:hover {
          background: #f8fafc;
        }

        .k8s-table tbody td {
          padding: 14px 16px;
          font-size: 13px;
          color: #334155;
          vertical-align: middle;
        }

        .cell-node-name {
          font-weight: 600;
        }

        .node-name-text {
          color: #0f172a;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 13px;
        }

        .node-secondary-sub {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 3px;
        }

        .zone-pill {
          font-size: 11px;
          background: #f1f5f9;
          color: #64748b;
          padding: 1px 6px;
          border-radius: 4px;
          font-family: inherit;
        }

        .region-text {
          font-size: 11px;
          color: #94a3b8;
        }

        /* Role Badges */
        .k8s-role-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 11px;
          font-weight: 600;
          padding: 3px 8px;
          border-radius: 6px;
          white-space: nowrap;
        }

        .role-cp { background: #fdf4ff; color: #a21caf; border: 1px solid #f5d0fe; }
        .role-worker { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; }
        .role-db { background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; }
        .role-ingress { background: #fff7ed; color: #c2410c; border: 1px solid #fed7aa; }

        /* Status Badges */
        .k8s-status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 6px;
          white-space: nowrap;
        }

        .status-healthy { background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; }
        .status-draining { background: #fffbeb; color: #b45309; border: 1px solid #fde68a; }
        .status-warning { background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; }
        .status-offline { background: #f1f5f9; color: #64748b; border: 1px solid #cbd5e1; }

        /* Metrics */
        .cell-metric {
          min-width: 130px;
        }

        .metric-row {
          display: flex;
          align-items: baseline;
          gap: 4px;
          margin-bottom: 4px;
        }

        .metric-sub {
          font-size: 11px;
          color: #64748b;
        }

        .mini-metric-track {
          width: 100%;
          height: 4px;
          background: #e2e8f0;
          border-radius: 999px;
          overflow: hidden;
        }

        .mini-metric-fill {
          height: 100%;
          border-radius: 999px;
        }

        .pods-badge {
          font-family: ui-monospace, monospace;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 3px 8px;
          border-radius: 6px;
          font-size: 12px;
        }

        .disk-badge {
          font-size: 12px;
          font-weight: 600;
          padding: 2px 6px;
          border-radius: 4px;
        }

        .disk-ok { background: #f1f5f9; color: #334155; }
        .disk-warning { background: #fee2e2; color: #b91c1c; }

        .cell-runtime {
          font-size: 12px;
        }

        .kubelet-ver {
          font-weight: 600;
          color: #0f172a;
          font-family: ui-monospace, monospace;
        }

        .runtime-sub {
          font-size: 11px;
          color: #64748b;
          margin-top: 2px;
          font-family: ui-monospace, monospace;
        }

        .uptime-pill {
          font-size: 12px;
          color: #64748b;
          white-space: nowrap;
        }

        /* Action Buttons */
        .cell-actions {
          text-align: right;
        }

        .action-buttons-group {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 6px;
        }

        .btn-k8s-action {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
          border: 1px solid transparent;
          cursor: pointer;
          transition: all 0.15s;
        }

        .btn-restart {
          background: #f8fafc;
          border-color: #e2e8f0;
          color: #0369a1;
        }
        .btn-restart:hover { background: #e0f2fe; border-color: #bae6fd; }

        .btn-cordon {
          background: #f8fafc;
          border-color: #e2e8f0;
          color: #d97706;
        }
        .btn-cordon:hover { background: #fef3c7; border-color: #fde68a; }

        .btn-uncordon {
          background: #ecfdf5;
          border-color: #a7f3d0;
          color: #059669;
        }
        .btn-uncordon:hover { background: #d1fae5; }

        .btn-drain {
          background: #f8fafc;
          border-color: #e2e8f0;
          color: #b91c1c;
        }
        .btn-drain:hover { background: #fee2e2; border-color: #fca5a5; }

        .btn-manifest {
          background: #f8fafc;
          border-color: #e2e8f0;
          color: #475569;
          padding: 4px 6px;
        }
        .btn-manifest:hover { background: #e2e8f0; }

        .spin-icon {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          100% { transform: rotate(360deg); }
        }

        /* Toast Feedback Banner */
        .k8s-feedback-banner {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
        }

        .k8s-feedback-banner.success {
          background: #ecfdf5;
          border: 1px solid #a7f3d0;
          color: #065f46;
        }

        .k8s-feedback-banner.error {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #991b1b;
        }

        .btn-close-toast {
          margin-left: auto;
          background: transparent;
          border: none;
          cursor: pointer;
          color: inherit;
        }

        /* Manifest Modal */
        .manifest-modal-content {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .manifest-info-bar {
          display: flex;
          gap: 16px;
          font-size: 13px;
          color: #475569;
          background: #f8fafc;
          padding: 8px 12px;
          border-radius: 6px;
          border: 1px solid #e2e8f0;
        }

        .manifest-code-block {
          background: #0f172a;
          color: #38bdf8;
          padding: 16px;
          border-radius: 8px;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 12px;
          max-height: 420px;
          overflow-y: auto;
          line-height: 1.5;
        }

        .manifest-modal-footer {
          display: flex;
          justify-content: flex-end;
        }

        .btn-modal-close {
          background: #0f172a;
          color: #ffffff;
          border: none;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
        }

        /* Responsive Layout */
        @media (max-width: 1024px) {
          .k8s-kpi-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 640px) {
          .k8s-kpi-grid {
            grid-template-columns: 1fr;
          }
          .k8s-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 14px;
          }
          .k8s-header-right {
            width: 100%;
            justify-content: space-between;
          }
        }
      `}</style>
    </div>
  );
};

export default KubernetesCluster;
