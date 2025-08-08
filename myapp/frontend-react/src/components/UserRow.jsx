import React, { useState } from 'react';
import { updateUserPermissions } from '../../api/auth';

const UserRow = ({ user, onPermissionsUpdated }) => {
    const [isEditing, setIsEditing] = useState(false);
    // Use a state variable to hold editable permissions, initially from user data
    const [editablePermissions, setEditablePermissions] = useState(user.permissions.join(', '));
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleEditClick = () => {
        setIsEditing(true);
        // When starting edit, update editablePermissions from user's current permissions
        setEditablePermissions(user.permissions.join(', '));
    };

    const handleSaveClick = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Convert comma-separated string back to an array
            const permissionsArray = editablePermissions.split(',').map(p => p.trim()).filter(p => p !== '');
            const updatedUser = await updateUserPermissions(user.id, permissionsArray);

            // If successful, call the callback to update state in parent (AdminPage)
            if (updatedUser && onPermissionsUpdated) {
                onPermissionsUpdated(user.id, updatedUser.permissions);
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
        // Revert changes on cancel
        setEditablePermissions(user.permissions.join(', '));
    };

    return (
        <div>
            <h3>{user.username} ({user.email})</h3>
            <p>Permissions:</p>
            {isEditing ? (
                <div>
                    <input
                        type="text"
                        value={editablePermissions}
                        onChange={(e) => setEditablePermissions(e.target.value)}
                        disabled={isLoading}
                    />
                    <button onClick={handleSaveClick} disabled={isLoading}>{isLoading ? 'Saving...' : 'Save'}</button>
                    <button onClick={handleCancelClick} disabled={isLoading}>Cancel</button>
                </div>
            ) : (
                <div>
                    <p>{user.permissions.join(', ') || 'No permissions'}</p>
                    <button onClick={handleEditClick}>Edit</button>
                </div>
            )}
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
};

export default UserRow;