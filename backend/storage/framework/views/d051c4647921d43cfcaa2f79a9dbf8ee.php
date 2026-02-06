<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>إعادة تعيين كلمة المرور</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2 style="color: #333;">إعادة تعيين كلمة المرور</h2>
    <p>مرحباً <?php echo e($userName); ?>,</p>
    <p>تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك.</p>
    <p>انقر على الزر أدناه لإعادة تعيين كلمة المرور:</p>
    <p style="margin: 30px 0;">
        <a href="<?php echo e($resetUrl); ?>" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">إعادة تعيين كلمة المرور</a>
    </p>
    <p style="color: #666; font-size: 14px;">إذا لم تطلب إعادة التعيين، يمكنك تجاهل هذا البريد.</p>
    <p style="color: #666; font-size: 14px;">ينتهي صلاحية هذا الرابط خلال 60 دقيقة.</p>
</body>
</html>
<?php /**PATH /home/runner/work/arabic-web/arabic-web/backend/resources/views/emails/password-reset.blade.php ENDPATH**/ ?>