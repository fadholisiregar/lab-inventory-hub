<!DOCTYPE html>
<html>
<head>
    <title>{{ $title }}</title>
</head>
<body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #0266a2;">{{ $title }}</h2>
        <p>{!! nl2br(e($messageBody)) !!}</p>
        <br>
        <p style="font-size: 12px; color: #777;">Email ini dikirim otomatis oleh sistem Lab Inventory Hub. Harap tidak membalas email ini.</p>
    </div>
</body>
</html>
