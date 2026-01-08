import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

/** 📘 Question Model */
export interface CreateQuestion {
  type: string;
  marks: number;
  text: string;
}

/** 📘 Exam Creation Payload */
export interface CreateExamPayload {
  subject: string;
  title: string;
  durationMinutes: number;
  description?: string;
  questions: CreateQuestion[];
}

/** 📗 Quiz Creation Payload */
export interface CreateQuizPayload {
  title: string;
  description?: string;
  durationMinutes?: number;
  questions?: Array<{
    questionText: string;
    marks?: number;
    options: Array<{
      text: string;
      correct: boolean;
    }>;
  }>;
}

/** 📙 Exam Model */
export interface ExamModel {
  id: number;
  subject: string;
  title: string;
  durationMinutes: number;
  description?: string;
  questions?: CreateQuestion[];
}

/** 📗 Quiz Model */
export interface QuizModel {
  id: number;
  title: string;
  description?: string;
  durationMinutes?: number;
  questions?: any[];
}

@Injectable({
  providedIn: 'root'
})
export class TeacherService {
  private baseUrl = 'http://localhost:8082/api'; // ✅ Backend base URL

  constructor(private http: HttpClient) {}

  // -------------------------------------------------
  // 🧾 EXAM APIs
  // -------------------------------------------------

  /** ✅ Create new exam */
  createExam(payload: CreateExamPayload): Observable<any> {
    return this.http.post(`${this.baseUrl}/exam/create`, payload);
  }

  /** ✅ Fetch all exams */
  getAllExams(): Observable<ExamModel[]> {
    return this.http.get<ExamModel[]>(`${this.baseUrl}/exam/all`);
  }

  /** ✅ Get exam by ID */
  getExamById(id: number): Observable<ExamModel> {
    return this.http.get<ExamModel>(`${this.baseUrl}/exam/${id}`);
  }

  /** ✅ Delete an exam */
  deleteExam(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/exam/delete/${id}`);
  }

  // -------------------------------------------------
  // 🧩 QUIZ APIs
  // -------------------------------------------------

  /** ✅ Create new quiz */
  createQuiz(payload: CreateQuizPayload): Observable<any> {
    return this.http.post(`${this.baseUrl}/quiz/create`, payload);
  }

  /** ✅ Get all quizzes (for teachers & admins) */
  getAllQuizzes(): Observable<QuizModel[]> {
    return this.http.get<any>(`${this.baseUrl}/quiz/all`).pipe(
      map((response: any) => {
        if (Array.isArray(response)) return response;
        if (response && Array.isArray(response.data)) return response.data;
        console.warn('⚠️ Unexpected quiz API response:', response);
        return [];
      }),
      catchError((err) => {
        console.error('❌ Error fetching quizzes:', err);
        return throwError(() => err);
      })
    );
  }

  /** ✅ Get available quizzes (for students) */
  getAvailableQuizzes(): Observable<QuizModel[]> {
    return this.http.get<any>(`${this.baseUrl}/quiz/all`).pipe(
      map((res: any) => res?.data || []),
      catchError((err) => {
        console.error('❌ Failed to fetch available quizzes:', err);
        return throwError(() => err);
      })
    );
  }

  /** ✅ Get quiz by ID */
  getQuizById(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/quiz/${id}`).pipe(
      map((res: any) => res?.data || res),
      catchError((err) => {
        console.error('❌ Failed to get quiz by ID:', err);
        return throwError(() => err);
      })
    );
  }

  /** ✅ Delete quiz by ID */
  deleteQuiz(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/quiz/delete/${id}`);
  }

  /** ✅ Submit quiz attempt (student submission) */
  submitQuizAttempt(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/quiz/submit`, data, {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // -------------------------------------------------
  // 🧮 EVALUATION APIs
  // -------------------------------------------------

  /** ✅ Get all submissions for evaluation (teacher/admin) */
  getAllSubmissions(): Observable<any[]> {
    return this.http.get<any>(`${this.baseUrl}/result/submissions`).pipe(
      map((res: any) => (Array.isArray(res) ? res : res?.data || [])),
      catchError((err) => {
        console.error('❌ Failed to fetch submissions:', err);
        return throwError(() => err);
      })
    );
  }

  /** ✅ Get a single submission by ID */
  getSubmissionById(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/result/${id}`);
  }

  /** ✅ Evaluate a submission */
  evaluateSubmission(id: number, payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/result/evaluate/${id}`, payload);
  }

  /** ✅ Delete a submission */
  deleteSubmission(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/result/delete/${id}`).pipe(
      catchError((err) => {
        console.error('❌ Failed to delete submission:', err);
        return throwError(() => err);
      })
    );
  }

  // -------------------------------------------------
  // 📊 STUDENT PERFORMANCE / MARKS APIs
  // -------------------------------------------------

  /**
   * ✅ Fetch evaluated marks for all students (teachers/admins/students)
   * Auto-detects whether backend returns an array or wrapped response
   */
  getAllStudentMarks(): Observable<any[]> {
    return this.http.get<any>(`${this.baseUrl}/result/student-performance`).pipe(
      map((res: any) => {
        if (Array.isArray(res)) return res;
        if (res && Array.isArray(res.data)) return res.data;
        console.warn('⚠️ Unexpected student performance response:', res);
        return [];
      }),
      catchError((err) => {
        console.error('❌ Failed to fetch student performance:', err);
        return throwError(() => err);
      })
    );
  }

  // <-- Added method as requested (exact behavior: simple GET) -->
  getStudentPerformance() {
    return this.http.get(`${this.baseUrl}/result/student-performance`);
  }

  // -------------------------------------------------
  // 💾 STUDENT EXAM SUBMISSION (Manual / Written Exams)
  // -------------------------------------------------

  /** ✅ Save student exam submission */
  saveSubmission(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/exam/submit`, data, {
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
