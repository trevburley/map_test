<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Psy\Util\Json;

class ApiController extends Controller
{
    public function getMapCoords() : JsonResponse
    {
        $coords = [
            [
                'gps' => [-0.957996, 50.851143],
                'color' => '#bd0000'
            ],
            [
                'gps' => [-0.984861, 50.849422],
                'color' => '#bd0000'
            ]
        ];

        return response()->json($coords);
    }
}
