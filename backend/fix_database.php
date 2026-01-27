<?php

// Load .env file manually
$env_file = __DIR__ . '/.env';
if (file_exists($env_file)) {
    $lines = file($env_file);
    foreach ($lines as $line) {
        $line = trim($line);
        if (!empty($line) && !str_starts_with($line, '#')) {
            if (str_contains($line, '=')) {
                [$key, $value] = explode('=', $line, 2);
                $_ENV[trim($key)] = trim($value);
            }
        }
    }
}

try {
    $host = $_ENV['DB_HOST'] ?? '127.0.0.1';
    $user = $_ENV['DB_USERNAME'] ?? 'root';
    $pass = $_ENV['DB_PASSWORD'] ?? '';
    $database = $_ENV['DB_DATABASE'] ?? 'arabicwebsite_db';
    
    // Connect to MySQL
    $mysqli = new mysqli($host, $user, $pass, $database);
    
    if ($mysqli->connect_error) {
        die("Connection failed: " . $mysqli->connect_error);
    }
    
    echo "Connected to database: " . $database . "\n\n";
    
    // Check if role column exists
    $result = $mysqli->query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='users' AND COLUMN_NAME='role'");
    
    if ($result->num_rows == 0) {
        echo "Adding role column to users table...\n";
        if ($mysqli->query("ALTER TABLE users ADD COLUMN role VARCHAR(255) NOT NULL DEFAULT 'user' AFTER password")) {
            echo "✓ Role column added successfully!\n";
        } else {
            echo "✗ Error adding role column: " . $mysqli->error . "\n";
        }
    } else {
        echo "✓ Role column already exists!\n";
    }
    
    // Check and add other required columns
    $result = $mysqli->query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='users'");
    $columnNames = [];
    while ($row = $result->fetch_assoc()) {
        $columnNames[] = $row['COLUMN_NAME'];
    }
    
    if (!in_array('email_verified_at', $columnNames)) {
        echo "Adding email_verified_at column...\n";
        if (!$mysqli->query("ALTER TABLE users ADD COLUMN email_verified_at TIMESTAMP NULL AFTER email")) {
            echo "✗ Error: " . $mysqli->error . "\n";
        }
    }
    
    if (!in_array('remember_token', $columnNames)) {
        echo "Adding remember_token column...\n";
        if (!$mysqli->query("ALTER TABLE users ADD COLUMN remember_token VARCHAR(100) NULL")) {
            echo "✗ Error: " . $mysqli->error . "\n";
        }
    }
    
    echo "\n✓ Database structure is ready!\n";
    $mysqli->close();
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}
