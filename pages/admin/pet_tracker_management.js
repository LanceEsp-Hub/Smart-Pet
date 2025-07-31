
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { addDevice, updateDeviceStatus, getDevices, getDeviceLocations } from "../../utils/api";
import toast from "react-hot-toast";
import moment from "moment"; // For date formatting

export default function DeviceManagement() {
    const [uniqueCode, setUniqueCode] = useState("");
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showLocations, setShowLocations] = useState(false);
    const [currentDeviceLocations, setCurrentDeviceLocations] = useState([]);
    const [selectedDevice, setSelectedDevice] = useState(null);
    const router = useRouter();

    // Fetch devices
    useEffect(() => {
        const fetchDevices = async () => {
            try {
                setLoading(true);
                const devicesData = await getDevices();
                setDevices(devicesData);
            } catch (error) {
                toast.error(error.message || "Failed to load devices");
            } finally {
                setLoading(false);
            }
        };
        fetchDevices();
    }, []);

    const handleAddDevice = async (e) => {
        e.preventDefault();
        if (!uniqueCode) {
            toast.error("Unique code is required");
            return;
        }

        try {
            const response = await addDevice(uniqueCode);
            toast.success(response.message);
            setUniqueCode("");
            // Refresh device list
            const updatedDevices = await getDevices();
            setDevices(updatedDevices);
        } catch (error) {
            toast.error(error.message || "Failed to add device");
        }
    };

    const handleStatusUpdate = async (deviceId, newStatus) => {
        try {
            await updateDeviceStatus(deviceId, newStatus);
            toast.success(`Device marked as ${newStatus}`);
            // Update UI
            setDevices(devices.map(device => 
                device.device_id === deviceId 
                    ? {...device, status: newStatus} 
                    : device
            ));
        } catch (error) {
            toast.error(error.message || "Status update failed");
            // Refresh data
            const updatedDevices = await getDevices();
            setDevices(updatedDevices);
        }
    };

    const handleViewLocations = async (device) => {
        if (!device.is_active || !device.is_online) {
            toast.error("Device must be active and online to view locations");
            return;
        }
        
        try {
            setLoading(true);
            const locations = await getDeviceLocations(device.device_id);
            setCurrentDeviceLocations(locations);
            setSelectedDevice(device);
            setShowLocations(true);
        } catch (error) {
            toast.error(error.message || "Failed to load locations");
        } finally {
            setLoading(false);
        }
    };

    const handleCloseLocations = () => {
        setShowLocations(false);
        setCurrentDeviceLocations([]);
        setSelectedDevice(null);
    };

    const formatDateTime = (dateTime) => {
        return dateTime ? moment(dateTime).format('YYYY-MM-DD HH:mm') : 'Never';
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">Device Management</h1>
            
            {/* Add Device Form */}
            <div className="mb-8 p-4 border rounded-lg">
                <h2 className="text-xl font-semibold mb-4">Add New Device</h2>
                <form onSubmit={handleAddDevice} className="flex gap-4">
                    <div className="flex-1">
                        <label className="block mb-2">Unique Code:</label>
                        <input
                            type="text"
                            value={uniqueCode}
                            onChange={(e) => setUniqueCode(e.target.value)}
                            required
                            className="w-full p-2 border rounded"
                            placeholder="Enter device code (e.g. LILYGO-7A83-B2)"
                        />
                    </div>
                    <button 
                        type="submit"
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded self-end transition-colors"
                        disabled={loading}
                    >
                        {loading ? "Adding..." : "Add Device"}
                    </button>
                </form>
            </div>

            {/* Location History Modal */}
            {showLocations && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">
                                Location History for {selectedDevice?.unique_code}
                            </h2>
                            <button 
                                onClick={handleCloseLocations}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>
                        
                        {currentDeviceLocations.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                No location data available for this device
                            </div>
                        ) : (
                            <table className="min-w-full bg-white border">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="py-2 px-4 border">Timestamp</th>
                                        <th className="py-2 px-4 border">Latitude</th>
                                        <th className="py-2 px-4 border">Longitude</th>
                                        <th className="py-2 px-4 border">Map</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentDeviceLocations.map((location) => (
                                        <tr key={location.location_id} className="hover:bg-gray-50">
                                            <td className="py-2 px-4 border text-center">
                                                {moment(location.timestamp).format('YYYY-MM-DD HH:mm')}
                                            </td>
                                            <td className="py-2 px-4 border text-center">
                                                {location.latitude.toFixed(6)}
                                            </td>
                                            <td className="py-2 px-4 border text-center">
                                                {location.longitude.toFixed(6)}
                                            </td>
                                            <td className="py-2 px-4 border text-center">
                                                <a
                                                    href={`https://www.google.com/maps?q=${location.latitude},${location.longitude}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-500 hover:underline"
                                                >
                                                    View on Map
                                                </a>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            )}

            {/* Device List */}
            <div>
                <h2 className="text-xl font-semibold mb-4">Registered Devices</h2>
                {loading ? (
                    <div className="text-center py-8">Loading devices...</div>
                ) : devices.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No devices registered yet</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white border">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="py-2 px-4 border">ID</th>
                                    <th className="py-2 px-4 border">Unique Code</th>
                                    <th className="py-2 px-4 border">Pet ID</th>
                                    <th className="py-2 px-4 border">User ID</th>
                                    <th className="py-2 px-4 border">Active</th>
                                    <th className="py-2 px-4 border">Online</th>
                                    <th className="py-2 px-4 border">Paired At</th>
                                    <th className="py-2 px-4 border">Last Seen</th>
                                    <th className="py-2 px-4 border">Status</th>
                                    <th className="py-2 px-4 border">Actions</th>
                                    <th className="py-2 px-4 border">Locations</th>
                                </tr>
                            </thead>
                            <tbody>
                                {devices.map((device) => (
                                    <tr key={device.device_id} className="hover:bg-gray-50">
                                        <td className="py-2 px-4 border text-center">{device.device_id}</td>
                                        <td className="py-2 px-4 border text-center font-mono">{device.unique_code}</td>
                                        <td className="py-2 px-4 border text-center">{device.pet_id || '-'}</td>
                                        <td className="py-2 px-4 border text-center">{device.user_id || '-'}</td>
                                        <td className={`py-2 px-4 border text-center ${
                                            device.is_active ? 'text-green-600' : 'text-gray-500'
                                        }`}>
                                            {device.is_active ? 'Yes' : 'No'}
                                        </td>
                                        <td className={`py-2 px-4 border text-center ${
                                            device.is_online ? 'text-green-600' : 'text-gray-500'
                                        }`}>
                                            {device.is_online ? 'Online' : 'Offline'}
                                        </td>
                                        <td className="py-2 px-4 border text-center text-sm">{formatDateTime(device.paired_at)}</td>
                                        <td className="py-2 px-4 border text-center text-sm">{formatDateTime(device.last_seen)}</td>
                                        <td className={`py-2 px-4 border text-center capitalize ${
                                            device.status === 'working' ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                            {device.status}
                                        </td>
                                        <td className="py-2 px-4 border text-center space-x-2">
                                            {device.status === 'working' ? (
                                                <button
                                                    onClick={() => handleStatusUpdate(device.device_id, 'removed')}
                                                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors"
                                                >
                                                    Mark Removed
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleStatusUpdate(device.device_id, 'working')}
                                                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm transition-colors"
                                                >
                                                    Reactivate
                                                </button>
                                            )}
                                        </td>
                                        <td className="py-2 px-4 border text-center">
                                            <button
                                                onClick={() => handleViewLocations(device)}
                                                disabled={!device.is_active || !device.is_online}
                                                className={`px-3 py-1 rounded text-sm transition-colors ${
                                                    device.is_active && device.is_online
                                                        ? 'bg-blue-500 hover:bg-blue-600 text-white'
                                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                }`}
                                            >
                                                Show Locations
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
