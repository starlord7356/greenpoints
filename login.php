<?php
session_start();

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

// Validate POST data
if (!isset($_POST['username']) || !isset($_POST['password'])) {
    echo "Please provide both username and password.";
    exit();
}

$loginUsername = $_POST['username'];
$loginPassword = $_POST['password'];

// Function to process login using a prepared statement
function processLogin($conn, $table, $loginUsername, $loginPassword) {
    if ($stmt = $conn->prepare("SELECT password FROM $table WHERE username = ?")) {
        $stmt->bind_param("s", $loginUsername);
        $stmt->execute();
        $stmt->store_result();
        if ($stmt->num_rows > 0) {
            $stmt->bind_result($hashedPassword);
            $stmt->fetch();
            $stmt->close();
            if (password_verify($loginPassword, $hashedPassword)) {
                return true;
            }
        } else {
            $stmt->close();
        }
    }
    return false;
}

// Check if the user is an admin
if (processLogin($conn, "admins", $loginUsername, $loginPassword)) {
    $_SESSION['username'] = $loginUsername;
    $_SESSION['role'] = 'admin';
    header("Location: admin_dashboard.html");
    exit();
}

// Check if the user is a regular user
if (processLogin($conn, "users", $loginUsername, $loginPassword)) {
    $_SESSION['username'] = $loginUsername;
    $_SESSION['role'] = 'user';
    header("Location: user_dashboard.html");
    exit();
}

echo "Login failed. Please check your username and password.";
$conn->close();
?>
