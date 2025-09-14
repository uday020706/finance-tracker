let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

const form = document.getElementById('form');
const amountInp = document.getElementById('amount');
const opt = document.getElementById('option');
const catg = document.getElementById('category');
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
        category: catg.value
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
  <td style="color: greenyellow; font-weight: bold; letter-spacing: 1px;"">${t.type === 'income' ? `${t.amount}` : ''}</td>
  <td style="color: red; font-weight: bold; letter-spacing: 1px;">${t.type === 'expense' ? `${t.amount}` : ''}</td>
  <td>${t.category.charAt(0).toUpperCase() + t.category.slice(1)}</td>
  <td><button class="delete-btn" data-index="${i}"><img src="delete.svg" alt="delete"></button></td>
`;

        tableBody.appendChild(tr);
    });
}

const categoryColors = JSON.parse(localStorage.getItem("categoryColors")) || {};

function getCategoryColor(category) {
    if (!categoryColors[category]) {
        categoryColors[category] = `hsl(${Math.random() * 360},70%,60%)`;
        localStorage.setItem("categoryColors", JSON.stringify(categoryColors));
    }
    return categoryColors[category];
}

//  updating chart 
function updateCharts() {
    const expenseTotals = {};
    transactions
        .filter(t => t.type === 'expense')
        .forEach(t => {
            expenseTotals[t.category] = (expenseTotals[t.category] || 0) + t.amount;
        });

    // Pie chart
    const pieLabels = Object.keys(expenseTotals);
    const pieData = Object.values(expenseTotals);
    const pieColors = pieLabels.map(c => getCategoryColor(c));

    if (window.pieChart instanceof Chart) {
        window.pieChart.destroy();
    }

    const pieCtx = document.getElementById("pieChart").getContext("2d");
    window.pieChart = new Chart(pieCtx, {
        type: "doughnut",
        data: {
            labels: pieLabels,
            datasets: [{
                data: pieData,
                backgroundColor: pieColors
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
    // Bar chart
    const monthlyData = {};
    const monthNames = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    monthNames.forEach(m => {
        monthlyData[m] = { income: 0, expense: 0 };
    });

    transactions.forEach(t => {
        const d = new Date(t.date);
        const monthKey = monthNames[d.getMonth()];
        if (!monthlyData[monthKey]) monthlyData[monthKey] = { income: 0, expense: 0 };
        monthlyData[monthKey][t.type] += t.amount;
    });

    const barLabels = monthNames;

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
                { label: "Income", data: incomeData, backgroundColor: "#94e052", borderRadius: "10", barThickness: "10" },
                { label: "Expense", data: expenseData, backgroundColor: "#e05269", borderRadius: "10", barThickness: "10" }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y:
                {
                    beginAtZero: true,
                    ticks: { color: "white" }
                },
                x:
                {
                    ticks: { color: "white" }
                }
            },
            plugins: {
                legend: {
                    labels: { color: "white" }
                }
            }
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

async function exportFile(transactions) {
    const { jsPDF } = window.jspdf || window.jspdfUMD;
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("Transactions Report", 10, 10);

    const rows = transactions.map(t => {
        const d = new Date(t.date);
        const formattedDate = d.getDate() + "/" + (d.getMonth() + 1) + "/" + d.getFullYear();
        return [
            formattedDate,
            t.type === 'income' ?  t.amount : '',
            t.type === 'expense' ?  t.amount : '',
            t.category.charAt(0).toUpperCase() + t.category.slice(1)
        ];
    });
    doc.autoTable({
        head: [["Date", "Credit", "Debit",  "Category"]],
        body: rows,
        startY: 25,
        styles: { fontSize: 10, halign: "center",lineColor: [200, 200, 200], 
        lineWidth: 0.2 },

        headStyles: { fillColor: [22, 160, 133] },
        alternateRowStyles: { fillColor: [240, 240, 240] },

        columnStyles: {
        1: { textColor: [0, 200, 0], fontStyle: 'bold' },
        2: { textColor: [220, 20, 60], fontStyle: 'bold' }
    }
    });

    doc.save("transactions.pdf");
}

document.getElementById('exportBtn').addEventListener("click", function () {
    exportFile(transactions)
});

setTransactions();
updateLS();
