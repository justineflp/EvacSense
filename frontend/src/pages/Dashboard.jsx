import React, { useEffect, useState } from 'react';
import { NGE_FLOOR_LAYOUTS, NGE_FLOOR_TITLES } from '../ngeFloorLayouts';
import {
  BuildingIcon,
  ChartIcon,
  ClipboardIcon,
  DistressIcon,
  DownloadIcon,
  LocationIcon,
  PlayIcon,
  PrintIcon,
  RefreshIcon,
  ReportIcon,
  StandbyIcon,
  StopIcon,
  WarningIcon
} from '../components/EvacSenseIcons';

export default function Dashboard({ user, token, onLogout }) {
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState('');
  const [actionError, setActionError] = useState('');
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [activeTab, setActiveTab] = useState('occupancy');

  const [activeDrill, setActiveDrill] = useState(null);
  const [roomsOccupancy, setRoomsOccupancy] = useState([]);
  const [floorClearances, setFloorClearances] = useState([]);
  const [totalParticipants, setTotalParticipants] = useState(0);
  const [arrivedCount, setArrivedCount] = useState(0);
  const [unverifiedCount, setUnverifiedCount] = useState(0);
  const [distressCount, setDistressCount] = useState(0);
  const [distressList, setDistressList] = useState([]);

  const [usersList, setUsersList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [loadingGraph, setLoadingGraph] = useState(false);
  const [selectedFloor, setSelectedFloor] = useState(1);

  const [drillsList, setDrillsList] = useState([]);
  const [selectedReportId, setSelectedReportId] = useState('');
  const [reportData, setReportData] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);

  const handleLogoutClick = async () => {
    try {
      await fetch('http://127.0.0.1:5000/api/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Logout request failed:', error);
    }
    onLogout();
  };

  const fetchOccupancy = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/presence/occupancy', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok && data.status === 'success') {
        setActiveDrill(data.activeDrill || null);
        setRoomsOccupancy(data.roomsOccupancy || []);
        setFloorClearances(data.floorClearances || []);
        setTotalParticipants(data.totalParticipants || 0);
        setArrivedCount(data.arrivedCount || 0);
        setUnverifiedCount(data.unverifiedCount || 0);
        setDistressCount(data.distressCount || 0);
        setDistressList(data.distressList || []);
      }
    } catch (error) {
      console.error('Failed to load occupancy data:', error);
    }
  };

  const fetchUsers = async () => {
    if (user.role !== 'System Admin') return;
    setLoadingUsers(true);
    try {
      const response = await fetch('http://127.0.0.1:5000/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok && data.status === 'success') {
        setUsersList(data.users || []);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchGraph = async () => {
    if (user.role !== 'Drill Coordinator') return;
    setLoadingGraph(true);
    try {
      const [nodesResponse, edgesResponse] = await Promise.all([
        fetch('http://127.0.0.1:5000/api/nav/nodes', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('http://127.0.0.1:5000/api/nav/edges', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      const nodesData = await nodesResponse.json();
      const edgesData = await edgesResponse.json();
      setNodes(nodesData.nodes || []);
      setEdges(edgesData.edges || []);
    } catch (error) {
      console.error('Failed to load navigation data:', error);
    } finally {
      setLoadingGraph(false);
    }
  };

  const fetchDrillsList = async () => {
    if (user.role !== 'Drill Coordinator') return;
    try {
      const response = await fetch('http://127.0.0.1:5000/api/drills', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok && data.status === 'success') {
        setDrillsList(data.drills || []);
      }
    } catch (error) {
      console.error('Failed to load drills list:', error);
    }
  };

  const loadReportDetails = async (drillId) => {
    setLoadingReport(true);
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/reports/${drillId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok && data.status === 'success') {
        setReportData(data.report || null);
      } else {
        setReportData(null);
      }
    } catch (error) {
      console.error('Failed to load report details:', error);
      setReportData(null);
    } finally {
      setLoadingReport(false);
    }
  };

  useEffect(() => {
    const bootstrap = async () => {
      setLoading(true);
      await fetchOccupancy();
      await fetchUsers();
      setLoading(false);
    };
    bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user.role]);

  useEffect(() => {
    if (activeTab === 'navigation') {
      fetchGraph();
    }
    if (activeTab === 'reports') {
      fetchDrillsList();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const renderBadge = (role) => {
    switch (role) {
      case 'Student':
        return <span className="badge badge-student">Student</span>;
      case 'Teacher':
        return <span className="badge badge-teacher">Teacher/Staff</span>;
      case 'Drill Coordinator':
        return <span className="badge badge-coordinator">Drill Coordinator</span>;
      case 'System Admin':
        return <span className="badge badge-admin">System Admin</span>;
      default:
        return <span className="badge">{role}</span>;
    }
  };

  const renderLoginState = () => (
    <div className="surface-card" style={{ padding: '2rem', textAlign: 'center' }}>
      <StandbyIcon size={28} style={{ display: 'block', margin: '0 auto 0.5rem', color: 'var(--blue)' }} />
      <strong style={{ color: 'var(--navy)', display: 'block' }}>No Active Drill Session</strong>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>Drill baselines and classroom triangulation scans will open when a safety officer triggers the drill.</p>
    </div>
  );

  if (loading) {
    return (
      <div className="app-shell" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="loader-ring" />
      </div>
    );
  }

  return (
    <div className="app-shell" style={{ minHeight: '100vh', padding: '2.5rem 1.5rem 3rem', position: 'relative' }}>
      <div className="dashboard-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', padding: '1.4rem 1.6rem', flexWrap: 'wrap' }}>
        <div>
          <div className="nav-chip" style={{ marginBottom: '0.7rem' }}>Safety Operations Console</div>
          <h1 className="brand-title" style={{ textAlign: 'left', fontSize: '2rem', color: 'var(--navy)' }}>EvacSense Suite</h1>
          <p className="brand-subtitle" style={{ textAlign: 'left', color: 'var(--text-secondary)' }}>Safety Administration Console</p>
        </div>
        <button onClick={handleLogoutClick} className="btn btn-secondary" style={{ width: 'auto', padding: '0.6rem 1.2rem', fontSize: '0.875rem' }}>
          Logout Secure Session
        </button>
      </div>

      {(actionMessage || actionError || rejectingId) && (
        <div className="dashboard-panel" style={{ padding: '1.25rem 1.4rem', marginBottom: '1.5rem' }}>
          {actionMessage && <div style={{ background: 'rgba(24, 160, 88, 0.08)', border: '1px solid rgba(24, 160, 88, 0.18)', color: 'var(--green)', padding: '0.75rem 1rem', borderRadius: '14px', marginBottom: actionError ? '0.75rem' : 0 }}>{actionMessage}</div>}
          {actionError && <div style={{ background: 'rgba(217, 45, 32, 0.08)', border: '1px solid rgba(217, 45, 32, 0.18)', color: 'var(--red)', padding: '0.75rem 1rem', borderRadius: '14px' }}>{actionError}</div>}
          {rejectingId && (
            <form onSubmit={(e) => e.preventDefault()} style={{ marginTop: '0.75rem', textAlign: 'left' }}>
              <h4 className="section-title" style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Provide Verification Rejection Reason</h4>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <input className="form-input" value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} placeholder="e.g. Employee ID does not match safety registry" style={{ flex: 1, minWidth: '260px' }} />
                <button type="button" className="btn btn-primary" style={{ width: 'auto', padding: '0.6rem 1.2rem' }}>Confirm Rejection</button>
                <button type="button" className="btn btn-secondary" onClick={() => { setRejectingId(null); setRejectionReason(''); }} style={{ width: 'auto', padding: '0.6rem 1.2rem' }}>Cancel</button>
              </div>
            </form>
          )}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: (user.role === 'System Admin' || user.role === 'Drill Coordinator') ? '1fr' : '1fr 2fr', gap: '2rem', alignItems: 'start' }}>
        {user.role !== 'System Admin' && user.role !== 'Drill Coordinator' && (
          <div className="surface-card" style={{ padding: '2.25rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'linear-gradient(135deg, rgba(30,136,229,0.12), rgba(0,184,217,0.16))', border: '1px solid rgba(15,30,46,0.08)', margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--blue)' }}>
                <ClipboardIcon size={34} />
              </div>
              <h2 style={{ fontFamily: 'Outfit', fontSize: '1.5rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '0.35rem' }}>{user.name}</h2>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.75rem' }}>{user.email}</span>
              {renderBadge(user.role)}
            </div>
            <hr className="soft-divider" style={{ margin: '1.25rem 0' }} />
            <div style={{ display: 'grid', gap: '0.9rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', display: 'block', fontWeight: 600 }}>Department</span>
                <span style={{ color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 500 }}>{user.department || 'N/A'}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', display: 'block', fontWeight: 600 }}>Authorization ID</span>
                <code style={{ color: 'var(--blue)', fontSize: '0.85rem' }}>{user.id}</code>
              </div>
            </div>
          </div>
        )}

        {user.role !== 'System Admin' && user.role !== 'Drill Coordinator' && (
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            <div className="surface-card" style={{ padding: '2rem' }}>
              <h3 className="section-title" style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Pre-Drill Presence Detection</h3>
              {activeDrill ? (
                <div style={{ background: 'rgba(30, 136, 229, 0.06)', border: '1px solid rgba(30, 136, 229, 0.15)', padding: '1.25rem', borderRadius: '16px', textAlign: 'left' }}>
                  <strong style={{ color: 'var(--blue)', display: 'block', fontSize: '1.1rem', marginBottom: '0.5rem' }}>Live drill session active</strong>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.75rem' }}>A drill coordinator has activated <strong>{activeDrill.name}</strong>. Students and teachers must execute pre-drill localization now.</p>
                  <p style={{ color: 'var(--navy)', fontSize: '0.85rem' }}><strong>Please trigger localization inside your mobile application.</strong></p>
                </div>
              ) : renderLoginState()}
            </div>

            <div className="surface-card" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <h3 className="section-title" style={{ fontSize: '1.25rem' }}>Room Occupancy Overview</h3>
                <button className="btn btn-secondary" onClick={fetchOccupancy} style={{ width: 'auto' }}>Refresh Occupancy</button>
              </div>
              <div className="table-shell">
                <table>
                  <thead>
                    <tr>
                      <th style={{ padding: '0.9rem 1rem' }}>Room Code</th>
                      <th style={{ padding: '0.9rem 1rem' }}>Room Name</th>
                      <th style={{ padding: '0.9rem 1rem' }}>Floor</th>
                      <th style={{ padding: '0.9rem 1rem' }}>Active Occupancy</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roomsOccupancy.map((room) => (
                      <tr key={room.roomId}>
                        <td style={{ padding: '0.9rem 1rem' }}><code style={{ color: 'var(--blue)' }}>{room.roomId}</code></td>
                        <td style={{ padding: '0.9rem 1rem', fontWeight: 600, color: 'var(--navy)' }}>{room.roomName}</td>
                        <td style={{ padding: '0.9rem 1rem', color: 'var(--text-secondary)' }}>{room.floor}</td>
                        <td style={{ padding: '0.9rem 1rem' }}>{room.totalHeadcount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {(user.role === 'System Admin' || user.role === 'Drill Coordinator') && (
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            <div className="surface-card" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <div>
                  <h3 className="section-title" style={{ fontSize: '1.35rem', fontWeight: 700 }}>Drill Coordination Dashboard</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Trigger live drill events and review occupancy, route, and compliance data.</p>
                </div>
                {user.role === 'Drill Coordinator' && (
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <button className="btn btn-primary" style={{ width: 'auto' }} disabled={true}><span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}><PlayIcon size={16} /> Initiate Earthquake Drill Run</span></button>
                    <button className="btn btn-secondary" style={{ width: 'auto' }}><span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}><StopIcon size={16} /> Conclude Active Drill Run</span></button>
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginTop: '1.25rem' }}>
                <div className="dashboard-metric" style={{ padding: '1rem', borderLeft: '4px solid var(--blue)' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Total Registered</span>
                  <strong style={{ fontSize: '1.5rem', color: 'var(--navy)', display: 'block', marginTop: '0.25rem' }}>{totalParticipants}</strong>
                </div>
                <div className="dashboard-metric" style={{ padding: '1rem', borderLeft: '4px solid var(--green)' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Safely Arrived</span>
                  <strong style={{ fontSize: '1.5rem', color: 'var(--green)', display: 'block', marginTop: '0.25rem' }}>{arrivedCount}</strong>
                </div>
                <div className="dashboard-metric" style={{ padding: '1rem', borderLeft: '4px solid var(--amber)' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Classroom Unverified</span>
                  <strong style={{ fontSize: '1.5rem', color: 'var(--amber)', display: 'block', marginTop: '0.25rem' }}>{unverifiedCount}</strong>
                </div>
                <div className="dashboard-metric" style={{ padding: '1rem', borderLeft: `4px solid ${distressCount > 0 ? 'var(--red)' : 'var(--text-muted)'}` }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}><DistressIcon size={12} /> Distress Signals</span>
                  <strong style={{ fontSize: '1.5rem', color: distressCount > 0 ? 'var(--red)' : 'var(--navy)', display: 'block', marginTop: '0.25rem' }}>{distressCount}</strong>
                </div>
              </div>
            </div>

            <div className="dashboard-tabs">
              <button onClick={() => setActiveTab('occupancy')} className={`btn ${activeTab === 'occupancy' ? 'btn-primary' : 'btn-secondary'}`} style={{ width: 'auto' }}><span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}><ChartIcon size={16} /> Drill Attendance & Occupancy</span></button>
              {user.role === 'Drill Coordinator' && <button onClick={() => setActiveTab('navigation')} className={`btn ${activeTab === 'navigation' ? 'btn-primary' : 'btn-secondary'}`} style={{ width: 'auto' }}><span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}><BuildingIcon size={16} /> Evacuation Path Designer & Rerouting</span></button>}
              {user.role === 'Drill Coordinator' && <button onClick={() => setActiveTab('reports')} className={`btn ${activeTab === 'reports' ? 'btn-primary' : 'btn-secondary'}`} style={{ width: 'auto' }}><span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}><ReportIcon size={16} /> Compliance Safety Reports</span></button>}
            </div>

            {activeTab === 'occupancy' && (
              <div style={{ display: 'grid', gap: '1.5rem' }}>
                <div className="surface-card" style={{ padding: '1.5rem' }}>
                  <h3 className="section-title" style={{ fontSize: '1.15rem', marginBottom: '1rem' }}>Floor-by-Floor Clearance Checklist</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                    {floorClearances.map((fc) => {
                      const isCleared = fc.remaining === 0 && fc.totalOccupants > 0;
                      return (
                        <div key={fc.floor} className="dashboard-metric" style={{ padding: '1rem', borderLeft: `4px solid ${isCleared ? 'var(--green)' : 'var(--amber)'}` }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', alignItems: 'center' }}>
                            <strong style={{ color: 'var(--navy)' }}>Floor {fc.floor}</strong>
                            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: isCleared ? 'var(--green)' : 'var(--amber)' }}>{isCleared ? 'CLEARED' : 'IN PROGRESS'}</span>
                          </div>
                          <p style={{ margin: '0.5rem 0 0', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{fc.evacuated} of {fc.totalOccupants} evacuated</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {distressCount > 0 && (
                  <div className="surface-card" style={{ padding: '1.5rem' }}>
                    <h3 className="section-title" style={{ fontSize: '1.15rem', color: 'var(--red)' }}>Emergency Distress Alerts Active</h3>
                    <div style={{ display: 'grid', gap: '0.75rem', marginTop: '1rem' }}>
                      {distressList.map((log) => (
                        <div key={log.userId} className="dashboard-metric" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center' }}>
                          <div>
                            <strong style={{ color: 'var(--navy)' }}>{log.name} ({log.userId})</strong>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{log.role} | {log.department}</div>
                            <div style={{ color: 'var(--red)', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}><LocationIcon size={14} /> {log.location}</div>
                          </div>
                          <button className="btn btn-primary" style={{ width: 'auto' }}>Mark Safe</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="surface-card" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                    <h3 className="section-title" style={{ fontSize: '1.15rem' }}>Room Occupancy Overview</h3>
                    <button className="btn btn-secondary" onClick={fetchOccupancy} style={{ width: 'auto' }}>Refresh Occupancy</button>
                  </div>
                  <div className="table-shell">
                    <table>
                      <thead>
                        <tr>
                          <th style={{ padding: '0.9rem 1rem' }}>Room Code</th>
                          <th style={{ padding: '0.9rem 1rem' }}>Room Name</th>
                          <th style={{ padding: '0.9rem 1rem' }}>Floor</th>
                          <th style={{ padding: '0.9rem 1rem' }}>Active Occupancy</th>
                        </tr>
                      </thead>
                      <tbody>
                        {roomsOccupancy.map((room) => (
                          <tr key={room.roomId}>
                            <td style={{ padding: '0.9rem 1rem' }}><code style={{ color: 'var(--blue)' }}>{room.roomId}</code></td>
                            <td style={{ padding: '0.9rem 1rem', fontWeight: 600, color: 'var(--navy)' }}>{room.roomName}</td>
                            <td style={{ padding: '0.9rem 1rem', color: 'var(--text-secondary)' }}>{room.floor}</td>
                            <td style={{ padding: '0.9rem 1rem' }}>{room.totalHeadcount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'navigation' && user.role === 'Drill Coordinator' && (
              <div className="surface-card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  <div>
                    <h3 className="section-title" style={{ fontSize: '1.15rem' }}>Evacuation Path Designer</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Loaded navigation data is available for the selected floor.</p>
                  </div>
                  <button className="btn btn-secondary" onClick={fetchGraph} style={{ width: 'auto' }}>Reload Map Data</button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                  <div className="dashboard-metric" style={{ padding: '1rem' }}><span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Nodes</span><strong style={{ display: 'block', fontSize: '1.4rem', color: 'var(--navy)' }}>{nodes.length}</strong></div>
                  <div className="dashboard-metric" style={{ padding: '1rem' }}><span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Edges</span><strong style={{ display: 'block', fontSize: '1.4rem', color: 'var(--navy)' }}>{edges.length}</strong></div>
                  <div className="dashboard-metric" style={{ padding: '1rem' }}><span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Floor</span><strong style={{ display: 'block', fontSize: '1.4rem', color: 'var(--navy)' }}>{NGE_FLOOR_TITLES[selectedFloor] || `Floor ${selectedFloor}`}</strong></div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                  {[1, 2, 3, 4].map((floor) => (
                    <button key={floor} className={`btn ${selectedFloor === floor ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setSelectedFloor(floor)} style={{ width: 'auto' }}>
                      {floor === 1 ? '1F Ground' : floor === 2 ? '2F Labs' : floor === 3 ? '3F Nursing' : '4F Medical'}
                    </button>
                  ))}
                </div>
                {loadingGraph ? <div style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Loading navigation data...</div> : null}
              </div>
            )}

            {activeTab === 'reports' && user.role === 'Drill Coordinator' && (
              <div className="surface-card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  <div>
                    <h3 className="section-title" style={{ fontSize: '1.15rem' }}>Historical Safety Reviews</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Pick a completed drill to view its report.</p>
                  </div>
                  <button className="btn btn-secondary" onClick={fetchDrillsList} style={{ width: 'auto' }}><RefreshIcon size={14} /> Sync Completed Drills</button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.25rem', marginTop: '1rem' }}>
                  <div className="table-shell">
                    <table>
                      <tbody>
                        {drillsList.map((dr) => (
                          <tr key={dr.id}>
                            <td style={{ padding: '0.8rem 1rem' }}>
                              <button
                                onClick={() => {
                                  setSelectedReportId(dr.id);
                                  loadReportDetails(dr.id);
                                }}
                                className={`btn ${selectedReportId === dr.id ? 'btn-primary' : 'btn-secondary'}`}
                                style={{ width: '100%', justifyContent: 'flex-start' }}
                              >
                                {dr.name}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="surface-card" style={{ padding: '1.25rem' }}>
                    {loadingReport && <div style={{ color: 'var(--text-secondary)' }}>Compiling safety parameters...</div>}
                    {!loadingReport && reportData && (
                      <div>
                        <h4 className="section-title" style={{ fontSize: '1.1rem' }}>{reportData.name}</h4>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Report ID: #{reportData.drillId}</p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.75rem', marginTop: '1rem' }}>
                          <div className="dashboard-metric" style={{ padding: '0.9rem' }}><strong>{reportData.totalParticipants}</strong><span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Registered</span></div>
                          <div className="dashboard-metric" style={{ padding: '0.9rem' }}><strong style={{ color: 'var(--green)' }}>{reportData.evacuationRate}%</strong><span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Evacuation Rate</span></div>
                          <div className="dashboard-metric" style={{ padding: '0.9rem' }}><strong style={{ color: 'var(--blue)' }}>{reportData.clearTime}</strong><span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Clear Time</span></div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                          <a href={`http://127.0.0.1:5000/api/reports/export/csv/${reportData.drillId}`} className="btn btn-secondary" style={{ width: 'auto' }}><DownloadIcon size={14} /> Download CSV</a>
                          <button onClick={() => window.print()} className="btn btn-primary" style={{ width: 'auto' }}><PrintIcon size={14} /> Print Certificate</button>
                        </div>
                      </div>
                    )}
                    {!reportData && !loadingReport && <div style={{ color: 'var(--text-muted)' }}>Select a finished drill session to compile safety recommendations.</div>}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
