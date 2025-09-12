let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

const form = document.getElementById('form');
const amountInp = document.getElementById('amount');
const opt = document.getElementById('option');
const catg = document.getElementById('category');
const desc = document.getElementById('description');
const totalIncome = document.getElementById('total-income');
const totalExpenses = document.getElementById('total-expenses');
const balance = document.getElementById('balance');
const list = document.getElementById('transaction-list');

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

  setTr
  updateLS();
});

// render list
const tableBody = document.querySelector("#transaction-table tbody");

function setTransactions() {
  tableBody.innerHTML = '';
  transactions.forEach((t, i) => {
    const tr = document.createElement('tr');


    const today = new Date(t.date);
    const formattedDate = today.getDate() + "/" + (today.getMonth() + 1) + "/" + today.getFullYear();

    tr.innerHTML = `
      <td>${formattedDate}</td>
      <td><strong class="${t.type}">${t.type.toUpperCase()}</strong></td>
      <td>${t.category}</td>
      <td>${t.description || '-'}</td>
      <td>₹${t.amount}</td>
      <td><button class="delete-btn" data-index="${i}"><img src="delete.svg" alt="delete"></button></td>
    `;

    tableBody.appendChild(tr);
  });
}


// update totals
function updateLS() {
  const income = transactions.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0);

  const expense = transactions
    .filter(e => e.type === 'expense')
    .reduce((sum, e) => sum + e.amount, 0);

  totalIncome.textContent = income;
  totalExpenses.textContent = expense;
  balance.textContent = income - expense;
  // pie chart
  const pieChart = document.getElementById("pieChart").getContext("2d");
  new Chart(pieChart, {
    type: "pie",
    data: {
      labels: ["Income", "Expense"],
      datasets: [{
        data: [income, expense],
        backgroundColor: ["green", "red"]
      }]
    }
  });

  // bar graph
  const barChart = document.getElementById("barChart").getContext("2d");
  new Chart(barChart, {
    type: "bar",
    data: {
      labels: ["Income", "Expense"],
      datasets: [{
        label: "Amount",
        data: [income, expense],
        backgroundColor: ["green", "red"],   
        borderColor:  ["green", "red"],      
        borderWidth: 2,                            
        borderRadius: 8,                       
        barThickness: 50
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}



// delete transaction
tableBody.addEventListener("click", (e) => {
  if (e.target.classList.contains("delete-btn")) {
    const i = e.target.dataset.index;
    transactions.splice(i, 1);
    localStorage.setItem("transactions", JSON.stringify(transactions));
    setTransactions();
    updateLS();
  }
});

setTransactions();
updateLS();


