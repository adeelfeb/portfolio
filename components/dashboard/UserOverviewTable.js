import { useCallback, useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import styles from '../../styles/UserOverviewTable.module.css';

ModuleRegistry.registerModules([AllCommunityModule]);

const AgGridReact = dynamic(
  () => import('ag-grid-react').then((mod) => mod.AgGridReact),
  { ssr: false }
);

const DATE_FORMAT_OPTIONS = {
  dateStyle: 'medium',
  timeStyle: 'short',
};

const EDIT_ROLES = new Set(['superadmin', 'admin', 'hr', 'hr_admin']);
const ROLE_OPTIONS = [
  { value: 'superadmin', label: 'Super Admin' },
  { value: 'admin', label: 'Admin' },
  { value: 'hr_admin', label: 'HR Admin' },
  { value: 'hr', label: 'HR' },
  { value: 'base_user', label: 'Base User' },
  { value: 'simple_user', label: 'Simple User' },
];
const DEFAULT_ROLE = 'base_user';
const MIN_PASSWORD_LENGTH = 6;

function isValidEmail(value) {
  if (typeof value !== 'string') return false;
  return /.+@.+\..+/.test(value.trim());
}

function formatDateCell(value, formatter) {
  if (!value) return '—';
  try {
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return formatter.format(date);
  } catch {
    return '—';
  }
}

function ActionCellRenderer(params) {
  const { data, context } = params;
  const canEditUsers = Boolean(context?.canEditUsers);
  const onEdit = typeof context?.onEdit === 'function' ? context.onEdit : null;
  const onDelete = typeof context?.onDelete === 'function' ? context.onDelete : null;
  const deletingId = context?.deletingId || null;
  const editingId = context?.editingId || null;
  const isSaving = Boolean(context?.isSaving);
  const isProcessing = deletingId === data?.id;
  const isEditingThisRow = editingId === data?.id;
  const disableActions = !canEditUsers || isProcessing || isSaving;

  const handleEditClick = (event) => {
    event?.stopPropagation();
    if (disableActions) return;
    onEdit?.(data);
  };

  const handleDeleteClick = (event) => {
    event?.stopPropagation();
    if (disableActions) return;
    onDelete?.(data);
  };

  return (
    <div className={styles.actionButtons}>
      <button
        type="button"
        className={`${styles.actionButton} ${styles.actionButtonSecondary}`}
        disabled={disableActions}
        onClick={handleEditClick}
      >
        {isSaving && isEditingThisRow ? 'Saving…' : 'Edit'}
      </button>
      <button
        type="button"
        className={`${styles.actionButton} ${styles.actionButtonDanger}`}
        disabled={disableActions}
        onClick={handleDeleteClick}
      >
        {isProcessing ? 'Deleting…' : 'Delete'}
      </button>
    </div>
  );
}

const COMPACT_TABLE_BREAKPOINT = 960;

export default function UserOverviewTable({ currentUser = null }) {
  const [rowData, setRowData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCompact, setIsCompact] = useState(false);
  const [actionMessage, setActionMessage] = useState('');
  const [actionError, setActionError] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', role: DEFAULT_ROLE, newPassword: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState(null);
  const [roleOptions, setRoleOptions] = useState(ROLE_OPTIONS);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);
  const [roleLoadError, setRoleLoadError] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', email: '', role: DEFAULT_ROLE, password: '' });
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');

  const dateFormatter = useMemo(() => new Intl.DateTimeFormat(undefined, DATE_FORMAT_OPTIONS), []);

  const normalizedRole = (currentUser?.role || '').toLowerCase();
  const canEditUsers = useMemo(() => EDIT_ROLES.has(normalizedRole), [normalizedRole]);

  const normalizeUser = useCallback((user) => {
    if (!user || typeof user !== 'object') return null;
    const safeId = user.id || user._id || user.email;
    if (!safeId) return null;
    const normalizedRole =
      typeof user.role === 'string' && user.role.trim()
        ? user.role.trim().toLowerCase()
        : DEFAULT_ROLE;
    return {
      id: safeId,
      _id: user._id || safeId,
      name: user.name || '',
      email: user.email || '',
      role: normalizedRole,
      createdAt: user.createdAt || user.created_at || null,
      updatedAt: user.updatedAt || user.updated_at || null,
    };
  }, []);

  const editRoleOptions = useMemo(() => {
    const seen = new Set();
    const options = [];
    roleOptions.forEach((option) => {
      const value = option.value.toLowerCase();
      if (seen.has(value)) return;
      seen.add(value);
      options.push({ value, label: option.label });
    });
    if (editingUser?.role) {
      const normalized = editingUser.role.trim().toLowerCase();
      if (normalized && !seen.has(normalized)) {
        options.push({ value: normalized, label: normalized.replace(/_/g, ' ') });
      }
    }
    return options;
  }, [roleOptions, editingUser]);

  const columnDefs = useMemo(
    () => [
      {
        headerName: 'Name',
        field: 'name',
        minWidth: 180,
        filter: 'agTextColumnFilter',
      },
      {
        headerName: 'Email',
        field: 'email',
        minWidth: 200,
        filter: 'agTextColumnFilter',
      },
      {
        headerName: 'Role',
        field: 'role',
        minWidth: 130,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => params.value?.replace(/_/g, ' ') || '—',
      },
      {
        headerName: 'Created At',
        field: 'createdAt',
        minWidth: 150,
        valueFormatter: (params) => formatDateCell(params.value, dateFormatter),
      },
      {
        headerName: 'Updated At',
        field: 'updatedAt',
        minWidth: 150,
        valueFormatter: (params) => formatDateCell(params.value, dateFormatter),
      },
      {
        headerName: 'Actions',
        field: 'id',
        minWidth: 150,
        maxWidth: 180,
        sortable: false,
        filter: false,
        cellRenderer: ActionCellRenderer,
        suppressMenu: true,
        hide: !canEditUsers,
      },
    ],
    [dateFormatter, canEditUsers]
  );

  const defaultColDef = useMemo(
    () => ({
      sortable: true,
      filter: true,
      resizable: true,
      flex: 1,
    }),
    []
  );

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch('/api/users/list', {
        method: 'GET',
        credentials: 'include',
      });
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error('Unexpected server response');
      }
      const payload = await response.json();
      if (!response.ok || payload.success === false) {
        const message = payload?.message || 'Unable to fetch users';
        throw new Error(message);
      }
      const data = Array.isArray(payload.data) ? payload.data : [];
      const normalized = data
        .map(normalizeUser)
        .filter(Boolean);
      setRowData(normalized);
    } catch (err) {
      setError(err.message || 'Failed to load users');
      setRowData([]);
    } finally {
      setIsLoading(false);
    }
  }, [normalizeUser]);

  const loadRoles = useCallback(async () => {
    if (!canEditUsers) return;
    setIsLoadingRoles(true);
    setRoleLoadError('');
    try {
      const response = await fetch('/api/roles/list', {
        method: 'GET',
        credentials: 'include',
      });
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error('Unexpected server response');
      }
      const payload = await response.json();
      if (!response.ok || payload.success === false) {
        const message = payload?.message || 'Unable to fetch roles';
        throw new Error(message);
      }
      const roles = Array.isArray(payload?.data?.roles) ? payload.data.roles : [];
      const seen = new Set();
      const merged = [];
      ROLE_OPTIONS.forEach((option) => {
        const key = option.value.toLowerCase();
        if (seen.has(key)) return;
        seen.add(key);
        merged.push({ value: key, label: option.label });
      });
      roles.forEach((roleDoc) => {
        const rawName = typeof roleDoc.name === 'string' ? roleDoc.name.trim().toLowerCase() : '';
        if (!rawName || seen.has(rawName)) return;
        const label = roleDoc.description?.trim() || rawName.replace(/_/g, ' ');
        merged.push({ value: rawName, label });
        seen.add(rawName);
      });
      merged.sort((a, b) => a.label.localeCompare(b.label));
      setRoleOptions(merged);
    } catch (err) {
      setRoleLoadError(err.message || 'Failed to load roles');
    } finally {
      setIsLoadingRoles(false);
    }
  }, [canEditUsers]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    if (!canEditUsers) return;
    loadRoles();
  }, [canEditUsers, loadRoles]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return () => {};
    }

    const evaluateViewport = () => {
      setIsCompact(window.innerWidth < COMPACT_TABLE_BREAKPOINT);
    };

    evaluateViewport();
    window.addEventListener('resize', evaluateViewport);

    return () => {
      window.removeEventListener('resize', evaluateViewport);
    };
  }, []);

  const handleEditUser = useCallback(
    (user) => {
      if (!canEditUsers || !user) return;
      setActionError('');
      setActionMessage('');
      if (isCreateOpen) {
        setIsCreateOpen(false);
        setCreateForm({ name: '', email: '', role: DEFAULT_ROLE, password: '' });
        setCreateError('');
        setCreateSuccess('');
      }
      const snapshot = { ...user };
      const normalizedRole =
        typeof snapshot.role === 'string' && snapshot.role.trim()
          ? snapshot.role.trim().toLowerCase()
          : DEFAULT_ROLE;
      setEditingUser(snapshot);
      setEditForm({
        name: snapshot.name || '',
        email: snapshot.email || '',
        role: normalizedRole,
        newPassword: '',
      });
    },
    [canEditUsers, isCreateOpen]
  );

  const handleEditFieldChange = useCallback((event) => {
    const { name, value } = event.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    setActionError('');
    setActionMessage('');
  }, []);

  const handleCancelEdit = useCallback(() => {
    if (isSaving) return;
    setEditingUser(null);
    setEditForm({ name: '', email: '', role: DEFAULT_ROLE, newPassword: '' });
    setActionError('');
  }, [isSaving]);

  const handleSubmitEdit = useCallback(
    async (event) => {
      event.preventDefault();
      if (!editingUser || !canEditUsers) return;

      const trimmedName = editForm.name.trim();
      const trimmedEmail = editForm.email.trim();
      const normalizedRoleValue = ((editForm.role || '').trim() || DEFAULT_ROLE).toLowerCase();
      const trimmedPassword = editForm.newPassword.trim();

      if (!trimmedName) {
        setActionError('Name is required');
        return;
      }
      if (!trimmedEmail) {
        setActionError('Email is required');
        return;
      }
      if (!normalizedRoleValue) {
        setActionError('Role is required');
        return;
      }
      if (trimmedPassword && trimmedPassword.length < 6) {
        setActionError('New password must be at least 6 characters long');
        return;
      }

      setIsSaving(true);
      setActionError('');
      setActionMessage('');

      try {
        const targetId = editingUser._id || editingUser.id;
        const body = {
          name: trimmedName,
          email: trimmedEmail,
          role: normalizedRoleValue,
        };
        if (trimmedPassword) {
          body.newPassword = trimmedPassword;
        }
        const response = await fetch(`/api/users/${encodeURIComponent(targetId)}`, {
          method: 'PUT',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok || payload.success === false) {
          const message = payload?.message || 'Failed to update user';
          throw new Error(message);
        }
        const updatedUser = payload?.data?.user || null;
        if (updatedUser) {
          const normalized = normalizeUser({ ...updatedUser, id: updatedUser._id || editingUser.id });
          if (normalized) {
            setRowData((prev) =>
              prev.map((row) => (row.id === editingUser.id ? { ...row, ...normalized } : row))
            );
          }
        }
        setActionMessage('User updated successfully');
        setEditingUser(null);
        setEditForm({ name: '', email: '', role: DEFAULT_ROLE, newPassword: '' });
        loadRoles();
      } catch (err) {
        setActionError(err.message || 'Unable to update user');
      } finally {
        setIsSaving(false);
      }
    },
    [
      canEditUsers,
      editForm.email,
      editForm.name,
      editForm.role,
      editForm.newPassword,
      editingUser,
      normalizeUser,
      loadRoles,
    ]
  );

  const handleDeleteUser = useCallback(
    async (user) => {
      if (!canEditUsers || !user) return;
      const targetId = user._id || user.id || user.email;
      if (!targetId) return;
      const safeRowId = user.id || user._id || user.email;

      const confirmMessage = `Are you sure you want to delete ${user.name || user.email || 'this user'}?`;
      if (typeof window !== 'undefined') {
        const confirmed = window.confirm(confirmMessage);
        if (!confirmed) {
          return;
        }
      }

      setIsDeletingId(safeRowId);
      setActionError('');
      setActionMessage('');

      try {
        const response = await fetch(`/api/users/${encodeURIComponent(targetId)}`, {
          method: 'DELETE',
          credentials: 'include',
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok || payload.success === false) {
          const message = payload?.message || 'Failed to delete user';
          throw new Error(message);
        }
        setRowData((prev) => prev.filter((row) => row.id !== safeRowId));
        if (editingUser?.id === safeRowId) {
          setEditingUser(null);
          setEditForm({ name: '', email: '', role: DEFAULT_ROLE, newPassword: '' });
        }
        setActionMessage('User deleted successfully');
      } catch (err) {
        setActionError(err.message || 'Unable to delete user');
      } finally {
        setIsDeletingId(null);
      }
    },
    [canEditUsers, editingUser]
  );

  const handleCreateFieldChange = useCallback((event) => {
    const { name, value } = event.target;
    setCreateForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    setCreateError('');
    setCreateSuccess('');
  }, []);

  const handleToggleCreate = useCallback(() => {
    setCreateError('');
    setCreateSuccess('');
    setActionMessage('');
    setActionError('');
    if (!isCreateOpen) {
      setEditingUser(null);
      setEditForm({ name: '', email: '', role: DEFAULT_ROLE, newPassword: '' });
    }
    setCreateForm({ name: '', email: '', role: DEFAULT_ROLE, password: '' });
    setIsCreateOpen((prev) => !prev);
  }, [isCreateOpen]);

  const handleSubmitCreate = useCallback(
    async (event) => {
      event.preventDefault();
      if (!canEditUsers) return;

      const trimmedName = createForm.name.trim();
      const trimmedEmail = createForm.email.trim().toLowerCase();
      const trimmedPassword = createForm.password.trim();
      const normalizedRoleValue = ((createForm.role || '').trim() || DEFAULT_ROLE).toLowerCase();

      if (!trimmedName) {
        setCreateError('Name is required');
        return;
      }
      if (!trimmedEmail || !isValidEmail(trimmedEmail)) {
        setCreateError('A valid email is required');
        return;
      }
      if (!trimmedPassword || trimmedPassword.length < MIN_PASSWORD_LENGTH) {
        setCreateError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long`);
        return;
      }

      setIsCreating(true);
      setCreateError('');
      setCreateSuccess('');
      setActionMessage('');
      setActionError('');

      try {
        const response = await fetch('/api/users', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: trimmedName,
            email: trimmedEmail,
            password: trimmedPassword,
            role: normalizedRoleValue,
          }),
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok || payload.success === false) {
          const message = payload?.message || 'Failed to create user';
          throw new Error(message);
        }
        const createdUser = payload?.data?.user || null;
        if (createdUser) {
          const normalized = normalizeUser({ ...createdUser, id: createdUser.id || createdUser._id });
          if (normalized) {
            setRowData((prev) => [normalized, ...prev.filter((row) => row.id !== normalized.id)]);
          }
        }
        setCreateSuccess('User created successfully');
        setCreateForm({ name: '', email: '', role: DEFAULT_ROLE, password: '' });
        loadRoles();
      } catch (err) {
        setCreateError(err.message || 'Unable to create user');
      } finally {
        setIsCreating(false);
      }
    },
    [canEditUsers, createForm, loadRoles, normalizeUser]
  );

  const isEmpty = !isLoading && !error && rowData.length === 0;
  const editingId = editingUser?.id || null;

  return (
    <div className={styles.container}>
      {error && <div className={`${styles.feedback} ${styles.feedbackError}`}>{error}</div>}
      {!error && isLoading && (
        <div className={`${styles.feedback} ${styles.feedbackInfo}`}>Loading users…</div>
      )}
      {actionMessage && <div className={`${styles.feedback} ${styles.feedbackSuccess}`}>{actionMessage}</div>}
      {actionError && <div className={`${styles.feedback} ${styles.feedbackError}`}>{actionError}</div>}
      {canEditUsers && roleLoadError && !editingUser && !isCreateOpen && (
        <div className={`${styles.feedback} ${styles.feedbackError}`}>{roleLoadError}</div>
      )}
      {isEmpty && <div className={`${styles.feedback} ${styles.feedbackInfo}`}>No users found yet.</div>}

      {canEditUsers && (
        <div className={styles.toolbar}>
          <button
            type="button"
            className={styles.toolbarButton}
            onClick={handleToggleCreate}
            disabled={isCreating}
          >
            {isCreateOpen ? 'Close Create Form' : 'New User'}
          </button>
        </div>
      )}

      {canEditUsers && isCreateOpen && (
        <form className={`${styles.editPanel} ${styles.createPanel}`} onSubmit={handleSubmitCreate}>
          <div className={styles.editPanelHeader}>
            <div className={styles.editPanelHeaderText}>
              <span className={styles.editPanelTitle}>Create New User</span>
              <p className={styles.panelDescription}>
                Add a teammate by assigning their role and temporary password. They can update their
                details after logging in.
              </p>
            </div>
          </div>
          {createError && (
            <div className={`${styles.inlineFeedback} ${styles.inlineFeedbackError}`}>{createError}</div>
          )}
          {createSuccess && (
            <div className={`${styles.inlineFeedback} ${styles.inlineFeedbackSuccess}`}>{createSuccess}</div>
          )}
          {isCreating && (
            <div className={`${styles.inlineFeedback} ${styles.inlineFeedbackInfo}`}>
              Creating user…
            </div>
          )}
          <div className={styles.editFormGrid}>
            <label className={styles.editField}>
              <span>Name</span>
              <input
                type="text"
                name="name"
                value={createForm.name}
                onChange={handleCreateFieldChange}
                disabled={isCreating}
                required
              />
            </label>
            <label className={styles.editField}>
              <span>Email</span>
              <input
                type="email"
                name="email"
                value={createForm.email}
                onChange={handleCreateFieldChange}
                disabled={isCreating}
                required
              />
            </label>
            <label className={styles.editField}>
              <span>Role</span>
              <select
                name="role"
                value={createForm.role}
                onChange={handleCreateFieldChange}
                disabled={isCreating}
              >
                {roleOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className={styles.editField}>
              <span>Password</span>
              <input
                type="password"
                name="password"
                value={createForm.password}
                onChange={handleCreateFieldChange}
                disabled={isCreating}
                placeholder={`Minimum ${MIN_PASSWORD_LENGTH} characters`}
                required
                minLength={MIN_PASSWORD_LENGTH}
              />
            </label>
          </div>
          <div className={styles.editActions}>
            <button type="submit" className={styles.primaryButton} disabled={isCreating}>
              Create user
            </button>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={handleToggleCreate}
              disabled={isCreating}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {isCompact ? (
        <div className={styles.cardListWrapper} aria-live="polite">
          {!isEmpty && (
            <ul className={styles.cardList}>
              {rowData.map((user) => (
                <li key={user.id} className={styles.cardItem}>
                  <div className={styles.cardRow}>
                    <span className={styles.cardLabel}>Name</span>
                    <span className={styles.cardValue}>{user.name || '—'}</span>
                  </div>
                  <div className={styles.cardRow}>
                    <span className={styles.cardLabel}>Email</span>
                    <span className={styles.cardValue}>{user.email || '—'}</span>
                  </div>
                  <div className={styles.cardRow}>
                    <span className={styles.cardLabel}>Role</span>
                    <span className={styles.cardValue}>
                      {user.role?.replace(/_/g, ' ') || '—'}
                    </span>
                  </div>
                  <div className={styles.cardRow}>
                    <span className={styles.cardLabel}>Created</span>
                    <span className={styles.cardValue}>
                      {formatDateCell(user.createdAt, dateFormatter)}
                    </span>
                  </div>
                  <div className={styles.cardRow}>
                    <span className={styles.cardLabel}>Updated</span>
                    <span className={styles.cardValue}>
                      {formatDateCell(user.updatedAt, dateFormatter)}
                    </span>
                  </div>
                  {canEditUsers && (
                    <div className={`${styles.cardRow} ${styles.cardActions}`}>
                      <span className={styles.cardLabel}>Actions</span>
                      <div className={styles.actionButtons}>
                        <button
                          type="button"
                          className={`${styles.actionButton} ${styles.actionButtonSecondary}`}
                          disabled={isSaving || isDeletingId === user.id}
                          onClick={() => handleEditUser(user)}
                        >
                          {isSaving && editingId === user.id ? 'Saving…' : 'Edit'}
                        </button>
                        <button
                          type="button"
                          className={`${styles.actionButton} ${styles.actionButtonDanger}`}
                          disabled={isSaving || isDeletingId === user.id}
                          onClick={() => handleDeleteUser(user)}
                        >
                          {isDeletingId === user.id ? 'Deleting…' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <div className={styles.gridWrapper}>
          <div className={`ag-theme-quartz ${styles.grid}`}>
            {typeof window !== 'undefined' && (
              <AgGridReact
                rowData={rowData}
                columnDefs={columnDefs}
                defaultColDef={defaultColDef}
                enableCellTextSelection
                animateRows
                headerHeight={64}
                rowHeight={70}
                domLayout="autoHeight"
                pagination
                paginationPageSize={10}
                suppressPaginationPanel={false}
                suppressRowClickSelection
                stopEditingWhenCellsLoseFocus
                context={{
                  onEdit: handleEditUser,
                  onDelete: handleDeleteUser,
                  canEditUsers,
                  deletingId: isDeletingId,
                  editingId,
                  isSaving,
                }}
              />
            )}
          </div>
        </div>
      )}

      {canEditUsers && editingUser && (
        <form className={styles.editPanel} onSubmit={handleSubmitEdit}>
          <div className={styles.editPanelHeader}>
            <span className={styles.editPanelTitle}>
              Edit {editingUser.name || editingUser.email || 'user'}
            </span>
          </div>
          {roleLoadError && (
            <div className={`${styles.inlineFeedback} ${styles.inlineFeedbackError}`}>
              {roleLoadError}
              <button
                type="button"
                className={styles.inlineRetryButton}
                onClick={loadRoles}
                disabled={isLoadingRoles}
              >
                Retry
              </button>
            </div>
          )}
          {isLoadingRoles && (
            <div className={`${styles.inlineFeedback} ${styles.inlineFeedbackInfo}`}>
              Loading role options…
            </div>
          )}
          {isSaving && (
            <div className={`${styles.inlineFeedback} ${styles.feedbackInfo}`}>
              Saving changes…
            </div>
          )}
          <div className={styles.editFormGrid}>
            <label className={styles.editField}>
              <span>Name</span>
              <input
                type="text"
                name="name"
                value={editForm.name}
                onChange={handleEditFieldChange}
                disabled={isSaving}
                required
              />
            </label>
            <label className={styles.editField}>
              <span>Email</span>
              <input
                type="email"
                name="email"
                value={editForm.email}
                onChange={handleEditFieldChange}
                disabled={isSaving}
                required
              />
            </label>
            <label className={styles.editField}>
              <span>Role</span>
              <select
                name="role"
                value={editForm.role}
                onChange={handleEditFieldChange}
                disabled={isSaving}
                required
              >
                {editRoleOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className={styles.editField}>
              <span>New Password</span>
              <input
                type="password"
                name="newPassword"
                value={editForm.newPassword}
                onChange={handleEditFieldChange}
                disabled={isSaving}
                placeholder="Leave blank to keep current password"
                minLength={6}
              />
            </label>
          </div>
          <div className={styles.editActions}>
            <button type="submit" className={styles.primaryButton} disabled={isSaving}>
              Save changes
            </button>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={handleCancelEdit}
              disabled={isSaving}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

