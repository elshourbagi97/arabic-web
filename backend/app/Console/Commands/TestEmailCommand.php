<?php

namespace App\Console\Commands;

use App\Mail\PasswordResetMail;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Config;

class TestEmailCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'email:test {email? : Email address to send test to}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test email configuration by sending a password reset email';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('=== Email Configuration Test ===');
        $this->newLine();

        // Display current mail configuration
        $this->info('Current Mail Configuration:');
        $this->line('Mailer: ' . Config::get('mail.default'));
        $this->line('Host: ' . Config::get('mail.mailers.smtp.host'));
        $this->line('Port: ' . Config::get('mail.mailers.smtp.port'));
        $this->line('Encryption: ' . Config::get('mail.mailers.smtp.encryption', 'none'));
        $this->line('Username: ' . (Config::get('mail.mailers.smtp.username') ? '***' : 'not set'));
        $this->line('Password: ' . (Config::get('mail.mailers.smtp.password') ? '***' : 'not set'));
        $this->line('From Address: ' . Config::get('mail.from.address'));
        $this->line('From Name: ' . Config::get('mail.from.name'));
        $this->newLine();

        // Get email address
        $email = $this->argument('email') ?? $this->ask('Enter email address to send test to', 'test@example.com');

        // Generate test data
        $resetUrl = 'http://localhost:3000/reset-password?token=test123&email=' . urlencode($email);
        $userName = 'Test User';

        $this->info('Attempting to send password reset email to: ' . $email);

        try {
            Mail::to($email)->send(new PasswordResetMail($resetUrl, $userName));
            
            $this->newLine();
            $this->info('✅ Email sent successfully!');
            $this->newLine();
            
            if (Config::get('mail.default') === 'log') {
                $this->warn('Note: MAIL_MAILER is set to "log". Check storage/logs/laravel.log for email content.');
            }
            
            return 0;
        } catch (\Exception $e) {
            $this->newLine();
            $this->error('❌ Failed to send email!');
            $this->error('Error: ' . $e->getMessage());
            $this->newLine();
            $this->error('Stack trace:');
            $this->line($e->getTraceAsString());
            
            return 1;
        }
    }
}
