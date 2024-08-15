import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await axios.get('http://localhost:5000/notifications', { withCredentials: true });
                setNotifications(response.data);
            } catch (error) {
                console.error('Error fetching notifications:', error);
            }
        };

        fetchNotifications();
    }, []);

    const acceptInvite = async (notificationId) => {
        try {
            const response = await axios.post(`http://localhost:5000/accept_invite/${notificationId}`, {}, { withCredentials: true });
            alert(response.data.message);
            // Remove notification from the list
            setNotifications(notifications.filter(n => n.id !== notificationId));
        } catch (error) {
            console.error('Error accepting invite:', error);
        }
    };

    const removeInvite = async (notificationId) => {
        try {
            const response = await axios.delete(`http://localhost:5000/remove_invite/${notificationId}`, { withCredentials: true });
            alert(response.data.message);
            // Remove notification from the list
            setNotifications(notifications.filter(n => n.id !== notificationId));
        } catch (error) {
            console.error('Error removing invite:', error);
        }
    };

    return (
        <div>
            <h2>Notifications</h2>
            <ul>
                {notifications.map(notification => (
                    <li key={notification.id}>
                        {notification.message}
                        <button onClick={() => acceptInvite(notification.id)}>Accept</button>
                        <button onClick={() => removeInvite(notification.id)}>Remove</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Notifications;

