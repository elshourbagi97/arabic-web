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
        die("✗ Connection failed: " . $mysqli->connect_error . "\n");
    }
    
    echo "✓ Connected to database: " . $database . "\n\n";
    
    // First, check the current table structure
    $result = $mysqli->query("DESCRIBE users");
    echo "Current users table structure:\n";
    while ($row = $result->fetch_assoc()) {
        echo "  - " . $row['Field'] . " (" . $row['Type'] . ")\n";
    }
    echo "\n";
    
    // Check if role column exists
    $result = $mysqli->query("DESCRIBE users");
    $hasRole = false;
    while ($row = $result->fetch_assoc()) {
        if ($row['Field'] == 'role') {
            $hasRole = true;
            break;
        }
    }
    
    if (!$hasRole) {
        echo "⚠ Adding role column to users table...\n";
        
        // Get the columns to determine insert position
        $result = $mysqli->query("DESCRIBE users");
        $columns = [];
        while ($row = $result->fetch_assoc()) {
            $columns[] = $row['Field'];
        }
        
        // Just add at the end - MySQL doesn't support BEFORE/AFTER syntax in standard way
        $sql = "ALTER TABLE users ADD COLUMN role VARCHAR(255) NOT NULL DEFAULT 'user'";
        
        if ($mysqli->query($sql)) {
            echo "✓ Role column added successfully!\n\n";
        } else {
            echo "✗ Error: " . $mysqli->error . "\n";
            die();
        }
    } else {
        echo "✓ Role column already exists!\n\n";
    }
    
    // Now insert test users directly
    echo "Adding test users...\n";
    
    // Hash passwords (simple bcrypt)
    $adminPass = password_hash('admin', PASSWORD_BCRYPT);
    $userPass = password_hash('password', PASSWORD_BCRYPT);
    $testPass = password_hash('test123', PASSWORD_BCRYPT);
    
    // Delete existing users first
    $mysqli->query("DELETE FROM users WHERE email IN ('admin@wordpress.local', 'user@wordpress.local', 'test@wordpress.local')");
    
    // Insert admin user
    $sql = "INSERT INTO users (name, email, password, role, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())";
    $stmt = $mysqli->prepare($sql);
    
    $adminName = "Admin User";
    $adminEmail = "admin@wordpress.local";
    $adminRole = "admin";
    
    $stmt->bind_param("ssss", $adminName, $adminEmail, $adminPass, $adminRole);
    
    if ($stmt->execute()) {
        echo "✓ Admin user created: admin@wordpress.local / admin\n";
    } else {
        echo "✗ Error creating admin user: " . $stmt->error . "\n";
    }
    
    // Insert regular user
    $userName = "Test User";
    $userEmail = "user@wordpress.local";
    $userRole = "user";
    
    $stmt->bind_param("ssss", $userName, $userEmail, $userPass, $userRole);
    
    if ($stmt->execute()) {
        echo "✓ User created: user@wordpress.local / password\n";
    } else {
        echo "✗ Error creating user: " . $stmt->error . "\n";
    }
    
    // Insert test user
    $testName = "Test Account";
    $testEmail = "test@wordpress.local";
    $testRole = "user";
    
    $stmt->bind_param("ssss", $testName, $testEmail, $testPass, $testRole);
    
    if ($stmt->execute()) {
        echo "✓ Test user created: test@wordpress.local / test123\n";
    } else {
        echo "✗ Error creating test user: " . $stmt->error . "\n";
    }
    
    $stmt->close();
    
    echo "\n✓ Database setup complete!\n";
    echo "\nTest Credentials:\n";
    echo "  Admin: admin@wordpress.local / admin\n";
    echo "  User:  user@wordpress.local / password\n";
    echo "  Test:  test@wordpress.local / test123\n";
    
    $mysqli->close();
    
} catch (Exception $e) {
    echo "✗ Error: " . $e->getMessage() . "\n";
    exit(1);
}
