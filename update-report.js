// Constants for waste type points
const WASTE_POINTS = {
    plastic: 11,
    electronic: 16,
    organic: 5,
    metal: 13,
    paper: 8,
    glass: 8
};

// Initialize variables for pagination
let currentPage = 1;
const itemsPerPage = 10;
let filteredTransactions = [];

// Initialize Flatpickr for date range picker
document.addEventListener('DOMContentLoaded', function() {
    // Initialize date range picker
    flatpickr('#dateRangeFilter', {
        mode: 'range',
        dateFormat: 'Y-m-d',
        onChange: function(selectedDates) {
            applyFilters();
        }
    });

    // Load initial data
    loadTransactions();

    // Set up event listeners
    setupEventListeners();

    // Initialize toastr notifications
    toastr.options = {
        closeButton: true,
        progressBar: true,
        positionClass: 'toast-top-right',
        timeOut: 3000
    };

    // Load center name
    loadCenterName();
});

function setupEventListeners() {
    // Filter event listeners
    document.getElementById('usernameFilter').addEventListener('input', applyFilters);
    document.getElementById('wasteTypeFilter').addEventListener('change', applyFilters);
    document.getElementById('minPointsFilter').addEventListener('input', applyFilters);
    document.getElementById('maxPointsFilter').addEventListener('input', applyFilters);

    // Pagination event listeners
    document.getElementById('prevPage').addEventListener('click', () => changePage(-1));
    document.getElementById('nextPage').addEventListener('click', () => changePage(1));

    // Export button
    document.getElementById('exportBtn').addEventListener('click', exportData);

    // Edit modal events
    document.getElementById('editForm').addEventListener('submit', handleEditSubmit);
    document.getElementById('cancelEdit').addEventListener('click', closeEditModal);
    document.getElementById('editWasteType').addEventListener('change', updateEditPoints);
    document.getElementById('editQuantity').addEventListener('input', updateEditPoints);

    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
}

async function loadCenterName() {
    try {
        const response = await fetch('/api/admin/center-info');
        const data = await response.json();
        document.getElementById('centerName').textContent = data.center;
    } catch (error) {
        console.error('Error loading center name:', error);
        document.getElementById('centerName').textContent = 'Error loading center name';
    }
}

async function loadTransactions() {
    const tbody = document.getElementById('transactionsTableBody');
    tbody.innerHTML = '<tr><td colspan="7" class="px-4 py-4 text-center">Loading transactions...</td></tr>';

    try {
        const response = await fetch('/api/admin/transactions');
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch transactions');
        }
        const data = await response.json();
        if (!Array.isArray(data) || data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="px-4 py-4 text-center">No transactions found</td></tr>';
            return;
        }
        filteredTransactions = data;
        applyFilters();
    } catch (error) {
        console.error('Error loading transactions:', error);
        toastr.error(error.message || 'Failed to load transactions');
        tbody.innerHTML = '<tr><td colspan="7" class="px-4 py-4 text-center text-red-500">Error loading transactions</td></tr>';
    }
}

function displayTransactions(transactions) {
    const tbody = document.getElementById('transactionsTableBody');
    if (!transactions || transactions.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4">No transactions found</td></tr>';
        return;
    }

    let totalPoints = 0;
    const rows = transactions.map(transaction => {
        const utcDate = new Date(transaction.date);
        const istDate = new Date(utcDate.getTime() + (5.5 * 60 * 60 * 1000)); // Convert to IST by adding 5.5 hours
        const formattedDate = istDate.toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
        
        totalPoints += parseFloat(transaction.points);
        
        return `
            <tr class="border-b border-solid border-[#e7f3ec]">
                <td class="px-4 py-2 text-center">${transaction.username}</td>
                <td class="px-4 py-2 text-center">${formattedDate}</td>
                <td class="px-4 py-2 text-center">${transaction.wasteType}</td>
                <td class="px-4 py-2 text-center">${transaction.quantity} kg</td>
                <td class="px-4 py-2 text-center">${transaction.points}</td>
                <td class="px-4 py-2 text-center flex gap-2 justify-center">
                    <button onclick="editTransaction('${transaction.id}')" class="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">Edit</button>
                    <button onclick="deleteTransaction('${transaction.id}')" class="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700">Delete</button>
                </td>
            </tr>
        `;
    });

    // Add total row
    rows.push(`
        <tr class="border-t-2 border-solid border-[#e7f3ec] font-bold bg-[#f8fcfa]">
            <td class="px-4 py-2 text-center" colspan="4">Total Points</td>
            <td class="px-4 py-2 text-center">${totalPoints.toFixed(2)}</td>
            <td class="px-4 py-2"></td>
        </tr>
    `);

    tbody.innerHTML = rows.join('');
}

