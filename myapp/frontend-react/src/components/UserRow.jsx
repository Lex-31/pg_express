import React, { useState } from 'react';
import { updateUserPermissions } from '../api/auth';

const UserRow = ({ user, onUserUpdate, allPermissions }) => {
    const [isEditing, setIsEditing] = useState(false); // State to control editing mode

    // Use a state variable to hold editable permissions, initially from user data
    // Initialize editablePermissions as an array
    const [editablePermissions, setEditablePermissions] = useState([...user.permissions]);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleEditClick = () => {
        setIsEditing(true);
        // When starting edit, update editablePermissions from user's current permissions
        setEditablePermissions([...user.permissions]);
    };

    const handleSaveClick = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // editablePermissions is already an array, no need to convert
            const permissionsArray = editablePermissions;
            const updatedUser = await updateUserPermissions(user.id, permissionsArray);

            if (updatedUser && updatedUser.user && onUserUpdate) {
                console.log('UserRow: Data being sent to onUserUpdate:', updatedUser.user);
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

    // Handler for checkbox changes
    const handlePermissionChange = (permission, isChecked) => {
        setEditablePermissions(prevPermissions => {
            if (isChecked) {
                // Add permission if checked and not already in the array
                return [...prevPermissions, permission];
            } else {
                // Remove permission if unchecked and in the array
                return prevPermissions.filter(p => p !== permission);
            }
        });
    };

    return (
        <div>
            <h3>{user.username} ({user.email}) - ID: {user.id}</h3> {/* Added user ID for clarity */}
            <p>Permissions:</p>
            {isEditing ? (
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
                    <button onClick={handleEditClick}>Edit</button>
                </div>
            )}
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
};

export default UserRow;