"use client";

import { useMemo, useState } from "react";
import styles from "./page.module.css";

const categories = [
  "Housing",
  "Food",
  "Transport",
  "Health",
  "Utilities",
  "Leisure",
  "Other",
];

const seedExpenses = [
  {
    id: crypto.randomUUID(),
    description: "Groceries",
    category: "Food",
    amount: 68.45,
    date: "2024-04-06",
    note: "Weekly supermarket run",
  },
  {
    id: crypto.randomUUID(),
    description: "Gym Membership",
    category: "Health",
    amount: 39.99,
    date: "2024-04-01",
    note: "",
  },
  {
    id: crypto.randomUUID(),
    description: "Metro card",
    category: "Transport",
    amount: 25.5,
    date: "2024-04-08",
    note: "Top-up",
  },
  {
    id: crypto.randomUUID(),
    description: "Streaming service",
    category: "Leisure",
    amount: 12.99,
    date: "2024-03-29",
    note: "",
  },
  {
    id: crypto.randomUUID(),
    description: "Electricity",
    category: "Utilities",
    amount: 91.2,
    date: "2024-03-18",
    note: "March bill",
  },
];

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);

const formatMonthKey = (value) => {
  const [year, month] = value.split("-");
  return `${year}-${month}`;
};

const toMonthLabel = (value) => {
  const date = new Date(`${value}-01T00:00:00`);
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
};

