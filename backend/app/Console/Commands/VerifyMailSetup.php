<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Schema;

class VerifyMailSetup extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'mail:verify';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Verify complete mail setup for password reset functionality';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('=== Mail Setup Verification ===');
        $this->newLine();

        $allGood = true;

        // 1. Check .env file exists
        $this->info('1. Checking .env file...');
        if (File::exists(base_path('.env'))) {
            $this->line('   ✅ .env file exists');
        } else {
            $this->error('   ❌ .env file missing! Copy .env.example to .env');
            $allGood = false;
        }
        $this->newLine();

        // 2. Check mail configuration
        $this->info('2. Checking mail configuration...');
        $mailer = Config::get('mail.default');
        $this->line('   Mailer: ' . $mailer);
        
        if ($mailer === 'log') {
            $this->warn('   ⚠️  MAIL_MAILER is set to "log". Emails will be logged, not sent.');
            $this->warn('   For production, set MAIL_MAILER=smtp in .env');
        } elseif ($mailer === 'smtp') {
            $this->line('   ✅ MAIL_MAILER is set to smtp');
            
            // Check SMTP settings
            $host = Config::get('mail.mailers.smtp.host');
            $port = Config::get('mail.mailers.smtp.port');
            $username = Config::get('mail.mailers.smtp.username');
            $password = Config::get('mail.mailers.smtp.password');
            $encryption = Config::get('mail.mailers.smtp.encryption');
            
            $this->line('   Host: ' . $host);
            $this->line('   Port: ' . $port);
            $this->line('   Encryption: ' . ($encryption ?? 'none'));
            
            if (empty($username) || $username === 'null') {
                $this->error('   ❌ MAIL_USERNAME not set');
                $allGood = false;
            } else {
                $this->line('   ✅ Username configured');
            }
            
            if (empty($password) || $password === 'null' || $password === 'your_sendgrid_api_key_here') {
                $this->error('   ❌ MAIL_PASSWORD not set or using placeholder');
                $allGood = false;
            } else {
                $this->line('   ✅ Password configured');
            }
            
            // Check SendGrid specific
            if ($host === 'smtp.sendgrid.net') {
                $this->line('   ✅ Using SendGrid');
                if ($username !== 'apikey') {
                    $this->warn('   ⚠️  For SendGrid, MAIL_USERNAME should be "apikey"');
                }
                if ($port != 587 && $port != 465) {
                    $this->warn('   ⚠️  SendGrid recommends port 587 (TLS) or 465 (SSL)');
                }
            }
        }
        
        $fromAddress = Config::get('mail.from.address');
        $fromName = Config::get('mail.from.name');
        $this->line('   From: ' . $fromName . ' <' . $fromAddress . '>');
        
        if ($fromAddress === 'hello@example.com' || $fromAddress === 'noreply@yourdomain.com') {
            $this->warn('   ⚠️  Using example email address. Update MAIL_FROM_ADDRESS in .env');
        } else {
            $this->line('   ✅ From address configured');
        }
        $this->newLine();

        // 3. Check config/mail.php exists
        $this->info('3. Checking config/mail.php...');
        if (File::exists(config_path('mail.php'))) {
            $this->line('   ✅ config/mail.php exists');
        } else {
            $this->error('   ❌ config/mail.php missing! Run: php artisan config:publish mail');
            $allGood = false;
        }
        $this->newLine();

        // 4. Check User model has Notifiable trait
        $this->info('4. Checking User model...');
        try {
            $reflection = new \ReflectionClass(User::class);
            $traits = $reflection->getTraitNames();
            
            if (in_array('Illuminate\\Notifications\\Notifiable', $traits)) {
                $this->line('   ✅ User model has Notifiable trait');
            } else {
                $this->error('   ❌ User model missing Notifiable trait');
                $allGood = false;
            }
        } catch (\Exception $e) {
            $this->error('   ❌ Cannot verify User model: ' . $e->getMessage());
            $allGood = false;
        }
        $this->newLine();

        // 5. Check PasswordResetMail mailable exists
        $this->info('5. Checking PasswordResetMail mailable...');
        if (class_exists('App\\Mail\\PasswordResetMail')) {
            $this->line('   ✅ PasswordResetMail class exists');
        } else {
            $this->error('   ❌ PasswordResetMail class not found');
            $allGood = false;
        }
        $this->newLine();

        // 6. Check password reset email view exists
        $this->info('6. Checking password reset email view...');
        $viewPath = resource_path('views/emails/password-reset.blade.php');
        if (File::exists($viewPath)) {
            $this->line('   ✅ Email view exists: emails.password-reset');
        } else {
            $this->error('   ❌ Email view missing: ' . $viewPath);
            $allGood = false;
        }
        $this->newLine();

        // 7. Check routes
        $this->info('7. Checking API routes...');
        try {
            $routes = app('router')->getRoutes();
            $hasReset = false;
            $hasForgot = false;
            
            foreach ($routes as $route) {
                if ($route->uri() === 'api/auth/reset-password') {
                    $hasReset = true;
                }
                if ($route->uri() === 'api/auth/forgot-password') {
                    $hasForgot = true;
                }
            }
            
            if ($hasForgot) {
                $this->line('   ✅ Forgot password route exists');
            } else {
                $this->error('   ❌ Forgot password route missing');
                $allGood = false;
            }
            
            if ($hasReset) {
                $this->line('   ✅ Reset password route exists');
            } else {
                $this->error('   ❌ Reset password route missing');
                $allGood = false;
            }
        } catch (\Exception $e) {
            $this->error('   ❌ Cannot verify routes: ' . $e->getMessage());
        }
        $this->newLine();

        // 8. Check FRONTEND_URL
        $this->info('8. Checking FRONTEND_URL...');
        $frontendUrl = env('FRONTEND_URL');
        if (empty($frontendUrl)) {
            $this->warn('   ⚠️  FRONTEND_URL not set in .env. Using APP_URL as fallback.');
        } else {
            $this->line('   ✅ FRONTEND_URL configured: ' . $frontendUrl);
        }
        $this->newLine();

        // Summary
        $this->info('=== Summary ===');
        if ($allGood) {
            $this->info('✅ All critical checks passed!');
            $this->newLine();
            
            if ($mailer === 'smtp') {
                $this->info('Ready to send emails via SMTP.');
                $this->info('Test with: php artisan email:test your-email@example.com');
            } else {
                $this->info('Mail is configured but using "' . $mailer . '" driver.');
                $this->info('For production, set MAIL_MAILER=smtp in .env');
            }
        } else {
            $this->error('❌ Some checks failed. Please fix the issues above.');
            return 1;
        }

        return 0;
    }
}
