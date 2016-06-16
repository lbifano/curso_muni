<?php
require_once __DIR__.'/vendor/autoload.php';

$app = new Silex\Application();

$blogPosts = array(
    1 => array(
        'date'      => '2011-03-29',
        'author'    => 'igorw',
        'title'     => 'Using Silex',
        'body'      => '...',
    ),
);

$app->get('/blog', function () use ($app,$blogPosts) {

    return $app->json($blogPosts,203);
});

$app->run();
