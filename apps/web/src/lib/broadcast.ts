import api from "@/lib/api";

export interface Tag {
    id: string;
    name: string;
    color?: string;
}

export const fetchTags = async () => {
    const res = await api.get("/api/tags");
    return res.data; // [{ id, name, color }]
};

export const createBroadcast = async (payload: {
    audienceType: "ALL" | "TAGS";
    tagIds?: string[];
    tagLogic?: "OR" | "AND";
    message: string;
    mediaUrl?: string | null;
    name?: string;
}) => {
    const body = {
        ...payload,
        tags: payload.tagIds
    };

    const res = await api.post("/api/broadcasts", body);
    return res.data;
};

export const executeBroadcast = async (id: string) => {
    const res = await api.post(`/api/broadcasts/${id}/execute`);
    return res.data;
}

export const estimateReach = async (payload: {
    audienceType: "ALL" | "TAGS";
    tagIds?: string[];
    tagLogic?: "OR" | "AND";
}) => {
    const body = {
        ...payload,
        tags: payload.tagIds
    };
    const res = await api.post("/api/broadcasts/estimate", body);
    return res.data; // { count: 123 }
}