export default function Home() {
  const [expenses, setExpenses] = useState(seedExpenses);
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [newExpense, setNewExpense] = useState({
    description: "",
    category: categories[0],
    amount: "",
    date: new Date().toISOString().slice(0, 10),
    note: "",
  });

  const months = useMemo(() => {
    const uniqueMonths = Array.from(
      new Set(expenses.map((expense) => formatMonthKey(expense.date)))
    ).sort((a, b) => (a > b ? -1 : 1));
    return uniqueMonths;
  }, [expenses]);

  const filteredExpenses = useMemo(() => {
    if (selectedMonth === "all") {
      return expenses.slice().sort((a, b) => (a.date > b.date ? -1 : 1));
    }
    return expenses
      .filter((expense) => formatMonthKey(expense.date) === selectedMonth)
      .sort((a, b) => (a.date > b.date ? -1 : 1));
  }, [expenses, selectedMonth]);

  const totals = useMemo(() => {
    const base = {
      total: 0,
      byCategory: {},
      average: 0,
      count: filteredExpenses.length,
    };

    if (!filteredExpenses.length) return base;

    const daySet = new Set();
    for (const expense of filteredExpenses) {
      base.total += expense.amount;
      base.byCategory[expense.category] =
        (base.byCategory[expense.category] || 0) + expense.amount;
      daySet.add(expense.date);
    }

    base.average = base.total / daySet.size;
    return base;
  }, [filteredExpenses]);

  const monthlyTrend = useMemo(() => {
    const map = new Map();
    for (const expense of expenses) {
      const key = formatMonthKey(expense.date);
      map.set(key, (map.get(key) || 0) + expense.amount);
    }
    return Array.from(map.entries())
      .sort((a, b) => (a[0] > b[0] ? -1 : 1))
      .slice(0, 4);
  }, [expenses]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setNewExpense((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const amount = Number.parseFloat(newExpense.amount);
    if (!newExpense.description.trim() || Number.isNaN(amount) || amount <= 0) {
      return;
    }

    const expense = {
      id: crypto.randomUUID(),
      description: newExpense.description.trim(),
      category: newExpense.category,
      amount: Math.round(amount * 100) / 100,
      date: newExpense.date,
      note: newExpense.note.trim(),
    };

    setExpenses((prev) => [expense, ...prev]);
    setNewExpense((prev) => ({
      ...prev,
      description: "",
      amount: "",
      note: "",
    }));
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <header className={styles.header}>
          <div>
            <h1>Spending Snapshot</h1>
            <p>Track where your money goes and add new expenses in seconds.</p>
          </div>
          <select
            className={styles.monthFilter}
            value={selectedMonth}
            onChange={(event) => setSelectedMonth(event.target.value)}
          >
            <option value="all">All months</option>
            {months.map((month) => (
              <option key={month} value={month}>
                {toMonthLabel(month)}
              </option>
            ))}
          </select>
        </header>

        <section className={styles.summary}>
          <article className={styles.card}>
            <span className={styles.label}>Total spent</span>
            <strong className={styles.value}>
              {formatCurrency(totals.total)}
            </strong>
            <span className={styles.meta}>
              {totals.count}{" "}
              {totals.count === 1 ? "transaction" : "transactions"}
            </span>
          </article>

          <article className={styles.card}>
            <span className={styles.label}>Average per day</span>
            <strong className={styles.value}>
              {totals.average
                ? formatCurrency(totals.average)
                : formatCurrency(0)}
            </strong>
            <span className={styles.meta}>Based on active days</span>
          </article>

          <article className={styles.card}>
            <span className={styles.label}>Top category</span>
            {Object.keys(totals.byCategory).length ? (
              <>
                <strong className={styles.value}>
                  {Object.entries(totals.byCategory).sort(
                    (a, b) => b[1] - a[1]
                  )[0][0]}
                </strong>
                <span className={styles.meta}>
                  {formatCurrency(
                    Object.entries(totals.byCategory).sort(
                      (a, b) => b[1] - a[1]
                    )[0][1]
                  )}
                </span>
              </>
            ) : (
              <>
                <strong className={styles.value}>—</strong>
                <span className={styles.meta}>Add an expense to see data</span>
              </>
            )}
          </article>
        </section>

        <section className={styles.contentGrid}>
          <section className={styles.formSection}>
            <h2>Log expense</h2>
            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.field}>
                <label htmlFor="description">Description</label>
                <input
                  id="description"
                  name="description"
                  value={newExpense.description}
                  onChange={handleInputChange}
                  placeholder="Coffee with friends"
                  required
                />
              </div>

              <div className={styles.fieldGroup}>
                <div className={styles.field}>
                  <label htmlFor="amount">Amount</label>
                  <input
                    id="amount"
                    name="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={newExpense.amount}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="date">Date</label>
                  <input
                    id="date"
                    name="date"
                    type="date"
                    value={newExpense.date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <div className={styles.field}>
                  <label htmlFor="category">Category</label>
                  <select
                    id="category"
                    name="category"
                    value={newExpense.category}
                    onChange={handleInputChange}
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles.field}>
                  <label htmlFor="note">Notes</label>
                  <input
                    id="note"
                    name="note"
                    value={newExpense.note}
                    onChange={handleInputChange}
                    placeholder="Optional context"
                  />
                </div>
              </div>

              <button type="submit" className={styles.submit}>
                Add expense
              </button>
            </form>
          </section>

          <section className={styles.expenseSection}>
            <div className={styles.expenseHeader}>
              <h2>Recent activity</h2>
            </div>
            <ul className={styles.expenseList}>
              {filteredExpenses.length ? (
                filteredExpenses.map((expense) => (
                  <li key={expense.id} className={styles.expenseItem}>
                    <div>
                      <p className={styles.expenseTitle}>
                        {expense.description}
                      </p>
                      <span className={styles.expenseMeta}>
                        {toMonthLabel(formatMonthKey(expense.date))} ·{" "}
                        {expense.category}
                        {expense.note ? ` · ${expense.note}` : ""}
                      </span>
                    </div>
                    <span className={styles.expenseAmount}>
                      {formatCurrency(expense.amount)}
                    </span>
                  </li>
                ))
              ) : (
                <li className={styles.emptyState}>
                  No expenses for this selection yet.
                </li>
              )}
            </ul>
          </section>
        </section>

        <section className={styles.trendSection}>
          <h2>Monthly trend</h2>
          <div className={styles.trendGrid}>
            {monthlyTrend.map(([month, amount]) => {
              const percentage =
                monthlyTrend[0][1] === 0
                  ? 0
                  : Math.round((amount / monthlyTrend[0][1]) * 100);
              return (
                <div key={month} className={styles.trendItem}>
                  <span className={styles.trendMonth}>
                    {toMonthLabel(month)}
                  </span>
                  <div className={styles.trendBar}>
                    <div
                      className={styles.trendFill}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className={styles.trendAmount}>
                    {formatCurrency(amount)}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
