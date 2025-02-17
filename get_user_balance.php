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

$sql = "SELECT points FROM rewards WHERE user_id='$userId'";
$result = $conn->query($sql);

$balance = 0;
if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    $balance = $row['points'];
}

echo json_encode(['balance' => $balance]);

$conn->close();
?>
