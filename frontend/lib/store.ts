"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type RoleType = "ADMIN" | "FACULTY" | "STUDENT" | "PARENT";

export interface User {
  id: string;
  name: string;
  email: string;
  role: RoleType;
  avatarUrl?: string;
  phone?: string;
}

export interface StudentData {
  id: string;
  name: string;
  email: string;
  phone: string;
  parentEmail?: string;
  parentPhone?: string;
  course: string;
  batch: string;
  parentName: string;
  status: "Active" | "Deactivated";
  attendancePct: number;
  progress: number;
}

export interface FacultyData {
  id: string;
  name: string;
  email: string;
  department: string;
  subjects: string[];
  experience: string;
  assignedCourses: string[];
  assignedBatches: string[];
  status: "Active" | "Deactivated";
}

export interface BatchData {
  id: string;
  name: string;
  facultyName: string;
  studentCount: number;
  capacity: number;
  schedule: string;
  status: "Active" | "Completed" | "Upcoming";
}

export interface CourseData {
  id: string;
  title: string;
  price: number;
  facultyName: string;
  rating: number;
  duration: string;
  thumbnail: string;
  published: boolean;
  studentsEnrolled: number;
}

export interface InvoiceData {
  id: string;
  childName: string;
  amount: number;
  dueDate: string;
  status: "Paid" | "Pending" | "Overdue";
}

export interface AssignmentSubmission {
  id: string;
  studentName: string;
  submittedAt: string;
  fileName: string;
  status: "Submitted" | "Reviewed";
  marks?: string;
  feedback?: string;
}

export interface AssignmentData {
  id: string;
  title: string;
  course: string;
  deadline: string;
  status: "Pending" | "Submitted" | "Reviewed" | "Late";
  grade?: string;
  feedback?: string;
  submissions?: AssignmentSubmission[];
}

export interface LiveSessionData {
  id: string;
  title: string;
  batch: string;
  platform: string;
  link: string;
  date: string;
  time: string;
  status: "Scheduled" | "Live" | "Completed";
  notes: string;
  meetingId?: string;
  passcode?: string;
  startUrl?: string;
  provider?: "Zoom" | "Google Meet" | "Microsoft Teams" | "Custom";
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  category: "General" | "Exam" | "Holiday" | "Placement";
  sender: string;
  recipients: Array<"Faculty" | "Students" | "Parents" | "Institute">;
}

export type MessageAudience = "Students" | "Parents";
export type MessageScope = "All" | "Batch" | "Student";
export type MessagePriority = "Normal" | "Important" | "Urgent";

export interface CommunicationMessage {
  id: string;
  title: string;
  content: string;
  sender: string;
  senderRole: RoleType;
  sentAt: string;
  audience: MessageAudience[];
  scope: MessageScope;
  targetBatch?: string;
  targetStudentId?: string;
  targetStudentName?: string;
  priority: MessagePriority;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

interface AppStore {
  currentUser: User | null;
  activeRole: RoleType | null;
  notifications: NotificationItem[];
  announcements: Announcement[];
  messages: CommunicationMessage[];
  students: StudentData[];
  faculty: FacultyData[];
  batches: BatchData[];
  courses: CourseData[];
  invoices: InvoiceData[];
  assignments: AssignmentData[];
  liveSessions: LiveSessionData[];
  
  // Actions
  login: (email: string, role: RoleType) => void;
  logout: () => void;
  setRole: (role: RoleType) => void;
  markAllNotificationsRead: () => void;
  addNotification: (title: string, message: string) => void;
  sendMessage: (message: Omit<CommunicationMessage, "id" | "sentAt">) => void;
  
  // Entity actions
  addStudent: (student: Omit<StudentData, "id" | "attendancePct" | "progress">) => void;
  updateStudent: (id: string, updates: Partial<StudentData>) => void;
  deleteStudent: (id: string) => void;
  
  addFaculty: (fac: Omit<FacultyData, "id">) => void;
  updateFaculty: (id: string, updates: Partial<FacultyData>) => void;
  deleteFaculty: (id: string) => void;

  addBatch: (batch: Omit<BatchData, "id" | "studentCount">) => void;
  updateBatch: (id: string, updates: Partial<BatchData>) => void;
  deleteBatch: (id: string) => void;

  addCourse: (course: Omit<CourseData, "id" | "studentsEnrolled">) => void;
  updateCourse: (id: string, updates: Partial<CourseData>) => void;
  deleteCourse: (id: string) => void;

  addInvoice: (invoice: Omit<InvoiceData, "id">) => void;
  updateInvoice: (id: string, status: "Paid" | "Pending" | "Overdue") => void;

