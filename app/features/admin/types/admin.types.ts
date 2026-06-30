export type UserRole = "student" | "alumni" | "admin" | "super_admin";

export type TargetAudience = "all" | "student" | "alumni";

export type AdminOverview = {
  totalUsers: number;
  alumniCount: number;
  studentCount: number;
  adminCount: number;
  superAdminCount: number;
  jobCount: number;
  newsCount: number;
  eventCount: number;
};

export type AdminActivity = {
  id: string;
  type: string;
  title: string;
  description: string | null;
  actorName: string | null;
  createdAt: string;
};