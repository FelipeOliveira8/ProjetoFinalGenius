<?php
// Suprimir warnings e notices para não poluir o JSON
error_reporting(E_ALL & ~E_DEPRECATED & ~E_NOTICE);

// Definir header para resposta JSON
header('Content-Type: application/json; charset=utf-8');

// Autoload do Composer (ajuste caminho se necessário)
require __DIR__ . '/vendor/autoload.php';

// Cria app Slim 3
$app = new \Slim\App([
    'settings' => [
        'displayErrorDetails' => true, // mostra erros detalhados
    ]
]);

// Função para conectar no banco
function getDB() {
    $host = 'localhost';
    $dbname = 'genius_db';
    $usuario = 'root';
    $senha = '';

    try {
        $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $usuario, $senha);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        return $pdo;
    } catch (PDOException $e) {
        // Retorna erro em JSON e encerra execução
        echo json_encode(['found' => false, 'erro' => 'Erro na conexão: ' . $e->getMessage()]);
        exit;
    }
}

// Define rota GET /verifica_nome?nome=...
$app->get('/verifica_nome/', function ($request, $response, $args) {
    $params = $request->getQueryParams();
    $nome = isset($params['nome']) ? trim($params['nome']) : '';

    if ($nome === '') {
        return $response->withJson(['found' => false, 'erro' => 'Nome não enviado']);
    }

    $db = getDB();
    $sql = "SELECT usuario, pontuacao_maxima FROM users WHERE usuario = :nome";
    $stmt = $db->prepare($sql);
    $stmt->bindParam(':nome', $nome);
    $stmt->execute();

    $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($usuario) {
        return $response->withJson([
            'found' => true,
            'nome' => $usuario['usuario'],
            'record' => $usuario['pontuacao_maxima'] ?? 0
        ]);
    } else {
        return $response->withJson([
            'found' => false,
            'nome' => $nome
        ]);
    }
});


$app->post('/cadastrar_usuario/', function ($request, $response, $args) {
    try {
        $data = $request->getParsedBody();
        $nome = isset($data['nome']) ? trim($data['nome']) : '';

        if ($nome === '') {
            return $response->withJson(['success' => false, 'erro' => 'Nome não enviado']);
        }

        $db = getDB();
        $sql = "INSERT INTO users (usuario) VALUES (:nome)";
        $stmt = $db->prepare($sql);
        $stmt->bindParam(':nome', $nome);
        $stmt->execute();

        // Retorna sucesso e nome inserido
        return $response->withJson([
            'success' => true,
            'nome' => $nome
        ]);

    } catch (Exception $e) {
        return $response->withJson(['success' => false, 'erro' => $e->getMessage()], 500);
    }
});

$app->post('/atualizar_record/', function ($request, $response, $args) {
    $data = $request->getParsedBody();

    $nome = isset($data['nome']) ? trim($data['nome']) : '';
    $record = isset($data['record']) ? (int)$data['record'] : 0;

    if ($nome === '' || $record <= 0) {
        return $response->withJson(['success' => false, 'erro' => 'Parâmetros inválidos']);
    }

    try {
        $db = getDB();
        $sql = "UPDATE users SET pontuacao_maxima = :record WHERE usuario = :nome AND pontuacao_maxima < :record";
        $stmt = $db->prepare($sql);
        $stmt->bindParam(':record', $record, PDO::PARAM_INT);
        $stmt->bindParam(':nome', $nome);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            return $response->withJson(['success' => true]);
        } else {
            // Nenhuma linha atualizada (record atual já maior ou usuário não existe)
            return $response->withJson(['success' => false, 'msg' => 'Record não atualizado']);
        }
    } catch (Exception $e) {
        return $response->withJson(['success' => false, 'erro' => $e->getMessage()]);
    }
});

$app->get('/ranking', function ($request, $response, $args) {
    try {
        $db = getDB(); // Sua função de conexão com o banco

        $sql = "SELECT usuario, pontuacao_maxima FROM users WHERE pontuacao_maxima > 0 ORDER BY pontuacao_maxima DESC";
        $stmt = $db->prepare($sql);
        $stmt->execute();

        $resultados = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return $response->withHeader('Content-Type', 'application/json')
                        ->withStatus(200)
                        ->write(json_encode($resultados));
    } catch (Exception $e) {
        return $response->withHeader('Content-Type', 'application/json')
                        ->withStatus(500)
                        ->write(json_encode(['error' => $e->getMessage()]));
    }
});




// Roda o Slim app
$app->run();
