import { postData } from '@/utils/api';
import { useState } from 'react';
import { useSession } from "next-auth/react";

const PushNotificationButton = () => {
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const { data: session } = useSession();

    const token = session?.user?.jwt;

    const subscribeToPushNotifications = async () => {
        if (!token) {
            alert('You must be logged in to subscribe.');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            if ('Notification' in window && Notification.permission !== 'granted') {
                const permission = await Notification.requestPermission();
                if (permission !== 'granted') {
                    alert('You need to allow notifications to subscribe.');
                    setIsLoading(false);
                    return;
                }
            }

            if ('serviceWorker' in navigator && navigator.serviceWorker.ready) {
                const registration = await navigator.serviceWorker.ready;
                const subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY, // VAPID public key
                });

                // Send the subscription object to the server
                const response = await postData('push-notifications/subscribe', subscription, token);
                if (response?.success) {
                    console.log("############",response)
                    setIsSubscribed(true);
                } else {
                    setError('Failed to subscribe for push notifications.');
                }
            }
        } catch (err) {
            console.error('Error subscribing to push notifications:', err);
            setError('An error occurred while subscribing to notifications.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <button onClick={subscribeToPushNotifications} disabled={isLoading}>
                {isLoading ? 'Subscribing...' : isSubscribed ? 'Subscribed' : 'Subscribe to Push Notifications'}
            </button>
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
};

export default PushNotificationButton;
