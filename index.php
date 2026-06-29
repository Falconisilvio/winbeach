<?php
session_start();

if (isset($_SESSION["user"])) {
    header("Location: dashboard.php");
    exit;
}

$error = "";

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $user = $_POST["user"] ?? "";
    $password = $_POST["password"] ?? "";

    // Demo login: admin / admin
    if ($user === "admin" && $password === "admin") {
        $_SESSION["user"] = $user;
        header("Location: dashboard.php");
        exit;
    } else {
        $error = "Utente o password non validi";
    }
}
?>
<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <title>Gestionale Spiaggia - Login</title>
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body class="login-page">
    <form method="post" class="login-box">
        <div class="login-logo">☀️ Spiaggia Manager</div>
        <h1>Accesso</h1>

        <?php if ($error !== ""): ?>
            <div class="error"><?= htmlspecialchars($error) ?></div>
        <?php endif; ?>

        <label>Utente</label>
        <input type="text" name="user" placeholder="admin" required>

        <label>Password</label>
        <input type="password" name="password" placeholder="admin" required>

        <button type="submit">Entra</button>

        <p class="demo-note">Demo: admin / admin</p>
    </form>
</body>
</html>
