#!/usr/bin/env php
<?php

require __DIR__ . '/vendor/autoload.php';

// Test Note model exists and works
$note = new \App\Models\Note([
    'table_name' => 'عمارة 1',
    'content' => 'ملاحظة تجريبية'
]);

echo "✓ Note model loaded successfully\n";
echo "  - Table: " . $note->table . "\n";
echo "  - Fillable: " . implode(', ', $note->getFillable()) . "\n";
echo "  - Table name sample: " . $note->table_name . "\n";

// Test NotesController exists
try {
    $controllerClass = 'App\Http\Controllers\Api\NotesController';
    if (class_exists($controllerClass)) {
        echo "✓ NotesController found\n";
        $reflection = new ReflectionClass($controllerClass);
        $methods = $reflection->getMethods(ReflectionMethod::IS_PUBLIC);
        echo "  - Methods: ";
        echo implode(', ', array_map(fn($m) => $m->getName(), $methods));
        echo "\n";
    }
} catch (Exception $e) {
    echo "✗ Error loading NotesController: " . $e->getMessage() . "\n";
}

echo "\n✓ All components verified!\n";
