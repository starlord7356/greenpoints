document.addEventListener('DOMContentLoaded', function() {
    fetch('get_users.php')
        .then(response => response.json())
        .then(data => {
            const userIdSelect = document.getElementById('userId');
            data.users.forEach(user => {
                const option = document.createElement('option');
                option.value = user.id;
                option.textContent = user.username;
                userIdSelect.appendChild(option);
            });
        })
        .catch(error => console.error('Error:', error));

    document.getElementById('addReportForm').addEventListener('submit', function(event) {
        event.preventDefault();
        
        const userId = document.getElementById('userId').value;
        const centerName = document.getElementById('centerName').value;
        const wasteTypes = Array.from(document.getElementsByName('wasteTypes[]')).map(select => select.value);
        const quantities = Array.from(document.getElementsByName('quantities[]')).map(input => input.value);
        const totalGreenPoints = calculateTotalGreenPoints(wasteTypes, quantities);

        fetch('add_report.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId, centerName, wasteTypes, quantities, totalGreenPoints })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Report added successfully');
            } else {
                alert('Failed to add report');
            }
        })
        .catch(error => console.error('Error:', error));
    });

    // Set the center name based on the admin's username
    const username = document.getElementById('username').value;
    const centerNameMap = {
        'gpkerala1': 'Thiruvananthapuram',
        'gpkerala2': 'Kollam',
        'gpkerala3': 'Pathanamthitta',
        'gpkerala4': 'Alappuzha',
        'gpkerala5': 'Kottayam',
        'gpkerala6': 'Idukki',
        'gpkerala7': 'Ernakulam',
        'gpkerala8': 'Thrissur',
        'gpkerala9': 'Palakkad',
        'gpkerala10': 'Malappuram',
        'gpkerala11': 'Kozhikode',
        'gpkerala12': 'Wayanad',
        'gpkerala13': 'Kannur',
        'gpkerala14': 'Kasaragod'
    };
    document.getElementById('centerName').value = centerNameMap[username];
});

function addWasteType() {
    const container = document.getElementById('wasteTypesContainer');
    const div = document.createElement('div');
    const select = document.createElement('select');
    select.name = 'wasteTypes[]';
    select.required = true;
    select.innerHTML = `
        <option value="Plastic Waste">Plastic Waste – 10 GP/kg</option>
        <option value="Paper Waste">Paper Waste – 6 GP/kg</option>
        <option value="Glass Waste">Glass Waste – 3 GP/kg</option>
        <option value="Metal Waste">Metal Waste – 15 GP/kg</option>
        <option value="E-Waste">E-Waste (Electronics) – 25 GP/kg</option>
        <option value="Food Waste">Food Waste – 2 GP/kg</option>
        <option value="Garden Waste">Garden Waste – 3 GP/kg</option>
        <option value="Batteries">Batteries – 30 GP/kg</option>
        <option value="Medical Waste">Medical Waste – 50 GP/kg</option>
        <option value="Chemical Waste">Chemical Waste – 40 GP/kg</option>
        <option value="Tyres/Rubber Waste">Tyres/Rubber Waste – 5 GP/kg</option>
        <option value="Textile Waste">Textile Waste – 8 GP/kg</option>
    `;
    const input = document.createElement('input');
    input.type = 'number';
    input.name = 'quantities[]';
    input.placeholder = 'Quantity (kg)';
    input.required = true;
    input.addEventListener('input', updateTotalGreenPoints);
    div.appendChild(select);
    div.appendChild(input);
    container.appendChild(div);
}

function calculateTotalGreenPoints(wasteTypes, quantities) {
    const pointsPerKg = {
        'Plastic Waste': 10,
        'Paper Waste': 6,
        'Glass Waste': 3,
        'Metal Waste': 15,
        'E-Waste': 25,
        'Food Waste': 2,
        'Garden Waste': 3,
        'Batteries': 30,
        'Medical Waste': 50,
        'Chemical Waste': 40,
        'Tyres/Rubber Waste': 5,
        'Textile Waste': 8
    };
    let totalPoints = 0;
    for (let i = 0; i < wasteTypes.length; i++) {
        totalPoints += pointsPerKg[wasteTypes[i]] * (parseFloat(quantities[i]) || 0);
    }
    document.getElementById('totalGreenPoints').textContent = `Total GreenPoints: ${totalPoints}`;
    return totalPoints;
}
function updateTotalGreenPoints() {
    const wasteTypes = Array.from(document.getElementsByName('wasteTypes[]')).map(select => select.value);
    const quantities = Array.from(document.getElementsByName('quantities[]')).map(input => input.value);
    calculateTotalGreenPoints(wasteTypes, quantities);
}
