<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use App\Mail\PasswordResetMail;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required|min:6',
        ], [
            'email.required' => 'حقل البريد الإلكتروني مطلوب',
            'email.email' => 'البريد الإلكتروني يجب أن يكون صيغة بريد إلكترونية صحيحة',
            'password.required' => 'حقل كلمة المرور مطلوب',
            'password.min' => 'كلمة المرور يجب أن تكون 6 أحرف على الأقل',
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            return response()->json([
                'message' => 'بيانات الدخول غير صحيحة',
                
            ], 401);
        }

        return response()->json([
        'user' => [
            'id' => $user->id,
            'name' => $user->name,
            'username' => $user->username, // ✅ make sure this exists in DB
            'email' => $user->email,
            'role' => $user->role,
        ],
        'token' => $user->createToken('api-token')->plainTextToken,
    ]);
    }

    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'username' => 'required|string|max:255|unique:users',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6|confirmed',
        ], [
            'name.required' => 'حقل الاسم مطلوب',
            'name.string' => 'يجب أن يكون الاسم نصاً',
            'name.max' => 'الاسم يجب ألا يزيد عن 255 حرف',
            'username.required' => 'حقل اسم المستخدم مطلوب',
            'username.string' => 'يجب أن يكون اسم المستخدم نصاً',
            'username.max' => 'اسم المستخدم يجب ألا يزيد عن 255 حرف',
            'username.unique' => 'اسم المستخدم مأخوذ بالفعل',
            'email.required' => 'حقل البريد الإلكتروني مطلوب',
            'email.email' => 'البريد الإلكتروني يجب أن يكون صيغة بريد إلكترونية صحيحة',
            'email.unique' => 'البريد الإلكتروني مسجل بالفعل',
            'password.required' => 'حقل كلمة المرور مطلوب',
            'password.min' => 'كلمة المرور يجب أن تكون 6 أحرف على الأقل',
            'password.confirmed' => 'تأكيد كلمة المرور لا يطابق',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'username' => $validated['username'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => 'user',
        ]);

        return response()->json([
            'user' => $user,
            'token' => $user->createToken('api-token')->plainTextToken,
        ], 201);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully',
        ]);
    }

    public function profile(Request $request)
    {
        return response()->json($request->user());
    }

    public function forgotPassword(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
        ], [
            'email.required' => 'حقل البريد الإلكتروني مطلوب',
            'email.email' => 'البريد الإلكتروني يجب أن يكون صيغة بريد إلكترونية صحيحة',
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (!$user) {
            // Don't reveal if email exists for security
            return response()->json([
                'message' => 'إذا كان البريد الإلكتروني مسجلاً، سيتم إرسال رابط إعادة التعيين',
            ], 200);
        }

        // Generate reset token
        $token = Str::random(64);
        
        // Store token in database
        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $validated['email']],
            [
                'token' => Hash::make($token),
                'created_at' => now(),
            ]
        );

        // Generate reset URL
        $frontendUrl = env('FRONTEND_URL', env('APP_URL', 'http://localhost:3000'));
        $resetUrl = $frontendUrl . '/reset-password?token=' . $token . '&email=' . urlencode($validated['email']);

        // Send email
        try {
            $userName = $user->name ?? $validated['email'];
            /** @var \Illuminate\Contracts\Mail\Mailable $mailable */
            $mailable = new PasswordResetMail($resetUrl, $userName);
            Mail::to($validated['email'])->send($mailable);
        } catch (\Exception $e) {
            \Log::error('Failed to send password reset email: ' . $e->getMessage());
            return response()->json([
                'message' => 'حدث خطأ في إرسال البريد الإلكتروني. يرجى المحاولة لاحقاً.',
            ], 500);
        }

        return response()->json([
            'message' => 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني',
        ], 200);
    }

    public function resetPassword(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'token' => 'required|string',
            'password' => 'required|min:6|confirmed',
        ], [
            'email.required' => 'حقل البريد الإلكتروني مطلوب',
            'email.email' => 'البريد الإلكتروني يجب أن يكون صيغة بريد إلكترونية صحيحة',
            'token.required' => 'رمز إعادة التعيين مطلوب',
            'password.required' => 'حقل كلمة المرور مطلوب',
            'password.min' => 'كلمة المرور يجب أن تكون 6 أحرف على الأقل',
            'password.confirmed' => 'تأكيد كلمة المرور لا يطابق',
        ]);

        // Check if token exists and is valid (within 60 minutes)
        $resetRecord = DB::table('password_reset_tokens')
            ->where('email', $validated['email'])
            ->first();

        if (!$resetRecord) {
            return response()->json([
                'message' => 'رمز إعادة التعيين غير صحيح أو منتهي الصلاحية',
            ], 400);
        }

        // Check if token is expired (60 minutes)
        // Parse created_at timestamp and calculate minutes since creation
        $createdAt = \Illuminate\Support\Carbon::parse($resetRecord->created_at);
        // diffInMinutes with false parameter returns signed difference (negative if in future)
        // This ensures we correctly detect tokens created in the past
        $minutesSinceCreation = $createdAt->diffInMinutes(now(), false);
        
        if ($minutesSinceCreation > 60) {
            DB::table('password_reset_tokens')->where('email', $validated['email'])->delete();
            return response()->json([
                'message' => 'رمز إعادة التعيين منتهي الصلاحية. يرجى طلب رابط جديد',
            ], 400);
        }

        // Verify token
        if (!Hash::check($validated['token'], $resetRecord->token)) {
            return response()->json([
                'message' => 'رمز إعادة التعيين غير صحيح',
            ], 400);
        }

        // Update password
        $user = User::where('email', $validated['email'])->first();
        if (!$user) {
            return response()->json([
                'message' => 'المستخدم غير موجود',
            ], 404);
        }

        // Update password with proper hashing
        $user->password = Hash::make($validated['password']);
        
        // Refresh remember token for security (Laravel best practice)
        $user->remember_token = \Illuminate\Support\Str::random(60);
        
        $user->save();

        // Revoke all existing Sanctum tokens for security
        // This prevents old sessions from being used after password reset
        $user->tokens()->delete();

        // Delete reset token (prevents reuse)
        DB::table('password_reset_tokens')->where('email', $validated['email'])->delete();

        return response()->json([
            'message' => 'تم إعادة تعيين كلمة المرور بنجاح',
        ], 200);
    }
}
