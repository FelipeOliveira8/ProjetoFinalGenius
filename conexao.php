<?php
$host = 'nozomi.proxy.rlwy.net';  
$usuario = 'root';                
$senha = 'ZkJYKvXJEtukVmXvfRoXDgsevxebGiXC';  
$banco = 'railway';              
$porta = 13799;                  

$conn = new mysqli($host, $usuario, $senha, $banco, $porta);

if ($conn->connect_error) {
    die("Erro na conexão: " . $conn->connect_error);
}

echo "Conexão bem-sucedida!";
?>
