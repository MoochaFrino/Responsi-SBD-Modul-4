import { pool } from '../config/db.js';

export const LoanModel = {

  async getTopBorrowers() {
    const query = `
      SELECT 
          m.id, 
          m.full_name, 
          m.email, 
          m.member_type,
          m.joined_at,
          CAST(COUNT(l.id) AS INTEGER) AS total_loans,
          MAX(l.loan_date) AS last_loan_date,
          (
              SELECT b.title
              FROM loans l2
              JOIN books b ON l2.book_id = b.id
              WHERE l2.member_id = m.id
              GROUP BY b.title
              ORDER BY COUNT(l2.id) DESC, b.title ASC
              LIMIT 1
          ) AS favorite_book
      FROM members m
      JOIN loans l ON m.id = l.member_id
      GROUP BY m.id
      ORDER BY total_loans DESC, last_loan_date DESC
      LIMIT 3;
    `;
    const result = await pool.query(query);
    return result.rows;
  },

  async createLoan(book_id, member_id, due_date) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const bookCheck = await client.query('SELECT available_copies FROM books WHERE id = $1', [book_id]);
      if (bookCheck.rows[0].available_copies <= 0) throw new Error('Stok habis.');
      await client.query('UPDATE books SET available_copies = available_copies - 1 WHERE id = $1', [book_id]);
      const res = await client.query('INSERT INTO loans (book_id, member_id, due_date) VALUES ($1, $2, $3) RETURNING *', [book_id, member_id, due_date]);
      await client.query('COMMIT');
      return res.rows[0];
    } catch (e) { await client.query('ROLLBACK'); throw e; } finally { client.release(); }
  },

  async getAllLoans() {
    const res = await pool.query('SELECT l.*, b.title as book_title, m.full_name as member_name FROM loans l JOIN books b ON l.book_id = b.id JOIN members m ON l.member_id = m.id');
    return res.rows;
  }
};