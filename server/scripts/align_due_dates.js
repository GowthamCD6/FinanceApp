const { query } = require('../src/config/database');

const formatDateStr = (d) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

async function alignDates() {
  console.log('Aligning installment dates to local dates...');

  // 1. Weekly loan 30001 (Test Borrower Automated) - 10 weekly installments starting 2026-09-20
  for (let i = 1; i <= 10; i++) {
    const d = new Date(2026, 8, 20);
    d.setDate(d.getDate() + (i - 1) * 7);
    const dateStr = formatDateStr(d);
    await query('UPDATE loan_installments SET due_date = ? WHERE loan_id = 30001 AND installment_number = ?', [dateStr, i]);
  }

  // 2. Weekly loan 30002 (Testing) - 10 weekly installments starting 2026-09-20
  for (let i = 1; i <= 10; i++) {
    const d = new Date(2026, 8, 20);
    d.setDate(d.getDate() + (i - 1) * 7);
    const dateStr = formatDateStr(d);
    await query('UPDATE loan_installments SET due_date = ? WHERE loan_id = 30002 AND installment_number = ?', [dateStr, i]);
  }

  // 3. Weekly loan 90001 (Ramesh Krishnan) - 8 weekly installments starting 2026-09-20
  for (let i = 1; i <= 8; i++) {
    const d = new Date(2026, 8, 20);
    d.setDate(d.getDate() + (i - 1) * 7);
    const dateStr = formatDateStr(d);
    await query('UPDATE loan_installments SET due_date = ? WHERE loan_id = 90001 AND installment_number = ?', [dateStr, i]);
  }

  // 4. Weekly loan 90002 (Ramesh Krishnan) - 8 weekly installments starting 2026-09-20
  for (let i = 1; i <= 8; i++) {
    const d = new Date(2026, 8, 20);
    d.setDate(d.getDate() + (i - 1) * 7);
    const dateStr = formatDateStr(d);
    await query('UPDATE loan_installments SET due_date = ? WHERE loan_id = 90002 AND installment_number = ?', [dateStr, i]);
  }

  // 5. Monthly loan 60002 (Testing2) - 12 monthly installments starting 2026-09-20
  for (let i = 1; i <= 12; i++) {
    const d = new Date(2026, 8, 20);
    d.setMonth(d.getMonth() + (i - 1));
    const dateStr = formatDateStr(d);
    await query('UPDATE loan_installments SET due_date = ? WHERE loan_id = 60002 AND installment_number = ?', [dateStr, i]);
  }

  // 6. Daily loan 60001 (Testing1) - installment 4 is 2026-09-20 (today)
  await query("UPDATE loan_installments SET due_date = '2026-09-20' WHERE loan_id = 60001 AND installment_number = 4");

  console.log('Installment dates aligned successfully!');

  const checkToday = await query("SELECT count(*) as count FROM loan_installments WHERE due_date = '2026-09-20'");
  console.log('Installments due TODAY (2026-09-20):', checkToday[0].count);

  const checkWeek = await query("SELECT count(*) as count FROM loan_installments WHERE due_date BETWEEN '2026-09-14' AND '2026-09-20'");
  console.log('Installments due THIS WEEK (2026-09-14 to 2026-09-20):', checkWeek[0].count);

  const checkMonth = await query("SELECT count(*) as count FROM loan_installments WHERE due_date BETWEEN '2026-09-01' AND '2026-09-30'");
  console.log('Installments due THIS MONTH (2026-09-01 to 2026-09-30):', checkMonth[0].count);

  process.exit(0);
}

alignDates().catch((err) => {
  console.error(err);
  process.exit(1);
});
