const API_URL = "http://localhost:8000";


// ====================
// GLOBAL VARIABLES
// ====================

let token = localStorage.getItem("token");

let editingExpenseId = null;


// ====================
// AUTH UI
// ====================

function showRegister() {

    document.getElementById("login-section").style.display = "none";

    document.getElementById("register-section").style.display = "block";
}


function showLogin() {

    document.getElementById("register-section").style.display = "none";

    document.getElementById("login-section").style.display = "block";
}


// ====================
// REGISTER
// ====================

async function register() {

    const name =
        document.getElementById("register-name").value;

    const email =
        document.getElementById("register-email").value;

    const password =
        document.getElementById("register-password").value;


    try {

        const response = await fetch(
            `${API_URL}/auth/register`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    name: name,
                    email: email,
                    password: password
                })
            }
        );


        const data = await response.json();


        if (!response.ok) {

            alert(
                data.detail || "Registration failed"
            );

            return;
        }


        alert(
            "Registration successful! Please login."
        );


        document.getElementById(
            "register-name"
        ).value = "";

        document.getElementById(
            "register-email"
        ).value = "";

        document.getElementById(
            "register-password"
        ).value = "";


        showLogin();

    } catch (error) {

        console.error(error);

        alert(
            "Unable to connect to the server."
        );
    }
}


// ====================
// LOGIN
// ====================

async function login() {

    const email =
        document.getElementById("login-email").value;

    const password =
        document.getElementById("login-password").value;


    const formData = new URLSearchParams();

    formData.append("username", email);

    formData.append("password", password);


    try {

        const response = await fetch(
            `${API_URL}/auth/login`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/x-www-form-urlencoded"
                },

                body: formData
            }
        );


        const data = await response.json();


        if (!response.ok) {

            alert(
                data.detail || "Login failed"
            );

            return;
        }


        // Store JWT

        token = data.access_token;

        localStorage.setItem(
            "token",
            token
        );


        // Clear login form

        document.getElementById(
            "login-email"
        ).value = "";

        document.getElementById(
            "login-password"
        ).value = "";


        showDashboard();

        await loadDashboard();

    } catch (error) {

        console.error(error);

        alert(
            "Unable to connect to the server."
        );
    }
}


// ====================
// LOGOUT
// ====================

function logout() {

    localStorage.removeItem("token");

    token = null;

    editingExpenseId = null;


    document.getElementById(
        "dashboard"
    ).style.display = "none";


    document.getElementById(
        "auth-container"
    ).style.display = "block";


    showLogin();
}


// ====================
// SHOW DASHBOARD
// ====================

function showDashboard() {

    document.getElementById(
        "auth-container"
    ).style.display = "none";


    document.getElementById(
        "dashboard"
    ).style.display = "block";
}


// ====================
// LOAD DASHBOARD
// ====================

async function loadDashboard() {

    await loadExpenses();

    await loadSummary();
}


// ====================
// GET ALL EXPENSES
// ====================

async function loadExpenses() {

    try {

        const response = await fetch(
            `${API_URL}/expenses/`,
            {
                method: "GET",

                headers: {
                    "Authorization":
                        `Bearer ${token}`
                }
            }
        );


        if (response.status === 401) {

            logout();

            return;
        }


        const expenses =
            await response.json();


        displayExpenses(expenses);

    } catch (error) {

        console.error(error);

        alert(
            "Unable to load expenses."
        );
    }
}


// ====================
// DISPLAY EXPENSES
// ====================

function displayExpenses(expenses) {

    const expenseList =
        document.getElementById(
            "expense-list"
        );


    expenseList.innerHTML = "";


    if (expenses.length === 0) {

        expenseList.innerHTML =
            "<p>No expenses yet.</p>";

        return;
    }


    expenses.forEach(expense => {

        const expenseItem =
            document.createElement("div");


        expenseItem.className =
            "expense-item";


        expenseItem.innerHTML = `

            <div class="expense-details">

                <h3>
                    ₹${Number(expense.amount).toFixed(2)}
                </h3>

                <strong>
                    ${expense.category}
                </strong>

                <p>
                    ${expense.description || "No description"}
                </p>

                <small>
                    ${expense.expense_date}
                </small>

            </div>


            <div class="expense-actions">

                <button
                    onclick="editExpense(${expense.id})"
                >
                    Edit
                </button>


                <button
                    onclick="deleteExpense(${expense.id})"
                >
                    Delete
                </button>

            </div>

        `;


        expenseList.appendChild(
            expenseItem
        );

    });
}


// ====================
// ADD EXPENSE
// ====================

async function addExpense() {

    const amount =
        document.getElementById(
            "amount"
        ).value;

    const category =
        document.getElementById(
            "category"
        ).value;

    const description =
        document.getElementById(
            "description"
        ).value;

    const expenseDate =
        document.getElementById(
            "expense-date"
        ).value;


    try {

        const response = await fetch(
            `${API_URL}/expenses/`,
            {
                method: "POST",

                headers: {

                    "Content-Type":
                        "application/json",

                    "Authorization":
                        `Bearer ${token}`
                },

                body: JSON.stringify({

                    amount:
                        parseFloat(amount),

                    category:
                        category,

                    description:
                        description,

                    expense_date:
                        expenseDate
                })
            }
        );


        const data =
            await response.json();


        if (response.status === 401) {

            logout();

            return;
        }


        if (!response.ok) {

            alert(
                data.detail ||
                "Failed to add expense"
            );

            return;
        }


        clearExpenseForm();


        await loadDashboard();

    } catch (error) {

        console.error(error);

        alert(
            "Unable to connect to the server."
        );
    }
}


