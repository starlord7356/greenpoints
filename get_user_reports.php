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

// Assuming the user is logged in and their user ID is stored in the session
session_start();
$userId = $_SESSION['user_id'];

$sql = "SELECT center_name, waste_type, quantity FROM waste_reports WHERE user_id='$userId'";
$result = $conn->query($sql);

$reports = [];
if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $reports[] = $row;
    }
}

echo json_encode(['reports' => $reports]);

$conn->close();
?>
