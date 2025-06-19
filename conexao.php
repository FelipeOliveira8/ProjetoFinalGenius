<?php
$host = 'localhost';     
$usuario = 'root';       
$senha = '';            
$banco = 'genius_db';    

$conn = new mysqli($host, $usuario, $senha, $banco);

if ($conn->connect_error) {
    die("Erro na conexão: " . $conn->connect_error);
}

echo "Conexão bem-sucedida!";
?>
