<?php
//Arquivo de conexão com o banco
$host = 'localhost';    // ou 127.0.0.1
$usuario = 'root';      // padrão do WAMP
$senha = '';            // normalmente sem senha
$banco = 'genius_db';  // nome do banco salvo no phpMyAdmin
           

$conn = new mysqli($host, $usuario, $senha, $banco);

if ($conn->connect_error) {
    die("Erro na conexão: " . $conn->connect_error);
}

echo "Conexão bem-sucedida!";
?>
