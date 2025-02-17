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

$userId = $request['userId'];
$centerName = $request['centerName'];
$wasteTypes = $request['wasteTypes'];
$quantities = $request['quantities'];

// Insert the report into the database
$success = true;
for ($i = 0; $i < count($wasteTypes); $i++) {
    $wasteType = $wasteTypes[$i];
    $quantity = $quantities[$i];
    $sql = "INSERT INTO waste_reports (user_id, center_name, waste_type, quantity) VALUES ('$userId', '$centerName', '$wasteType', '$quantity')";
    if ($conn->query($sql) !== TRUE) {
        $success = false;
        break;
    }
}

echo json_encode(['success' => $success]);

$conn->close();
?>
