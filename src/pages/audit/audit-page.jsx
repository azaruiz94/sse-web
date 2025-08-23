import { useEffect, useState, useRef } from 'react';
import MainCard from 'components/MainCard';
import AuditTable from './audit-table';
import ShowAuditModal from './show-audit-modal';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAuditLogsByPage, fetchAuditLogById } from 'store/slices/auditSlice';

export default function AuditPage() {
  const dispatch = useDispatch();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAuditId, setSelectedAuditId] = useState(null);
  const auditLogs = useSelector(state => state.audit.logs); // should be an array
  const totalElements = useSelector(state => state.audit.totalElements);
  const loading = useSelector(state => state.audit.loading);
  const currentAudit = useSelector(state => state.audit.current);

  useEffect(() => {
    dispatch(fetchAuditLogsByPage(1));
  }, [dispatch]);

  const handleViewAudit = (id) => {
    setSelectedAuditId(id);
    dispatch(fetchAuditLogById(id));
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedAuditId(null);
  };

  return (
    <MainCard title="Auditoría">
      <AuditTable
        auditLogs={auditLogs}
        totalElements={totalElements}
        loading={loading}
        onViewAudit={handleViewAudit}
      />
      <ShowAuditModal
        open={modalOpen}
        onClose={handleCloseModal}
        audit={currentAudit}
      />
    </MainCard>
  );
}