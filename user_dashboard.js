document.addEventListener('DOMContentLoaded', function() {
    fetch('get_user_balance.php')
        .then(response => response.json())
        .then(data => {
            document.getElementById('greenpointsBalance').textContent = `GreenPoints: ${data.balance}`;
        })
        .catch(error => console.error('Error:', error));
});