  submitAssignment: (id: string) => void;
  gradeAssignment: (id: string, grade: string, feedback: string) => void;
  addAnnouncement: (
    title: string,
    content: string,
    category: Announcement["category"],
    recipients?: Announcement["recipients"],
  ) => void;
  updateAnnouncement: (id: string, updates: Partial<Announcement>) => void;
  deleteAnnouncement: (id: string) => void;

  addAssignment: (assignment: Omit<AssignmentData, "id" | "status" | "submissions">) => void;
  updateAssignment: (id: string, updates: Partial<Omit<AssignmentData, "id">>) => void;
  deleteAssignment: (id: string) => void;
  reviewAssignmentSubmission: (
    assignmentId: string,
    submissionId: string,
    marks: string,
    feedback: string,
  ) => void;

  addLiveSession: (session: Omit<LiveSessionData, "id">) => void;
  updateLiveSession: (id: string, updates: Partial<Omit<LiveSessionData, "id">>) => void;
  deleteLiveSession: (id: string) => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      currentUser: null,
      activeRole: null,
      notifications: [
        { id: "1", title: "New Assignment", message: "Mathematics homework assigned by Dr. Albert", time: "10 mins ago", read: false },
        { id: "2", title: "Fee Due Remainder", message: "Term 2 tuition fee invoice is generated", time: "1 hour ago", read: false },
        { id: "3", title: "Batch Created", message: "Batch Quantum Physics C-26 is successfully scheduled", time: "2 hours ago", read: true },
      ],
      announcements: [
        { id: "a1", title: "End Semester Exams Schedule", content: "The final term exam starts from next Monday. Please download the hall ticket.", date: "2026-06-01", category: "Exam", sender: "Academic Head", recipients: ["Students", "Parents", "Faculty", "Institute"] },
        { id: "a2", title: "Placement Drive: TechCorp", content: "TechCorp is visiting for campus placements. Applications open till Wednesday.", date: "2026-05-30", category: "Placement", sender: "Training Coordinator", recipients: ["Students", "Institute"] },
        { id: "a3", title: "Summer Internship Guidelines", content: "Guidelines for mandatory summer projects have been posted under course materials.", date: "2026-05-25", category: "General", sender: "Dean Academics", recipients: ["Students", "Faculty"] },
      ],
      messages: [
        {
          id: "m1",
          title: "Welcome to the new term",
          content: "Please review the updated timetable and keep attendance above the 75% threshold.",
          sender: "Dr. Albert Stark",
          senderRole: "FACULTY",
          sentAt: "2026-05-27T09:00:00.000Z",
          audience: ["Students", "Parents"],
          scope: "All",
          priority: "Important",
        },
        {
          id: "m2",
          title: "Parent meeting reminder",
          content: "Parents of QC-2026 students are invited for a short progress review this Friday at 5 PM.",
          sender: "Prof. Sarah Connor",
          senderRole: "FACULTY",
          sentAt: "2026-05-26T13:30:00.000Z",
          audience: ["Parents"],
          scope: "Batch",
          targetBatch: "QC-2026",
          priority: "Normal",
        },
      ],
      students: [
        { id: "STU-001", name: "Saif Rahman", email: "saif@edu.com", phone: "+91 9876543210", parentEmail: "rahman.parent@edu.com", parentPhone: "+91 9876500001", course: "Advanced Quantum Computing", batch: "QC-2026", parentName: "A. Rahman", status: "Active", attendancePct: 88, progress: 65 },
        { id: "STU-002", name: "Amelia Stone", email: "amelia@edu.com", phone: "+1 415 555 2671", parentEmail: "robert.stone@edu.com", parentPhone: "+1 415 555 2001", course: "Artificial Intelligence & ML", batch: "AI-Alpha", parentName: "Robert Stone", status: "Active", attendancePct: 92, progress: 80 },
        { id: "STU-003", name: "Marcus Vane", email: "marcus@edu.com", phone: "+44 20 7946 0958", parentEmail: "l.vane@edu.com", parentPhone: "+44 20 7946 0123", course: "Data Structures & Algorithms", batch: "CS-Beta", parentName: "L. Vane", status: "Active", attendancePct: 72, progress: 45 },
        { id: "STU-004", name: "Kareem Abdul", email: "kareem@edu.com", phone: "+971 4 234 5678", parentEmail: "m.abdul@edu.com", parentPhone: "+971 4 234 5600", course: "Advanced Quantum Computing", batch: "QC-2026", parentName: "M. Abdul", status: "Deactivated", attendancePct: 85, progress: 95 },
      ],
      faculty: [
        { id: "FAC-101", name: "Dr. Albert Stark", email: "albert@edu.com", department: "Physics", subjects: ["Quantum Physics", "Electromagnetism"], experience: "12 Years", assignedCourses: ["Advanced Quantum Computing"], assignedBatches: ["QC-2026"], status: "Active" },
        { id: "FAC-102", name: "Prof. Sarah Connor", email: "sarah@edu.com", department: "Computer Science", subjects: ["Artificial Intelligence", "Machine Learning"], experience: "8 Years", assignedCourses: ["Artificial Intelligence & ML"], assignedBatches: ["AI-Alpha"], status: "Active" },
        { id: "FAC-103", name: "Dr. Bruce Wayne", email: "bruce@edu.com", department: "Computer Science", subjects: ["Data Structures", "Cybersecurity"], experience: "15 Years", assignedCourses: ["Data Structures & Algorithms"], assignedBatches: ["CS-Beta"], status: "Active" },
      ],
      batches: [
        { id: "QC-2026", name: "Quantum-2026", facultyName: "Dr. Albert Stark", studentCount: 22, capacity: 30, schedule: "Mon/Wed 10:00 AM", status: "Active" },
        { id: "AI-Alpha", name: "AI-Alpha-2026", facultyName: "Prof. Sarah Connor", studentCount: 28, capacity: 40, schedule: "Tue/Thu 2:00 PM", status: "Active" },
        { id: "CS-Beta", name: "CS-Beta-2026", facultyName: "Dr. Bruce Wayne", studentCount: 15, capacity: 25, schedule: "Fri 1:00 PM", status: "Active" },
      ],
      courses: [
        { id: "CRS-1", title: "Advanced Quantum Computing", price: 499, facultyName: "Dr. Albert Stark", rating: 4.8, duration: "12 Weeks", thumbnail: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop&q=60", published: true, studentsEnrolled: 45 },
        { id: "CRS-2", title: "Artificial Intelligence & ML", price: 699, facultyName: "Prof. Sarah Connor", rating: 4.9, duration: "16 Weeks", thumbnail: "https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800&auto=format&fit=crop&q=60", published: true, studentsEnrolled: 84 },
        { id: "CRS-3", title: "Data Structures & Algorithms", price: 299, facultyName: "Dr. Bruce Wayne", rating: 4.7, duration: "8 Weeks", thumbnail: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&auto=format&fit=crop&q=60", published: true, studentsEnrolled: 30 },
        { id: "CRS-4", title: "UX/UI Design Masterclass", price: 199, facultyName: "Instructor Kyle", rating: 4.6, duration: "6 Weeks", thumbnail: "https://images.unsplash.com/photo-1561070791-26c113006238?w=800&auto=format&fit=crop&q=60", published: false, studentsEnrolled: 0 },
      ],
      invoices: [
        { id: "INV-901", childName: "Saif Rahman", amount: 499, dueDate: "2026-06-15", status: "Pending" },
        { id: "INV-902", childName: "Saif Rahman", amount: 299, dueDate: "2026-05-01", status: "Paid" },
        { id: "INV-903", childName: "Saif Rahman", amount: 150, dueDate: "2026-05-20", status: "Overdue" },
      ],
      assignments: [
        { id: "ASM-1", title: "Schrödinger Equation Proofs", course: "Advanced Quantum Computing", deadline: "2026-06-03", status: "Pending" },
        { id: "ASM-2", title: "Neural Network from Scratch", course: "Artificial Intelligence & ML", deadline: "2026-05-20", status: "Submitted" },
        { id: "ASM-3", title: "Graph Traversal Algorithms", course: "Data Structures & Algorithms", deadline: "2026-05-15", status: "Reviewed", grade: "A+", feedback: "Excellent code structure and optimization!" },
      ],

      liveSessions: [
        { id: "LIVE-1", title: "Quantum States Live Revision", batch: "QC-2026", platform: "Google Meet", link: "https://meet.google.com/abc-defg-hij", date: "2026-05-28", time: "10:00 AM", status: "Scheduled", notes: "Revision before unit test 2", provider: "Google Meet" },
        { id: "LIVE-2", title: "AI Model Debugging Lab", batch: "AI-Alpha", platform: "Zoom", link: "https://zoom.us/j/123456789", date: "2026-05-29", time: "2:00 PM", status: "Scheduled", notes: "Hands-on model troubleshooting", provider: "Zoom", meetingId: "123456789", passcode: "123456" },
      ],

      login: (email, role) => {
        let name = "Academic Manager";
        if (role === "FACULTY") name = "Dr. Albert Stark";
        if (role === "STUDENT") name = "Saif Rahman";
        if (role === "PARENT") name = "A. Rahman";
        
        const user: User = {
          id: role === "STUDENT" ? "STU-001" : role === "FACULTY" ? "FAC-101" : "USER-" + Math.floor(Math.random() * 1000),
          name,
          email,
          role,
          avatarUrl: role === "STUDENT" 
            ? "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=60"
            : role === "FACULTY" 
            ? "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=60"
            : undefined
        };
        set({ currentUser: user, activeRole: role });
      },
      logout: () => set({ currentUser: null, activeRole: null }),
      setRole: (role) => set({ activeRole: role }),
      markAllNotificationsRead: () => set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, read: true }))
      })),
      addNotification: (title, message) => set((state) => ({
        notifications: [
          { id: String(Date.now()), title, message, time: "Just now", read: false },
          ...state.notifications
        ]
      })),
      sendMessage: (message) => set((state) => {
        const sentAt = new Date().toISOString();
        const createdMessage: CommunicationMessage = {
          ...message,
          id: `m-${Date.now()}`,
          sentAt,
        };

        return {
          messages: [createdMessage, ...(state.messages ?? [])],
          notifications: [
            {
              id: String(Date.now() + 1),
              title: "Message sent",
              message: `${createdMessage.title} was delivered to ${createdMessage.audience.join(" and ")}.`,
              time: "Just now",
              read: false,
            },
            ...state.notifications,
          ],
        };
      }),

      addStudent: (s) => set((state) => {
        const id = "STU-" + String(Math.floor(100 + Math.random() * 900));
        return {
          students: [...state.students, { ...s, id, attendancePct: 100, progress: 0 }]
        };
      }),
      updateStudent: (id, updates) => set((state) => ({
        students: state.students.map(s => s.id === id ? { ...s, ...updates } : s)
      })),
      deleteStudent: (id) => set((state) => ({
        students: state.students.filter(s => s.id !== id)
      })),

      addFaculty: (f) => set((state) => {
        const id = "FAC-" + String(Math.floor(100 + Math.random() * 900));
        return {
          faculty: [...state.faculty, { ...f, id }]
        };
      }),
      updateFaculty: (id, updates) => set((state) => ({
        faculty: state.faculty.map(f => f.id === id ? { ...f, ...updates } : f)
      })),
      deleteFaculty: (id) => set((state) => ({
        faculty: state.faculty.filter(f => f.id !== id)
      })),

      addBatch: (b) => set((state) => {
        const id = "BTC-" + String(Math.floor(100 + Math.random() * 900));
        return {
          batches: [...state.batches, { ...b, id, studentCount: 0 }]
        };
      }),
      updateBatch: (id, updates) => set((state) => ({
        batches: state.batches.map(b => b.id === id ? { ...b, ...updates } : b)
      })),
      deleteBatch: (id) => set((state) => ({
        batches: state.batches.filter(b => b.id !== id)
      })),

      addCourse: (c) => set((state) => {
        const id = "CRS-" + String(Math.floor(100 + Math.random() * 900));
        return {
          courses: [...state.courses, { ...c, id, studentsEnrolled: 0 }]
        };
      }),
      updateCourse: (id, updates) => set((state) => ({
        courses: state.courses.map(c => c.id === id ? { ...c, ...updates } : c)
      })),
      deleteCourse: (id) => set((state) => ({
        courses: state.courses.filter(c => c.id !== id)
      })),

      addInvoice: (inv) => set((state) => {
        const id = "INV-" + String(Math.floor(100 + Math.random() * 900));
        return {
          invoices: [...state.invoices, { ...inv, id }]
        };
      }),
      updateInvoice: (id, status) => set((state) => ({
        invoices: state.invoices.map(inv => inv.id === id ? { ...inv, status } : inv)
      })),

      submitAssignment: (id) => set((state) => {
        const submittedBy = state.currentUser?.name ?? "Saif Rahman";
        const submittedAt = new Date().toISOString().slice(0, 16).replace("T", " ");
        const updated = state.assignments.map((asm) => {
          if (asm.id !== id) return asm;
          const submissions = [
            ...(asm.submissions ?? []),
            {
              id: "SUB-" + Date.now(),
              studentName: submittedBy,
              submittedAt,
              fileName: `${asm.title.toLowerCase().replace(/\s+/g, "-")}.pdf`,
              status: "Submitted" as const,
            },
          ];
          return { ...asm, status: "Submitted" as const, submissions };
        });
        return { assignments: updated };
      }),
      gradeAssignment: (id, grade, feedback) => set((state) => ({
        assignments: state.assignments.map((asm) =>
          asm.id === id
            ? {
                ...asm,
                status: "Reviewed" as const,
                grade,
                feedback,
                submissions: (asm.submissions ?? []).map((submission) =>
                  submission.status === "Submitted"
                    ? { ...submission, status: "Reviewed" as const, marks: grade, feedback }
                    : submission,
                ),
              }
            : asm,
        )
      })),
      addAnnouncement: (title, content, category, recipients = ["Faculty", "Students", "Parents", "Institute"]) => set((state) => ({
        announcements: [
          { id: "a" + Date.now(), title, content, category, date: new Date().toISOString().split("T")[0], sender: "Academic Admin", recipients },
          ...state.announcements
        ]
      })),
      updateAnnouncement: (id, updates) => set((state) => ({
        announcements: state.announcements.map((announcement) =>
          announcement.id === id ? { ...announcement, ...updates } : announcement,
        )
      })),
      deleteAnnouncement: (id) => set((state) => ({
        announcements: state.announcements.filter((announcement) => announcement.id !== id)
      })),

      addAssignment: (assignment) => set((state) => ({
        assignments: [
          {
            ...assignment,
            id: "ASM-" + String(Math.floor(100 + Math.random() * 900)),
            status: "Pending",
            submissions: [],
          },
          ...state.assignments,
        ],
      })),
      updateAssignment: (id, updates) => set((state) => ({
        assignments: state.assignments.map((assignment) =>
          assignment.id === id ? { ...assignment, ...updates } : assignment,
        )
      })),
      deleteAssignment: (id) => set((state) => ({
        assignments: state.assignments.filter((assignment) => assignment.id !== id)
      })),
      reviewAssignmentSubmission: (assignmentId, submissionId, marks, feedback) => set((state) => ({
        assignments: state.assignments.map((assignment) => {
          if (assignment.id !== assignmentId) return assignment;
          const submissions = (assignment.submissions ?? []).map((submission) =>
            submission.id === submissionId
              ? { ...submission, status: "Reviewed" as const, marks, feedback }
              : submission,
          );
          return { ...assignment, status: "Reviewed" as const, grade: marks, feedback, submissions };
        }),
      })),

      addLiveSession: (session) => set((state) => ({
        liveSessions: [
          { ...session, id: "LIVE-" + String(Math.floor(100 + Math.random() * 900)) },
          ...state.liveSessions,
        ],
      })),
      updateLiveSession: (id, updates) => set((state) => ({
        liveSessions: state.liveSessions.map((session) =>
          session.id === id ? { ...session, ...updates } : session,
        )
      })),
      deleteLiveSession: (id) => set((state) => ({
        liveSessions: state.liveSessions.filter((session) => session.id !== id)
      }))
    }),
    {
      name: "education-platform-store",
      version: 3,
      migrate: (persistedState) => {
        const state = persistedState as Partial<AppStore> & {
          announcements?: Partial<Announcement>[];
          assignments?: Partial<AssignmentData>[];
          messages?: Partial<CommunicationMessage>[];
        };

        return {
          ...state,
          announcements: (state.announcements ?? []).map((announcement) => ({
            id: announcement.id ?? `a-${Date.now()}`,
            title: announcement.title ?? "",
            content: announcement.content ?? "",
            date: announcement.date ?? new Date().toISOString().split("T")[0],
            category: announcement.category ?? "General",
            sender: announcement.sender ?? "Academic Admin",
            recipients: announcement.recipients ?? ["Students"],
          })),
          assignments: (state.assignments ?? []).map((assignment) => ({
            id: assignment.id ?? `ASM-${Date.now()}`,
            title: assignment.title ?? "",
            course: assignment.course ?? "",
            deadline: assignment.deadline ?? "",
            status: assignment.status ?? "Pending",
            grade: assignment.grade,
            feedback: assignment.feedback,
            submissions: assignment.submissions ?? [],
          })),
          messages: (state.messages ?? []).map((message) => ({
            id: message.id ?? `m-${Date.now()}`,
            title: message.title ?? "",
            content: message.content ?? "",
            sender: message.sender ?? "Academic Admin",
            senderRole: message.senderRole ?? "ADMIN",
            sentAt: message.sentAt ?? new Date().toISOString(),
            audience: message.audience ?? ["Students"],
            scope: message.scope ?? "All",
            targetBatch: message.targetBatch,
            targetStudentId: message.targetStudentId,
            targetStudentName: message.targetStudentName,
            priority: message.priority ?? "Normal",
          })),
        } as Partial<AppStore>;
      },
    }
  )
);
