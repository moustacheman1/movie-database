import React, {useEffect, useState} from "react";
import {Col, Toast} from "react-bootstrap";

export default function Notification() {
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
         fetch('/api/notifications', {
                method: 'GET',
                credentials: "include"
            }).then(res => {
                if (!res.ok) {
                    throw res;
                }
                return res.json();
            }).then(data => {
                setNotifications(data);
            }).catch(err => {
                console.log(err);
                err.json();
            })
    }, []);

    function closeNotification(notif_id) {
        fetch('/api/notifications', {
            method: 'DELETE',
            credentials: "include",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                notification_id: notif_id
            })
        }).then(res => {
            if (!res.ok) {
                throw res;
            }
            return res.json();
        }).then(data => {
            console.log(data.message);
        }).catch(err => {
            console.log(err);
            err.json();
        });
    }

    const handleCloseNotification = notif_id => {
        return () => closeNotification(notif_id);
    }

    return (
        <div>
            <Col>
                <p className="display-3">Notifications</p>
                {!!notifications && notifications.length ?
                    notifications.map(notification =>
                    <Toast onClose={handleCloseNotification(notification._id)}>
                        <Toast.Header>
                            <strong className="mr-auto">Notification</strong>
                        </Toast.Header>
                        <Toast.Body>{notification.Notification_Text}</Toast.Body>
                    </Toast>) :
                    <div>
                        No new notifications to display 😢
                    </div>
            }
            </Col>
        </div>
    )
}