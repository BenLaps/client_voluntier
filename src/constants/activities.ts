// Описуємо структуру об'єкта користувача (якщо він populate)
interface PopulatedUser {
  id: string;
  email?: string; // email може бути необов'язковим, залежно від populate
}

// Описуємо структуру фінансових реквізитів
interface FinancialRequisites {
  card_number?: string;
  bank_name?: string;
  recipient_name?: string;
}

//  Application structure
interface Application {
  id: string; // Mongoose adds this
  user: PopulatedUser;
  status: 'pending' | 'accepted' | 'rejected';
  message?: string;
  appliedAt: string; // Comes as ISO string
}

export interface ActivityItem {
  id: string; // Завжди є
  title: string;
  imageUrl: string[];
  shortDescription: string;
  fullDescription?: string; // Залишив, якщо використовуєте
  socialContactURL: string[];
  city: string;
  location?: string; // Залишив, якщо використовуєте
  tags: string[];
  createdAt: string; // Зазвичай приходить як ISO string
  updatedAt: string; // Зазвичай приходить як ISO string
  requestType: "financial" | "volunteer";
  volunteersNeeded?: string; //  string і необов'язкове
  author: PopulatedUser | string; // Може бути об'єктом або ID
  applications: Application[];
  status: 'searching' | 'in_progress' | 'completed' | 'deleted';
  financialRequisites?: FinancialRequisites; //  Необов'язковий об'єкт
  feedback?: FeedbackEntry[];
}
export type FeedbackEntry = {
    id?: string; // Mongoose ID might not always be present initially
    user?: PopulatedUser | string; // Allow for populated or just ID
    role: 'author' | 'volunteer' | 'user';
    rating: number;
    text?: string;
    photos?: string[];
    createdAt: string; // Comes as ISO string
};
// Ensure PopulatedUser is defined too
interface PopulatedUser { id: string; email?: string; }