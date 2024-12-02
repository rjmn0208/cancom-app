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
  TREATMENT = "TREATMENT",
}

export enum UserType {
  PATIENT = "PATIENT",
  CARETAKER = "CARETAKER",
  DOCTOR = "DOCTOR",
  ADMIN = "ADMIN",
  MEDICAL_STAFF = "MEDICAL_STAFF",
}

export enum Gender {
  MALE = "MALE",
  FEMALE = "FEMALE",
  OTHER = "OTHER",
}

export interface Vitals {
  id: number;
  name: string;
  unitOfMeasure: string;
  description: string;
}

export interface VitalReading {
  id: number;
  recordedBy: string;
  patientId: number;
  value: number;
  vitalsId: number;
  timestamp: Date;
  lastEditedBy: string;

  Vitals: Vitals;
  Patient: Patient;
  RecordedBy: User;
  LastEditedBy: User;
}

export interface Patient {
  id: number;
  userId: string;
  cancerTypeId: string;
  cancerStage: CancerStage;
  diagnosisDate: Date;

  User: User;
  CancerType: CancerType;
}

export interface CancerType {
  id: number;
  name: string;
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

  Patient: Patient;
  Caretaker: Caretaker;
  Doctor: Doctor;
  MedicalStaff: MedicalStaff;
  Address: Address[];
}

export interface Doctor {
  id: number;
  userId: string;
  licenseNumber: string;

  User: User;
}

export interface MedicalStaff {
  id: number;
  userId: string;
  medicalInstitutionId: number;
  designation: string;
  staffLicenseNumber: string;

  MedicalInstitution: MedicalInstitution;
}

export interface Caretaker {
  id: number;
  userId: string;
  qualifications: string;

  User: User;
}

export interface Address {
  id: number;
  userId: string;
  addressLineOne: string;
  addressLineTwo: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  type: AddressType;

  User: User;
}

export enum AddressType {
  PERMANENT = "PERMANENT",
  CURRENT = "CURRENT",
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
  parentTaskId: number;
  taskCreator: string; // /
  lastModifiedOn: Date;

  TaskList: TaskList
  TaskTag: TaskTag[];
  TaskCreator: User;
  PrerequisiteTask?: Task[];
  ParentTask: Task;
  AppointmentTask: AppointmentTask[];
  MedicationTask: MedicationTask[];
  TreatmentTask: TreatmentTask[];
  ExerciseTask: ExerciseTask[];
  Comment: TaskComment[]
}

export interface AppointmentTask extends Task {
  id: number;
  taskId: number;
  doctorId: number;
  appointmentDate: Date; // ISO format for date
  purpose: string;
  doctorsNotes?: string; // assuming this can be optional

  Doctor: Doctor;
  Task: Task;
}

export interface ExerciseTask extends Task {
  id: number;
  taskId: number;
  name: string;
  sets: number;
  reps: number;
  durationPerSet: number;
  durationPerRep: number;

  Task: Task;
}

export type Time = {
  hour: number;
  minute: number;
  period? : 'AM' | 'PM'
}

export interface MedicationTask extends Task {
  id: number;
  taskId: number;
  medicineColor: string;
  startDate: Date; // ISO format for date
  endDate: Date; // ISO format for date
  instructions?: string; // assuming this can be optional
  name: string;
  dosage: number;
  times: Time[];

  Task: Task;
  MedicationTaskSchedule: MedicationTaskSchedule[]
}

export interface MedicationTaskSchedule {
  id: number
  medicationTaskId: number;
  time: Time;
  isTaken: boolean
}

export interface TreatmentTask extends Task {
  id: number;
  taskId: number;
  medicalInstitutionId: number;
  treatmentType: string;
  date: Date;
  dosage?: number;

  MedicalInstitution: MedicalInstitution;
}

export interface TaskList {
  id: number;
  completedTasksCount: number;
  uncompletedTasksCount: number;
  patientId: number;

  Patient: Patient;
}

export interface ListMembership {
  id: number;
  userId: string;
  taskListId: number;
  permission: ListPermission;
  startDate: Date;
  endDate: Date;

  User: User;
  TaskList: TaskList;
}

export interface MedicalInstitution {
  id: number;
  name: string;
  phone: string;
  addressId: number;

  Address: Address;
}

export interface TaskTag {
  id: number;
  taskId: number;
  value: string;
  color: string;
  createdBy: string;
  createdAt: Date;

  CreatedBy: User;
  Task: Task;
}

export interface TaskComment{
  id: number;
  taskId: number
  authorId: string;
  content: string;
  timestamp: Date

  Author: User
}

export interface JournalEntry {
  id: number;
  patientId: number;
  title: string;
  content: string;
  mood: string;
  dateEntered: Date


  Patient: Patient
  JournalTag: JournalTag[]
  Task: Task[]
}

export interface JournalTag {
  id: number;
  journalId: number;
  value: string;
  color: string;
  createdAt: Date;

  JournalEntry: JournalEntry;
  Task: Task;
}