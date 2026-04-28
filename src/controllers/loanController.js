import { LoanModel } from '../models/loanModel.js';

export const LoanController = {

  async getTopBorrowers(req, res) {
    try {
      const data = await LoanModel.getTopBorrowers();
      res.status(200).json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async createLoan(req, res) {
    try {
      const loan = await LoanModel.createLoan(req.body.book_id, req.body.member_id, req.body.due_date);
      res.status(201).json({ message: "Peminjaman berhasil!", data: loan });
    } catch (err) { res.status(400).json({ error: err.message }); }
  },

  async getLoans(req, res) {
    try {
      const loans = await LoanModel.getAllLoans();
      res.json(loans);
    } catch (err) { res.status(500).json({ error: err.message }); }
  }
};