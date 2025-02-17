document.addEventListener('DOMContentLoaded', function() {
    fetch('get_user_reports.php')
        .then(response => response.json())
        .then(data => {
            const reportTableBody = document.getElementById('reportTable').getElementsByTagName('tbody')[0];
            data.reports.forEach(report => {
                const row = reportTableBody.insertRow();
                row.insertCell(0).textContent = report.center_name;
                row.insertCell(1).textContent = report.waste_type;
                row.insertCell(2).textContent = report.quantity;
            });
        })
        .catch(error => console.error('Error:', error));
});
