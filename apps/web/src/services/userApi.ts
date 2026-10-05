import api from "@/lib/api";

export async function syncUserProfile(userData: {
    userId: string;
    email: string | null;
    name: string | null;
    photoUrl: string | null;
    provider: string;
}) {
    const response = await api.post("/api/users/sync", userData);
    return response.data;
}

export async function getNotifications() {
    try {
        const response = await api.get("/api/notifications");
        return response.data;
    } catch {
        return [];
    }
}
