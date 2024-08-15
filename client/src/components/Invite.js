import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Invite.css';

function Invite() {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [popupMessage, setPopupMessage] = useState('');
    const [inviteStatus, setInviteStatus] = useState('');

    const handleInputChange = async (e) => {
        setSearchQuery(e.target.value);

        if (e.target.value.trim() === '') {
            setSearchResults([]);
            return;
        }

        try {
            const response = await axios.get(`http://localhost:5000/search_users?query=${e.target.value}`, { withCredentials: true });
            if (response.data.length === 0) {
                setPopupMessage('No users found');
                setSearchResults([]);
            } else {
                setPopupMessage('');
                setSearchResults(response.data);
            }
        } catch (error) {
            console.error('Error searching for users:', error);
        }
    };

    const clearSearch = () => {
        setSearchQuery('');
        setSearchResults([]);
        setPopupMessage('');
        setSelectedUser(null);
        setInviteStatus('');
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            clearSearch();
        }
    };

    const selectUser = (user) => {
        setSelectedUser(user);
        setSearchResults([]);  // Clear the search results once a user is selected
    };

    const sendInvite = async () => {
        if (!selectedUser) return;

        try {
            const response = await axios.post('http://localhost:5000/send_invite', {
                user_id: selectedUser.id,
            }, { withCredentials: true });

            if (response.data.message) {
                setInviteStatus('Invite sent successfully!');
            }
        } catch (error) {
            setInviteStatus('Failed to send invite.');
            console.error('Error sending invite:', error);
        }
    };

    return (
        <div className="invite-container">
            <h3>Invite Users</h3>
            <div className="search-wrapper">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Search for users"
                />
                {searchQuery && (
                    <button onClick={clearSearch} className="clear-button">X</button>
                )}
            </div>
            {popupMessage && <div className="popup">{popupMessage}</div>}
            {searchResults.length > 0 && (
                <ul className="autocomplete-list">
                    {searchResults.map((user) => (
                        <li key={user.id} onClick={() => selectUser(user)}>
                            {user.username}
                        </li>
                    ))}
                </ul>
            )}
            {selectedUser && (
                <div className="selected-user">
                    <p>Selected User: {selectedUser.username}</p>
                    <button onClick={sendInvite} className="invite-button">Send Invite</button>
                </div>
            )}
            {inviteStatus && <p className="invite-status">{inviteStatus}</p>}
        </div>
    );
}

export default Invite;
