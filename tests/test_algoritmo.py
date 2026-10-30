import json
import math
import random

import pytest

from algoritmo import brute_force, closest_pair

def gerar(rng, n, hi):
    return [(rng.randint(0, hi), rng.randint(0, hi)) for _ in range(n)]

@pytest.mark.parametrize("seed", range(300))
def test_aleatorio_igual_forca_bruta(seed):
    rng = random.Random(seed)
    n = rng.randint(2, 80)
    hi = rng.choice([5, 20, 1000])  # intervalo pequeno => x repetidos e duplicados
    pts = gerar(rng, n, hi)
    bf = brute_force(pts)
    dc = closest_pair(pts, record=False)
    assert math.isclose(dc["distance"], bf["distance"], abs_tol=1e-9)
    i, j = dc["pair"]
    assert i != j
    assert math.isclose(math.dist(pts[i], pts[j]), dc["distance"], abs_tol=1e-9)

def test_dois_pontos():
    r = closest_pair([(0, 0), (3, 4)])
    assert r["pair"] == [0, 1]
    assert math.isclose(r["distance"], 5.0)

def test_tres_pontos():
    r = closest_pair([(0, 0), (10, 10), (11, 10)])
    assert r["pair"] == [1, 2]

def test_erro_com_menos_de_dois_pontos():
    with pytest.raises(ValueError):
        closest_pair([(1, 1)])
    with pytest.raises(ValueError):
        brute_force([])

def test_pontos_duplicados():
    r = closest_pair([(1, 1), (9, 9), (1, 1)])
    assert r["distance"] == 0
    assert r["pair"] == [0, 2]

def test_todos_com_mesmo_x():
    r = closest_pair([(5, 0), (5, 10), (5, 11), (5, 30)])
    assert math.isclose(r["distance"], 1.0)

def test_colineares_horizontais():
    pts = [(i * 3, 7) for i in range(50)] + [(61, 7)]
    r = closest_pair(pts)
    assert math.isclose(r["distance"], 1.0)  # 61 está a 1 de 60

def test_negativos_e_floats():
    pts = [(-1.5, -2.5), (4.2, 3.3), (-1.4, -2.5), (100, -100)]
    r = closest_pair(pts)
    assert r["pair"] == [0, 2]
    assert math.isclose(r["distance"], 0.1, abs_tol=1e-9)

def test_no_maximo_11_vizinhos_na_faixa():
    for seed in range(40):
        rng = random.Random(seed)
        pts = gerar(rng, 400, 10**6)
        assert closest_pair(pts, record=False)["max_neighbors"] <= 11

def test_eventos_consistentes():
    rng = random.Random(1)
    pts = gerar(rng, 60, 500)
    r = closest_pair(pts)
    ev = r["events"]
    assert ev[0]["type"] == "start" and ev[-1]["type"] == "done"
    comps = [e["comps"] for e in ev]
    assert comps == sorted(comps)
    assert comps[-1] == r["comparisons"]
    json.dumps(ev, allow_nan=False)  # falha se houver Infinity/NaN