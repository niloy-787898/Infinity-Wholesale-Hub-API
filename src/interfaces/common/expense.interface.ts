export interface Expense {
  _id?: string;
  date?: string;
  dateString?: string;
  dueAmount?: number;
  paidAmount?: number;
  expenseFor?: string;
  description?: string;
  images?: [string];
  createdAt?: Date;
  updatedAt?: Date;
}
