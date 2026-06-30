export type AlumniCardItem = {
  id: string;
  name: string;
  avatar?: string;
  faculty?: string;
  department?: string;
  admissionYear?: number | null;
  graduationYear?: number | null;
  company?: string;
  position?: string;
  location?: string;
  isVerified?: boolean;
  isActive?: boolean;
  lastUpdated?: string | null;
};

export type AlumniProfileDetail = {
  id: string;
  name: string;
  avatar: string;
  email: string;
  phone: string;
  linkedin: string;
  website: string;
  faculty: string;
  department: string;
  graduationYear: number | null;
  admissionYear: number | null;
  studentId: string;
  company: string;
  position: string;
  location: string;
  bio: string;
  skills: string[];
  interests: string[];
  isVerified: boolean;
  isActive: boolean;
  isMentor: boolean;
  lastUpdated: string | null;
  joinedDate: string | null;
  experience: {
    id?: string;
    company: string;
    position: string;
    duration: string;
    current: boolean;
  }[];
  education: {
    id?: string;
    institution: string;
    degree: string;
    field: string;
    year: number | null;
  }[];
  achievements: {
    id?: string;
    title: string;
    year: number | null;
    description: string;
  }[];
};

export type DirectorySort = "recent" | "name" | "admission_year" | "graduation_year";

export type DirectoryViewMode = "grid" | "list";

export type DirectoryQueryParams = {
  currentUserId?: string;
  search?: string;
  faculty?: string;
  admissionYear?: string;
  graduationYear?: string;
  sortBy?: DirectorySort;
  page?: number;
  pageSize?: number;
};

export type DirectoryFilterOptions = {
  faculties: string[];
  admissionYears: number[];
  graduationYears: number[];
};

export type DirectoryResult = {
  items: AlumniCardItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};