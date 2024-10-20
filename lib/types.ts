export enum CancerStage {
  STAGE_0 = "STAGE_0",
  STAGE_I = "STAGE_I",
  STAGE_II = "STAGE_II",
  STAGE_III = "STAGE_III",
  STAGE_IV = "STAGE_IV",
}

export enum Honorifics {
  MR = "MR",
  MS = "MS",
  MRS = "MRS",
  DR = "DR",
  PROF = "PROF",
  REV = "REV",
}

export enum ListPermission {
  MANAGER = "MANAGER",
  MEMBER = "MEMBER",
}

export enum Relationship {
  FAMILY = "FAMILY",
  FRIEND = "FRIEND",
  COLLEAGUE = "COLLEAGUE",
  CARETAKER = "CARETAKER",
  OTHER = "OTHER",
  ACQUAINTANCE = "ACQUAINTANCE",
}

export enum TaskPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

export enum TaskType {
  GENERAL = "GENERAL",
  MEDICATION = "MEDICATION",
  EXERCISE = "EXERCISE",
  APPOINTMENT = "APPOINTMENT",
}

export enum UserType {
  PATIENT = "PATIENT",
  CARETAKER = "CARETAKER",
  DOCTOR = "DOCTOR",
}

export enum Gender {
  MALE = "MALE",
  FEMALE = "FEMALE",
  OTEHR = "OTHER",
}

export interface Vitals {
  id: number;
  name: string;
  unitOfMeasure: string;
}

export interface VitalReading {
  id: number;
  recordedBy: string;
  patientId: number;
  value: number;
  vitalsId: number;
  createdAt: string;

  Vitals: Vitals;
  Patient: Patient;
  RecordedBy: User;
}
export interface Patient {
  id: number;
  userId: string;
  cancerType: string;
  cancerStage: CancerStage;
  diagnosisDate: Date;
  User: User;
}

export interface User {
  id: string;
  honorific: Honorifics;
  firstName: string;
  middleName: string; 
  lastName: string;
  gender: Gender;
  phone: string;
  userType: UserType;
}

export interface JournalEntry  {
  id: number;
  patientId: number;
  title: string;
  content: string;
  mood: string;
  createdAt: Date;

  Patient: Patient
}

export interface Doctor {
  id: number,
  userId: string,
  licenseNumber: string,

  User: User
}

export interface Caretaker {
  id: number,
  userId: string,
  relationshipToPatient: Relationship
  qualifications: string

  User: User
}

export interface Address {
  id: number,
  userId: string;
  addressLineOne: string;
  addressLineTwo: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
}

export interface Task {
  id: number;
  taskListId: number;
  createdAt: Date; // x
  title: string; // x
  type: TaskType; // x
  description?: string; // /
  priority: TaskPriority; // x
  dueDate?: Date; // x
  finishDate?: Date; // /
  isDone: boolean; // /
  isArchived: boolean; // x
  prerequisiteTaskId?: number; 
  createdBy: string; // /

  CreatedBy: User
  PrerequisiteTask?: Task
}

export interface AppointmentTask {
  id: number;
  taskId: number;
  doctorId: number;
  appointmentDate: Date; // ISO format for date
  purpose: string;
  doctorsNotes?: string; // assuming this can be optional

  Task: Task
}

export interface ExerciseTask {
  id: number;
  taskId: number;
  duration: string;
  
  Task: Task
}

export interface MedicationTask {
  id: number;
  taskId: number;
  medicineColor: string;
  startDate: Date; // ISO format for date
  endDate: Date; // ISO format for date
  instructions?: string; // assuming this can be optional

  Task: Task
}

export interface TaskList {
  id: number;
  completedTaskCount: number;
  uncompletedTaskCount: number;
  patientId: number

  Patient: Patient
}