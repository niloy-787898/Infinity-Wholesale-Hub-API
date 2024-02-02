export interface Transactions {
  _id?: string;
  transactionDate?: Date;
  transactionDateString?: string;
  vednor?: any;
  dueAmount?: number;
  paidAmount?: number;
  description?: string;
  images?: [string];
  createdAt?: Date;
  updatedAt?: Date;
  select?: boolean;
}
