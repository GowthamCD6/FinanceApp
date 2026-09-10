import React, { useEffect } from 'react';
import { Outlet, useParams, useNavigate } from 'react-router-dom';
import { useOrg } from '../../context/OrgContext';
import { Building, ArrowLeft } from 'lucide-react';

export const OrgAdminLayout = () => {
  const { orgId } = useParams();
  const navigate = useNavigate();
  const { setActiveOrg, activeOrg, organizations } = useOrg();

  useEffect(() => {
    if (orgId) {
      setActiveOrg(orgId);
    }
  }, [orgId, setActiveOrg]);

  const org = organizations.find((o) => String(o.id) === String(orgId));

  if (!org) {
    return (
      <div className="org-not-found">
        <Building size={48} color="var(--text-muted)" />
        <h2>Organization Not Found</h2>
        <p>The organization you're trying to access doesn't exist or has been removed.</p>
        <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
          <ArrowLeft size={16} />
          <span>Back to Organizations</span>
        </button>

        <style>{`
          .org-not-found {
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            padding: 4rem 2rem; text-align: center;
          }
          .org-not-found h2 { color: var(--text-primary); margin: 1rem 0 0.5rem; }
          .org-not-found p { color: var(--text-secondary); max-width: 340px; margin-bottom: 1.5rem; }
        `}</style>
      </div>
    );
  }

  return <Outlet context={{ org, orgId }} />;
};
