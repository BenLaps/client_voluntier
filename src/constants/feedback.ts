// src/constants/feedback.ts

export interface Feedback {
    id?: string;
    user: {
      id: string;
      email: string;
    };
    role: 'author' | 'volunteer' | 'user';
    rating: number;
    text?: string;
    photos?: string[];
    createdAt?: string;
  }
