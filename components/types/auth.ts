export type EducationStatus = "studying" | "graduated";

export type FormData = {
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
    educationStatus: EducationStatus | "";
    studentId: string;
    major: string;
    studyYear?: number;
    education: {
        faculty: string;
        gpa: string;
        honors: string;
    }
}