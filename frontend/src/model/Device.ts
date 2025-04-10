import { Category } from "./Category";
import { Owner } from "./Owner";

export type Device = {
  id: string;
  accountingCode: string;
  serialNumber: string;
  specification: string;
  manufacture: string;
  location: string;
  purchaseDate: Date;
  purpose: string;
  expirationDate: Date;
  notes: string;
  user: Owner;
  identifyCode: string;
  category: Category;
};
