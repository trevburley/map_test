<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Psy\Util\Json;
use function Symfony\Component\String\b;

class ApiController extends Controller
{
    public function getMapCoords() : JsonResponse
    {
        $coords = [
            [
                'gps' => [-0.957996, 50.851143],
                'color' => '#bd0000',
                'speed' => 60,
                'destination' => [-1.110177, 50.870443]
            ],
            [
                'gps' => [-0.984861, 50.849422],
                'color' => '#00bd00',
                'speed' => 100,
                'destination' => [-0.8782872351977768, 50.968508234662664]
            ]
        ];

        return response()->json($coords);
    }
}
