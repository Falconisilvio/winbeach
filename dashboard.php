<?php
session_start();

if (!isset($_SESSION["user"])) {
    header("Location: index.php");
    exit;
}

$page = $_GET["page"] ?? "home";

$menu = [
    "home" => "Dashboard",
    "spiaggia" => "Spiaggia",
    "booking" => "Prenotazioni",
    "clienti" => "Clienti",
    "tariffe" => "Tariffe",
    "cassa" => "Cassa",
    "statistiche" => "Statistiche",
    "impostazioni" => "Impostazioni"
];
?>
<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <title>Gestionale Spiaggia</title>
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body class="app-page">

<header class="topbar">
    <div class="brand">☀️ Spiaggia Manager <span>DEMO</span></div>
    <input class="search" type="text" placeholder="Ricerca cliente, postazione, voucher...">
    <a class="new-booking" href="?page=booking">+ Nuova prenotazione</a>
    <a class="logout" href="logout.php">Esci</a>
</header>

<div class="layout">
    <aside class="sidebar">
        <?php foreach ($menu as $key => $label): ?>
            <a href="?page=<?= $key ?>" class="<?= $page === $key ? "active" : "" ?>">
                <?= htmlspecialchars($label) ?>
            </a>
        <?php endforeach; ?>
    </aside>

    <main class="content">
        <?php
        if ($page === "spiaggia") {
            include "pages/spiaggia.php";
        } elseif ($page === "booking") {
            include "pages/booking.php";
        } else {
            include "pages/home.php";
        }
        ?>
    </main>
</div>

</body>
</html>