// ====================
// GET ONE EXPENSE
// ====================

async function editExpense(expenseId) {

    try {

        const response = await fetch(
            `${API_URL}/expenses/${expenseId}`,
            {
                method: "GET",

                headers: {
                    "Authorization":
                        `Bearer ${token}`
                }
            }
        );


        if (response.status === 401) {

            logout();

            return;
        }


        if (!response.ok) {

            alert(
                "Failed to load expense."
            );

            return;
        }


        const expense =
            await response.json();


        // Fill form with existing data

        document.getElementById(
            "amount"
        ).value = expense.amount;


        document.getElementById(
            "category"
        ).value = expense.category;


        document.getElementById(
            "description"
        ).value =
            expense.description || "";


        document.getElementById(
            "expense-date"
        ).value =
            expense.expense_date;


        // Store ID

        editingExpenseId =
            expenseId;


        // Change form UI

        document.getElementById(
            "expense-form-title"
        ).innerText =
            "Edit Expense";


        document.getElementById(
            "expense-submit"
        ).innerText =
            "Update Expense";


        document.getElementById(
            "cancel-edit"
        ).style.display =
            "inline-block";


        // Scroll to form

        document.getElementById(
            "expense-form"
        ).scrollIntoView({
            behavior: "smooth"
        });

    } catch (error) {

        console.error(error);

        alert(
            "Unable to load expense."
        );
    }
}


// ====================
// UPDATE EXPENSE
// ====================

async function updateExpense() {

    const amount =
        document.getElementById(
            "amount"
        ).value;

    const category =
        document.getElementById(
            "category"
        ).value;

    const description =
        document.getElementById(
            "description"
        ).value;

    const expenseDate =
        document.getElementById(
            "expense-date"
        ).value;


    try {

        const response = await fetch(
            `${API_URL}/expenses/${editingExpenseId}`,
            {
                method: "PUT",

                headers: {

                    "Content-Type":
                        "application/json",

                    "Authorization":
                        `Bearer ${token}`
                },

                body: JSON.stringify({

                    amount:
                        parseFloat(amount),

                    category:
                        category,

                    description:
                        description,

                    expense_date:
                        expenseDate
                })
            }
        );


        const data =
            await response.json();


        if (response.status === 401) {

            logout();

            return;
        }


        if (!response.ok) {

            alert(
                data.detail ||
                "Failed to update expense"
            );

            return;
        }


        clearExpenseForm();


        await loadDashboard();

    } catch (error) {

        console.error(error);

        alert(
            "Unable to update expense."
        );
    }
}


// ====================
// HANDLE ADD / UPDATE
// ====================

function handleExpenseSubmit() {

    if (editingExpenseId !== null) {

        updateExpense();

    } else {

        addExpense();
    }
}


// ====================
// CANCEL EDIT
// ====================

function cancelEdit() {

    clearExpenseForm();
}


// ====================
// DELETE EXPENSE
// ====================

async function deleteExpense(expenseId) {

    const confirmed = confirm(
        "Are you sure you want to delete this expense?"
    );


    if (!confirmed) {
        return;
    }


    try {

        const response = await fetch(
            `${API_URL}/expenses/${expenseId}`,
            {
                method: "DELETE",

                headers: {
                    "Authorization":
                        `Bearer ${token}`
                }
            }
        );


        const data =
            await response.json();


        if (response.status === 401) {

            logout();

            return;
        }


        if (!response.ok) {

            alert(
                data.detail ||
                "Failed to delete expense"
            );

            return;
        }


        await loadDashboard();

    } catch (error) {

        console.error(error);

        alert(
            "Unable to delete expense."
        );
    }
}


// ====================
// LOAD SUMMARY
// ====================

async function loadSummary() {

    try {

        const response = await fetch(
            `${API_URL}/expenses/summary`,
            {
                method: "GET",

                headers: {
                    "Authorization":
                        `Bearer ${token}`
                }
            }
        );


        if (response.status === 401) {

            logout();

            return;
        }


        if (!response.ok) {

            return;
        }


        const summary =
            await response.json();


        document.getElementById(
            "total-expenses"
        ).innerText =
            summary.total_expenses;


        document.getElementById(
            "total-amount"
        ).innerText =
            `₹${Number(
                summary.total_amount
            ).toFixed(2)}`;

    } catch (error) {

        console.error(error);
    }
}


// ====================
// CLEAR FORM
// ====================

function clearExpenseForm() {

    document.getElementById(
        "amount"
    ).value = "";


    document.getElementById(
        "category"
    ).value = "";


    document.getElementById(
        "description"
    ).value = "";


    document.getElementById(
        "expense-date"
    ).value = "";


    editingExpenseId = null;


    document.getElementById(
        "expense-form-title"
    ).innerText =
        "Add Expense";


    document.getElementById(
        "expense-submit"
    ).innerText =
        "Add Expense";


    document.getElementById(
        "cancel-edit"
    ).style.display =
        "none";
}


// ====================
// INITIAL PAGE LOAD
// ====================

window.onload = function () {

    if (token) {

        showDashboard();

        loadDashboard();

    } else {

        document.getElementById(
            "dashboard"
        ).style.display =
            "none";

        document.getElementById(
            "auth-container"
        ).style.display =
            "block";

        showLogin();
    }
};