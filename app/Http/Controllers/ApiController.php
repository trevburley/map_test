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
        $iteration = rand(0,2);
        $coords1 = [
            [
                'gps' => [-0.957996, 50.851143],
                'color' => '#bd0000'
            ],
            [
                'gps' => [-0.984861, 50.849422],
                'color' => '#bd0000'
            ]
        ];

        $coords2 = [
            [
                'gps' => [-0.957996, 50.851143],
                'color' => '#00bd00'
            ],
            [
                'gps' => [-0.984861, 50.849422],
                'color' => '#00bd00'
            ]
        ];

        $coords3 = [
            [
                'gps' => [-0.957996, 50.851143],
                'color' => '#0000bd'
            ],
            [
                'gps' => [-0.984861, 50.849422],
                'color' => '#0000bd'
            ]
        ];

        $coords = match ($iteration) {
            0 => $coords1,
            1 => $coords2,
            2 => $coords3,
            default => $coords1,
        };

        return response()->json($coords);
    }
}
