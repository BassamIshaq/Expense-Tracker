import React, { useState } from "react";
import axios from "axios";

const AddExpenseForm = ({ onAdd }) => {
  const [form, setForm] = useState({
    amount: "",
    category: "",
    description: "",
    date: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await axios.post("/api/expenses", form);
    onAdd(res.data);
    setForm({ amount: "", category: "", description: "", date: "" });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="amount"
        value={form.amount}
        onChange={handleChange}
        placeholder="Amount"
        type="number"
        required
      />
      <input
        name="category"
        value={form.category}
        onChange={handleChange}
        placeholder="Category"
        required
      />
      <input
        name="description"
        value={form.description}
        onChange={handleChange}
        placeholder="Description"
      />
      <input
        name="date"
        value={form.date}
        onChange={handleChange}
        type="date"
        required
      />
      <button type="submit">Add Expense</button>
    </form>
  );
};

export default AddExpenseForm;
