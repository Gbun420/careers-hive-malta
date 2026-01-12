export type ApplicationStatus = 
  | 'NEW' 
  | 'REVIEWING' 
  | 'SHORTLIST' 
  | 'INTERVIEW' 
  | 'OFFER' 
  | 'REJECTED' 
  | 'HIRED';

export const APPLICATION_STATUS_META: Record<ApplicationStatus, { label: string; color: string; bgColor: string }> = {
  NEW: { 
    label: 'Submitted', 
    color: 'text-blue-700', 
    bgColor: 'bg-blue-50' 
  },
  REVIEWING: { 
    label: 'Under Review', 
    color: 'text-indigo-700', 
    bgColor: 'bg-indigo-50' 
  },
  SHORTLIST: { 
    label: 'Shortlisted', 
    color: 'text-teal-700', 
    bgColor: 'bg-teal-50' 
  },
  INTERVIEW: { 
    label: 'Interviewing', 
    color: 'text-brand', 
    bgColor: 'bg-brand/10' 
  },
  OFFER: { 
    label: 'Offer Received', 
    color: 'text-purple-700', 
    bgColor: 'bg-purple-50' 
  },
  REJECTED: { 
    label: 'Not Selected', 
    color: 'text-rose-700', 
    bgColor: 'bg-rose-50' 
  },
  HIRED: { 
    label: 'Hired', 
    color: 'text-secondary', 
    bgColor: 'bg-secondary/10' 
  },
};

export function getStatusMeta(status: string) {
  return APPLICATION_STATUS_META[status as ApplicationStatus] || APPLICATION_STATUS_META.NEW;
}
