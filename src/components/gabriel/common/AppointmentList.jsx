import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const AppointmentList = ({ userRole }) => {
  const [appointments, setAppointments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    fetchAppointments();
    fetchNotifications();
  }, [activeTab]);

  const fetchAppointments = async () => {
    try {
      const response = await axios.get('/api/appointments/my-appointments', {
        params: {
          upcoming: activeTab === 'upcoming',
          status: activeTab === 'upcoming' ? 'scheduled' : undefined,
        },
      });
      setAppointments(response.data.data);
    } catch (error) {
      toast.error('Error fetching appointments');
    }
    setLoading(false);
  };

  const fetchNotifications = async () => {
    try {
      const response = await axios.get('/api/notifications');
      setNotifications(response.data.data);
    } catch (error) {
      toast.error('Error fetching notifications');
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    try {
      const response = await axios.post('/api/appointments/cancel', {
        appointmentId,
        cancellationReason: 'Cancelled by user',
      });

      if (response.data.success) {
        toast.success('Appointment cancelled successfully');
        fetchAppointments();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error cancelling appointment');
    }
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      await axios.put(`/api/notifications/${notificationId}/read`);
      fetchNotifications();
    } catch (error) {
      toast.error('Error marking notification as read');
    }
  };

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">My Appointments</h2>
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-4 py-2 rounded-md ${
              activeTab === 'upcoming'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`px-4 py-2 rounded-md ${
              activeTab === 'past'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Past
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          {appointments.length > 0 ? (
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <div
                  key={appointment._id}
                  className="bg-white p-6 rounded-lg shadow-md"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium">
                        {userRole === 'specialist'
                          ? `Patient: ${appointment.patient.firstName} ${appointment.patient.lastName}`
                          : `Dr. ${appointment.specialist.firstName} ${appointment.specialist.lastName}`}
                      </h3>
                      <p className="text-gray-600">
                        {new Date(appointment.dateTime).toLocaleString()}
                      </p>
                      <p className="text-gray-600">
                        Specialty: {appointment.specialistCategory}
                      </p>
                      <p className="text-gray-600">Reason: {appointment.reason}</p>
                    </div>
                    {activeTab === 'upcoming' && appointment.status === 'scheduled' && (
                      <button
                        onClick={() => handleCancelAppointment(appointment._id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500">
              No {activeTab} appointments found.
            </div>
          )}
        </div>

        <div>
          <h3 className="text-lg font-medium mb-4">Notifications</h3>
          {notifications.length > 0 ? (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`bg-white p-4 rounded-lg shadow-md ${
                    !notification.isRead ? 'border-l-4 border-blue-500' : ''
                  }`}
                  onClick={() => markNotificationAsRead(notification._id)}
                >
                  <h4 className="font-medium">{notification.title}</h4>
                  <p className="text-sm text-gray-600">{notification.message}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500">No notifications</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentList; 