"use client";

import ExpenseForm from '@/app/components/expense/add/expense'
import { Suspense } from 'react';

export default function Expense() {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <ExpenseForm />
      </Suspense>
    </div>
  );
}