function applyFilters() {
    const username = document.getElementById('usernameFilter').value.toLowerCase();
    const wasteType = document.getElementById('wasteTypeFilter').value;
    const dateRange = document.getElementById('dateRangeFilter').value;
    const minPoints = document.getElementById('minPointsFilter').value;
    const maxPoints = document.getElementById('maxPointsFilter').value;

    let filtered = filteredTransactions;

    // Apply username filter
    if (username) {
        filtered = filtered.filter(t => t.username.toLowerCase().includes(username));
    }

    // Apply waste type filter
    if (wasteType) {
        filtered = filtered.filter(t => t.wasteType === wasteType);
    }

    // Apply date range filter
    if (dateRange) {
        const [start, end] = dateRange.split(' to ').map(date => new Date(date));
        filtered = filtered.filter(t => {
            const transactionDate = new Date(t.date);
            return transactionDate >= start && transactionDate <= end;
        });
    }

    // Apply points range filter
    if (minPoints) {
        filtered = filtered.filter(t => t.points >= parseInt(minPoints));
    }
    if (maxPoints) {
        filtered = filtered.filter(t => t.points <= parseInt(maxPoints));
    }

    // Update the display
    displayTransactions(filtered);
}

function displayTransactions(transactions) {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    // Group transactions by timestamp (minute precision) and username
    const groupedTransactions = {};
    transactions.forEach(transaction => {
        // Convert UTC date to IST
        const date = new Date(transaction.date);
        const istOptions = {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true,
            timeZone: 'Asia/Kolkata'
        };
        const timestamp = date.toLocaleString('en-US', istOptions);
        const key = `${timestamp}_${transaction.username}`;
        if (!groupedTransactions[key]) {
            groupedTransactions[key] = {
                timestamp,
                username: transaction.username,
                items: [],
                totalPoints: 0
            };
        }
        groupedTransactions[key].items.push(transaction);
        groupedTransactions[key].totalPoints += transaction.points;
    });

    // Convert grouped transactions to array and sort by timestamp
    const groupedArray = Object.values(groupedTransactions)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(startIndex, endIndex);

    const tbody = document.getElementById('transactionsTableBody');
    tbody.innerHTML = '';

    if (groupedArray.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="px-4 py-4 text-center">No transactions found</td></tr>';
        return;
    }

    groupedArray.forEach(group => {
        // Create a group header row
        const headerRow = document.createElement('tr');
        headerRow.className = 'bg-[#f8fcfa] border-t-2 border-[#e7f3ec]';
        headerRow.innerHTML = `
            <td colspan="6" class="px-4 py-2">
                <div class="flex justify-between items-center">
                    <span class="font-bold text-[#4e976d]">${group.username} - ${group.timestamp}</span>
                    <span class="font-bold text-[#4e976d] text-center w-full block">Total Points: ${group.totalPoints}</span>
                </div>
            </td>
        `;
        tbody.appendChild(headerRow);

        // Add individual transaction rows
        group.items.forEach(transaction => {
            const row = document.createElement('tr');
            row.className = transaction.edited ? 'bg-[#f0fff7]' : '';
            row.innerHTML = `
                <td class="px-4 py-2 text-center"></td>
                <td class="px-4 py-2 text-center"></td>
                <td class="px-4 py-2 text-center capitalize">${transaction.wasteType || 'N/A'}</td>
                <td class="px-4 py-2 text-center">${transaction.quantity || 0}</td>
                <td class="px-4 py-2 text-center">${transaction.points || 0}</td>
                <td class="px-4 py-2 text-center">
                    <button onclick='openEditModal(${JSON.stringify(transaction)})' 
                            class="text-[#4e976d] hover:text-[#19e66e] mr-2">
                        Edit
                    </button>
                    <button onclick="deleteTransaction('${transaction.id}')" 
                            class="text-red-500 hover:text-red-700">
                        Delete
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    });

    // Update pagination info
    document.getElementById('currentRange').textContent = `${startIndex + 1}-${Math.min(endIndex, Object.keys(groupedTransactions).length)}`;
    document.getElementById('totalEntries').textContent = Object.keys(groupedTransactions).length;

    // Update pagination buttons
    document.getElementById('prevPage').disabled = currentPage === 1;
    document.getElementById('nextPage').disabled = endIndex >= Object.keys(groupedTransactions).length;
}

function changePage(delta) {
    currentPage += delta;
    applyFilters();
}

function openEditModal(transaction) {
    document.getElementById('editModal').classList.remove('hidden');
    document.getElementById('editTransactionId').value = transaction.id;
    document.getElementById('editWasteType').value = transaction.wasteType;
    document.getElementById('editQuantity').value = transaction.quantity;
    updateEditPoints();
}

function closeEditModal() {
    document.getElementById('editModal').classList.add('hidden');
}

function updateEditPoints() {
    const wasteType = document.getElementById('editWasteType').value;
    const quantity = parseFloat(document.getElementById('editQuantity').value) || 0;
    const points = WASTE_POINTS[wasteType] * quantity;
    document.getElementById('editPoints').value = points.toFixed(2);
}

async function handleEditSubmit(event) {
    event.preventDefault();

    const transactionId = document.getElementById('editTransactionId').value;
    const wasteType = document.getElementById('editWasteType').value;
    const quantity = parseFloat(document.getElementById('editQuantity').value);
    const points = parseFloat(document.getElementById('editPoints').value);

    try {
        const response = await fetch(`/api/admin/transactions/${transactionId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                wasteType,
                quantity,
                points
            })
        });

        if (response.ok) {
            toastr.success('Transaction updated successfully');
            closeEditModal();
            loadTransactions(); // Reload the table
        } else {
            throw new Error('Failed to update transaction');
        }
    } catch (error) {
        console.error('Error updating transaction:', error);
        toastr.error('Failed to update transaction');
    }
}

function exportData() {
    const data = filteredTransactions.map(t => ({
        Username: t.username,
        'Date/Time': new Date(t.date).toLocaleString(),
        'Waste Type': t.wasteType,
        'Quantity (kg)': t.quantity,
        Points: t.points
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');

    // Generate filename with current date
    const date = new Date().toISOString().split('T')[0];
    const fileName = `transactions_${date}.xlsx`;

    XLSX.writeFile(workbook, fileName);
}

async function deleteTransaction(transactionId) {
    if (!confirm('Are you sure you want to delete this transaction? This action cannot be undone.')) {
        return;
    }

    try {
        const response = await fetch(`/api/admin/transactions/${transactionId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });

        const data = await response.json();

        if (response.ok) {
            toastr.success(data.message || 'Transaction deleted successfully');
            loadTransactions(); // Reload the table
        } else {
            toastr.error(data.message || 'Failed to delete transaction');
        }
    } catch (error) {
        console.error('Error deleting transaction:', error);
        toastr.error('Failed to connect to the server. Please try again.');
    }
}

function handleLogout() {
    // Clear session/local storage
    localStorage.removeItem('adminToken');
    // Redirect to login page
    window.location.href = 'index.html';
}