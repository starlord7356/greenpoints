document.addEventListener('DOMContentLoaded', function() {
    fetch('get_reports.php')
        .then(response => response.json())
        .then(data => {
            const reportsTableBody = document.getElementById('reportsTable').getElementsByTagName('tbody')[0];
            data.reports.forEach(report => {
                const row = reportsTableBody.insertRow();
                row.insertCell(0).textContent = report.user_id;
                row.insertCell(1).textContent = report.center_name;
                row.insertCell(2).textContent = report.waste_type;
                row.insertCell(3).textContent = report.quantity;
                const actionsCell = row.insertCell(4);
                const editButton = document.createElement('button');
                editButton.textContent = 'Edit';
                editButton.onclick = () => editReport(report.id);
                actionsCell.appendChild(editButton);
                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete';
                deleteButton.onclick = () => deleteReport(report.id);
                actionsCell.appendChild(deleteButton);
            });
        })
        .catch(error => console.error('Error:', error));
});

function editReport(reportId) {
    const centerName = prompt('Enter new center name:');
    const wasteType = prompt('Enter new waste type:');
    const quantity = prompt('Enter new quantity:');
    if (centerName && wasteType && quantity) {
        fetch('update_report.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ reportId, centerName, wasteType, quantity })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Report updated successfully');
                location.reload();
            } else {
                alert('Failed to update report');
            }
        })
        .catch(error => console.error('Error:', error));
    }
}

function deleteReport(reportId) {
    if (confirm('Are you sure you want to delete this report?')) {
        fetch('delete_report.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ reportId })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Report deleted successfully');
                location.reload();
            } else {
                alert('Failed to delete report');
            }
        })
        .catch(error => console.error('Error:', error));
    }
}
