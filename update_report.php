<?php
$servername = "localhost";
$username = "root";
$password = "password";
$dbname = "gpkeralanew";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Get the posted data
$postData = file_get_contents("php://input");
$request = json_decode($postData, true);

$reportId = $request['reportId'];
$centerName = $request['centerName'];
$wasteType = $request['wasteType'];
$quantity = $request['quantity'];

// Update the report in the database
$sql = "UPDATE waste_reports SET center_name='$centerName', waste_type='$wasteType', quantity='$quantity' WHERE id='$reportId'";

if ($conn->query($sql) === TRUE) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'error' => $conn->error]);
}

$conn->close();
?>
