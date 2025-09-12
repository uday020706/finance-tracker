let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

const form = document.getElementById('form');
const amountInp = document.getElementById('amount');
const opt = document.getElementById('option');
const catg = document.getElementById('category');
const desc = document.getElementById('description');
const totalIncome = document.getElementById('total-income');
const totalExpenses = document.getElementById('total-expenses');
const balance = document.getElementById('balance');

const tableBody = document.querySelector("#transaction-table tbody");


form.addEventListener("submit", (e) => {
  e.preventDefault();

  const transaction = {
    id: Date.now(),
    date: new Date(),
    type: opt.value,
    amount: +amountInp.value,
    category: catg.value,
    description: desc.value,
  };

  transactions.push(transaction);
  localStorage.setItem("transactions", JSON.stringify(transactions));
  form.reset();

  setTransactions();
  updateLS();
});


function setTransactions() {
  tableBody.innerHTML = '';
  transactions.forEach((t, i) => {
    const tr = document.createElement('tr');

    const today = new Date(t.date);
    const formattedDate = today.getDate() + "/" + (today.getMonth() + 1) + "/" + today.getFullYear();

    tr.innerHTML = `
      <td>${formattedDate}</td>
      <td><strong class="${t.type}">${t.type.toUpperCase()}</strong></td>
      <td>${t.category.charAt(0).toUpperCase() + t.category.slice(1)}</td>
      <td>${t.description.charAt(0).toUpperCase() + t.description.slice(1) || '-'}</td>
      <td>₹${t.amount}</td>
      <td><button class="delete-btn" data-index="${i}"><img src="delete.svg" alt="delete"></button></td>
    `;

    tableBody.appendChild(tr);
  });
}

const categoryColors = {};

function getCategoryColor(category) {
  if (!categoryColors[category]) {
    categoryColors[category] = `hsl(${Math.random() * 360},70%,60%)`;
  }
  return categoryColors[category];
}

//  updating chart 
function updateCharts() {
  // Pie chart
  const expenseCategories = {};
  transactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      expenseCategories[t.category] = (expenseCategories[t.category] || 0) + t.amount;
    });

  const pieLabels = Object.keys(expenseCategories);
  const pieData = Object.values(expenseCategories);
  const pieColors = pieLabels.map(c => getCategoryColor(c));

  if (window.pieChart instanceof Chart) {
    window.pieChart.destroy();
  }

  const pieCtx = document.getElementById("pieChart").getContext("2d");
  window.pieChart = new Chart(pieCtx, {
    type: "pie",
    data: {
      labels: pieLabels,
      datasets: [{
        data: pieData,
        backgroundColor: pieColors
      }]
    }
  });
  // Bar chart
  const monthlyData = {};
  transactions.forEach(t => {
    const d = new Date(t.date);
    const month = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
    if (!monthlyData[month]) monthlyData[month] = { income: 0, expense: 0 };
    monthlyData[month][t.type] += t.amount;
  });

  const barLabels = Object.keys(monthlyData).sort();
  const incomeData = barLabels.map(m => monthlyData[m].income);
  const expenseData = barLabels.map(m => monthlyData[m].expense);

  if (window.barChart instanceof Chart) {
    window.barChart.destroy();
  }

  const barCtx = document.getElementById("barChart").getContext("2d");
  window.barChart = new Chart(barCtx, {
    type: "bar",
    data: {
      labels: barLabels,
      datasets: [
        { label: "Income", data: incomeData, backgroundColor: "green", borderRadius:"10", barThickness:"30" },
        { label: "Expense", data: expenseData, backgroundColor: "red", borderRadius:"10", barThickness:"30"  }
      ]
    },
    options: {
      responsive: true,
      scales: { y: { beginAtZero: true } }
    }
  });
}



//  updating local storage 
function updateLS() {
  const income = transactions
    .filter(e => e.type === 'income')
    .reduce((sum, e) => sum + e.amount, 0);

  const expense = transactions
    .filter(e => e.type === 'expense')
    .reduce((sum, e) => sum + e.amount, 0);

  totalIncome.textContent = income;
  totalExpenses.textContent = expense;
  balance.textContent = income - expense;

  updateCharts();
}


tableBody.addEventListener("click", (e) => {
  if (e.target.closest(".delete-btn")) {
    const i = e.target.closest(".delete-btn").dataset.index;
    transactions.splice(i, 1);
    localStorage.setItem("transactions", JSON.stringify(transactions));
    setTransactions();
    updateLS();
  }
});


setTransactions();
updateLS();
