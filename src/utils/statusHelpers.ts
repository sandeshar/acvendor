export const getStatusLabel = (statusId: number): string => {
    switch (statusId) {
        case 1: return "Active";
        case 2: return "Pending";
        case 3: return "Banned";
        default: return "Unknown";
    }
};

export const getStatusClasses = (statusId: number): string => {
    switch (statusId) {
        case 1: return "bg-green-100 text-green-800";
        case 2: return "bg-yellow-100 text-yellow-800";
        case 3: return "bg-red-100 text-red-800";
        default: return "bg-slate-100 text-slate-800";
    }
};

export const getBlogStatusLabel = (statusId: number): string => {
    switch (statusId) {
        case 1: return "Draft";
        case 2: return "Published";
        case 3: return "In Review";
        default: return "Unknown";
    }
};

export const getBlogStatusClasses = (statusId: number): string => {
    switch (statusId) {
        case 1: return "bg-yellow-100 text-yellow-800";
        case 2: return "bg-green-100 text-green-800";
        case 3: return "bg-blue-100 text-blue-800";
        default: return "bg-slate-100 text-slate-800";
    }
};
