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

$sql = "SELECT users.id as user_id, users.username, rewards.points FROM rewards JOIN users ON rewards.user_id = users.id ORDER BY rewards.points DESC";
$result = $conn->query($sql);

$leaderboards = [];
if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $leaderboards[] = $row;
    }
}

echo json_encode(['leaderboards' => $leaderboards]);

$conn->close();
?>
