from flask import Flask, render_template, request, jsonify
from time import perf_counter
from algoritmo import brute_force, closest_pair

import math
app = Flask(__name__)

def parse_points(payload):

    if not isinstance(payload, dict):
        raise ValueError("Payload inválido.")
    
    pts = payload.get("points")

    if not isinstance(pts, list) or not (2 <= len(pts) <= 200):
        raise ValueError("Quantidade de pontos inválida.")

    out = []

    for ponto in pts:
        if not isinstance(ponto, (list, tuple)) or len(ponto) != 2:
            raise ValueError("Cada ponto deve ser um par [x, y].")
            
        try:
            x = float(ponto[0])
            y = float(ponto[1])
        except (TypeError, ValueError):
            raise ValueError("Coordenadas devem ser numéricas.")

        if not (math.isfinite(x) and math.isfinite(y)):
            raise ValueError("Coordenadas devem ser números finitos.")
        
        out.append((x,y))

    return out

@app.get("/")
def index():
    return render_template("index.html")

@app.post("/api/solve")
def solve():
    try:
        pts = parse_points(request.get_json(silent=True)) # retorno lista de ponto do 'out'
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    # dc = dividir e conquistar
    t0 = perf_counter()

    dc_fast = closest_pair(pts, record=False) # não grava os passos do dividir e conquistar para gravar quanto tempo leva e comparar com a força bruta

    dc_time = (perf_counter() - t0) * 1000

    # bf = força bruta
    t0 = perf_counter()

    bf = brute_force(pts)

    bf_time = (perf_counter() - t0) * 1000

    dc_rec = closest_pair(pts, record=True)

    return {
        "dc": {
            "distance": dc_fast["distance"],
            "pair": dc_fast["pair"],
            "comparisons": dc_fast["comparisons"],
            "max_neighbors": dc_fast["max_neighbors"],
            "time_ms": dc_time
        },
        "brute": {
            "distance": bf["distance"],
            "pair": bf["pair"],
            "comparisons": bf["comparisons"],
            "time_ms": bf_time
        },
        "match": math.isclose(dc_fast["distance"], bf["distance"], abs_tol=1e-9),
        "events": dc_rec["events"]
    }
if __name__ == "__main__":
    app.run(debug=True)