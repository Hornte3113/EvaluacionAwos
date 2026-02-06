// VIEW 1: vw_course_performance
export interface CoursePerformance {
  course_id: number;
  course_code: string;
  course_name: string;
  credits: number;
  term: string;
  program: string;
  total_students: number;
  avg_grade: number;
  passed_students: number;
  failed_students: number;
  pass_rate: number;
  excellent_students: number;
  min_grade: number;
  max_grade: number;
}

// VIEW 2: vw_teacher_load
export interface TeacherLoad {
  teacher_id: number;
  teacher_name: string;
  teacher_email: string;
  term: string;
  total_groups: number;
  total_students: number;
  avg_students_per_group: number;
  overall_avg_grade: number;
  courses_taught: string;
  students_passed: number;
  students_failed: number;
}

// VIEW 3: vw_students_at_risk
export interface StudentAtRisk {
  student_id: number;
  student_name: string;
  student_email: string;
  program: string;
  enrollment_year: number;
  total_enrollments: number;
  avg_grade: number;
  attendance_rate: number;
  total_absences: number;
  courses_failed: number;
  risk_level: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  risk_factors: string;
}

// VIEW 4: vw_attendance_by_group
export interface AttendanceByGroup {
  group_id: number;
  course_code: string;
  course_name: string;
  teacher_name: string;
  term: string;
  total_students: number;
  total_classes: number;
  avg_attendance_rate: number;
  students_good_attendance: number;
  students_poor_attendance: number;
  attendance_category: 'EXCELLENT' | 'GOOD' | 'REGULAR' | 'POOR';
}

// VIEW 5: vw_rank_students
export interface StudentRanking {
  student_id: number;
  student_name: string;
  student_email: string;
  program: string;
  term: string;
  courses_taken: number;
  total_credits: number;
  avg_grade: number;
  rank_in_program: number;
  row_number_in_program: number;
  percentile: number;
  total_students_in_program: number;
  gpa_category: string;
}

// Tipos para filtros y paginación
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}