export type AiFaqEntry = {
  id: string;
  question: string;
  answer: string;
  isActive: boolean;
  updatedAt: string;
};

export type AiFaqCreateInput = {
  question: string;
  answer: string;
  isActive?: boolean;
};

export type AiFaqUpdateInput = {
  id: string;
  question: string;
  answer: string;
  isActive: boolean;
};
