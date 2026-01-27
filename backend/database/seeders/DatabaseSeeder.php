<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Table;
use App\Models\TableRow;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create admin user
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@wordpress.local',
            'password' => Hash::make('admin'),
            'role' => 'admin',
        ]);

        // Create regular user
        $user = User::create([
            'name' => 'Test User',
            'email' => 'user@wordpress.local',
            'password' => Hash::make('password'),
            'role' => 'user',
        ]);

        // Create sample table for user
        $table = Table::create([
            'user_id' => $user->id,
            'label' => 'جدول 1',
            'column_headers' => ['العمود 1', 'العمود 2', 'العمود 3', 'العمود 4'],
            'notes' => 'هذا جدول تجريبي للاختبار',
        ]);

        // Add sample rows
        for ($i = 1; $i <= 5; $i++) {
            TableRow::create([
                'table_id' => $table->id,
                'row_number' => $i,
                'row_data' => [
                    'البيان ' . $i,
                    'القيمة ' . ($i * 10),
                    'الحالة: نشط',
                    'ملاحظات عامة',
                ],
            ]);
        }

        // Create sample table for admin
        $adminTable = Table::create([
            'user_id' => $admin->id,
            'label' => 'جدول الإدارة',
            'column_headers' => ['المستخدم', 'عدد الجداول', 'آخر نشاط', 'الإجراءات'],
            'notes' => 'جدول خاص بإدارة المستخدمين',
        ]);

        // Add admin table rows
        TableRow::create([
            'table_id' => $adminTable->id,
            'row_number' => 1,
            'row_data' => [
                'admin@wordpress.local',
                '1',
                date('Y-m-d'),
                'عرض البيانات',
            ],
        ]);

        TableRow::create([
            'table_id' => $adminTable->id,
            'row_number' => 2,
            'row_data' => [
                'user@wordpress.local',
                '1',
                date('Y-m-d'),
                'عرض البيانات',
            ],
        ]);
    }
}
