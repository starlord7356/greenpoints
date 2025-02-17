document.addEventListener('DOMContentLoaded', function() {
    fetch('get_leaderboards.php')
        .then(response => response.json())
        .then(data => {
            const leaderboardTableBody = document.getElementById('leaderboardTable').getElementsByTagName('tbody')[0];
            data.leaderboards.forEach(entry => {
                const row = leaderboardTableBody.insertRow();
                row.insertCell(0).textContent = entry.user_id;
                row.insertCell(1).textContent = entry.username;
                row.insertCell(2).textContent = entry.points;
            });
        })
        .catch(error => console.error('Error:', error));
});
