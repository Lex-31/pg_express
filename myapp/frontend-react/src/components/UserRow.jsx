import React, { useState } from 'react';
import { updateUserPermissions, deleteUser } from '../api/auth';

const UserRow = ({ user, currentUserPermissions, onUserUpdate, onUserDelete, allPermissions }) => {
    const [isEditing, setIsEditing] = useState(false); // State to control editing mode
    // Use a state variable to hold editable permissions, initially from user data
    // Initialize editablePermissions as an array
    const [editablePermissions, setEditablePermissions] = useState([...user.permissions]);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const canEditPermissions = currentUserPermissions.includes('edit_permissions');
    const canDeleteUsers = currentUserPermissions.includes('delete_users');

    const handleEditClick = () => {
        setIsEditing(true);
        // When starting edit, update editablePermissions from user's current permissions
        // setEditablePermissions([...user.permissions]);
    };

    const handleSaveClick = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // editablePermissions is already an array, no need to convert
            // const permissionsArray = editablePermissions;
            const updatedUser = await updateUserPermissions(user.id, editablePermissions);

            if (updatedUser && updatedUser.user) {
                onUserUpdate(updatedUser.user); // <-- Передается только вложенный объект user
            }

            setIsEditing(false);
        } catch (err) {
            console.error('Failed to update permissions:', err);
            setError('Failed to update permissions: ' + (err.message || 'Unknown error'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancelClick = () => {
        setIsEditing(false);
        // Revert changes on cancel - set editablePermissions back to the original user permissions array
        setEditablePermissions([...user.permissions]);
    };

    const handleDeleteClick = async () => {
        if (window.confirm(`Вы уверены, что хотите удалить пользователя ${user.username}?`)) {
            setIsLoading(true);
            setError(null);
            try {
                await deleteUser(user.id);
                onUserDelete(user.id);
            } catch (err) {
                setError('Failed to delete user: ' + err.message);
            } finally {
                setIsLoading(false);
            }
        }
    };

    // Handler for checkbox changes
    const handlePermissionChange = (permission, isChecked) => {
        setEditablePermissions(prev =>
            isChecked ? [...prev, permission] : prev.filter(p => p !== permission)
        );
    };

    return (
        <div>
            <h3>{user.username} ({user.email}) - ID: {user.id}</h3> {/* Added user ID for clarity */}
            <p>Permissions:</p>
            {isEditing && canEditPermissions ? (
                <div>
                    {/* Render checkboxes for each possible permission */}
                    {allPermissions.map(permission => (
                        <div key={permission}>
                            <input
                                type="checkbox"
                                id={`${user.id}-${permission}`} // Unique ID for each checkbox
                                checked={editablePermissions.includes(permission)}
                                onChange={(e) => handlePermissionChange(permission, e.target.checked)}
                                disabled={isLoading}
                            />
                            <label htmlFor={`${user.id}-${permission}`}>{permission}</label>
                        </div>
                    ))}
                    <button onClick={handleSaveClick} disabled={isLoading}>{isLoading ? 'Saving...' : 'Save'}</button>
                    <button onClick={handleCancelClick} disabled={isLoading}>Cancel</button>
                </div>
            ) : (
                <div>
                    <p>{user.permissions.join(', ') || 'No permissions'}</p>
                    {canEditPermissions && <button onClick={handleEditClick}>Edit</button>}
                    {canDeleteUsers && <button onClick={handleDeleteClick} disabled={isLoading}>{isLoading ? 'Deleting...' : 'Delete'}</button>}
                </div>
            )}
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
};

export default UserRow;