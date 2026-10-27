export type Employee = {
  id: number;
  employee_id: string;
  name: string;
  department: string | null;
  email: string | null;
  status: "Active" | "Inactive" | string;
};

export type ReviewPeriod = {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  status: "Open" | "Closed";
};

export type Review = {
  id: number;
  employee_id: number;
  employee_code: string;
  employee_name: string;
  period_id: number;
  period_name: string;
  quality_rating: number;
  delivery_rating: number;
  teamwork_rating: number;
  average_rating: number;
  comments: string;
  status: "Completed";
  created_at: string;
};

export type ReviewCreate = {
  employee_id: number;
  period_id: number;
  quality_rating: number;
  delivery_rating: number;
  teamwork_rating: number;
  comments: string;
};
